import { Server, Socket } from 'socket.io';
import { prisma } from '../database/db';
import { logger } from '../config/logger';

interface StudentExamState {
  studentId: string;
  studentName: string;
  examId: string;
  currentQuestionIndex: number;
  remainingTime: number;
  internetStatus: 'online' | 'offline';
  fullscreenStatus: boolean;
  tabSwitchCount: number;
  exitFullscreenCount: number;
  faceStatus: 'normal' | 'look_away' | 'multiple_faces' | 'no_face';
  faceViolationCount: number;
  lastActive: number;
}

// Global in-memory cache for live tracking of exam progress
const activeSessions: Map<string, StudentExamState> = new Map();

export const initSocketHandler = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join admin feed
    socket.on('join-admin-monitor', () => {
      socket.join('admin-room');
      logger.info(`Socket ${socket.id} joined admin monitor feed.`);
      // Emit current live sessions to newly connected admin
      socket.emit('live-sessions-update', Array.from(activeSessions.values()));
    });

    // Student joins exam room
    socket.on('start-exam-session', async (data: { studentId: string; studentName: string; examId: string }) => {
      const { studentId, studentName, examId } = data;
      const roomName = `exam-${examId}`;
      socket.join(roomName);

      const sessionKey = `${examId}::${studentId}`;
      const initialSession: StudentExamState = {
        studentId,
        studentName,
        examId,
        currentQuestionIndex: 0,
        remainingTime: 0,
        internetStatus: 'online',
        fullscreenStatus: true,
        tabSwitchCount: 0,
        exitFullscreenCount: 0,
        faceStatus: 'normal',
        faceViolationCount: 0,
        lastActive: Date.now(),
      };

      activeSessions.set(sessionKey, initialSession);
      io.to('admin-room').emit('live-sessions-update', Array.from(activeSessions.values()));
      logger.info(`Student ${studentName} started exam session: ${examId}`);
    });

    // Student reports progress
    socket.on('report-progress', (data: {
      studentId: string;
      examId: string;
      currentQuestionIndex: number;
      remainingTime: number;
      internetStatus: 'online' | 'offline';
      fullscreenStatus: boolean;
      faceStatus?: 'normal' | 'look_away' | 'multiple_faces' | 'no_face';
    }) => {
      const { studentId, examId, currentQuestionIndex, remainingTime, internetStatus, fullscreenStatus, faceStatus } = data;
      const sessionKey = `${examId}::${studentId}`;

      const session = activeSessions.get(sessionKey);
      if (session) {
        session.currentQuestionIndex = currentQuestionIndex;
        session.remainingTime = remainingTime;
        session.internetStatus = internetStatus;
        session.fullscreenStatus = fullscreenStatus;
        if (faceStatus) {
          session.faceStatus = faceStatus;
        }
        session.lastActive = Date.now();

        activeSessions.set(sessionKey, session);
        io.to('admin-room').emit('live-sessions-update', Array.from(activeSessions.values()));
      }
    });

    // Student registers a security violation (tab-switch, fullscreen exit, face issues)
    socket.on('security-violation', async (data: {
      studentId: string;
      examId: string;
      violationType: 'TAB_SWITCH' | 'FULLSCREEN_EXIT' | 'OFFLINE' | 'FACE_LOOK_AWAY' | 'MULTIPLE_FACES' | 'NO_FACE_DETECTED';
      details: string;
    }) => {
      const { studentId, examId, violationType, details } = data;
      const sessionKey = `${examId}::${studentId}`;

      try {
        const assignment = await prisma.examAssignment.findUnique({
          where: { examId_studentId: { examId, studentId } }
        });

        if (assignment) {
          // Increment count in assignment record
          let updatedAssignment = assignment;
          if (violationType === 'TAB_SWITCH') {
            updatedAssignment = await prisma.examAssignment.update({
              where: { id: assignment.id },
              data: { tabSwitchCount: assignment.tabSwitchCount + 1 }
            });
          } else if (violationType === 'FULLSCREEN_EXIT') {
            updatedAssignment = await prisma.examAssignment.update({
              where: { id: assignment.id },
              data: { exitFullscreenCount: assignment.exitFullscreenCount + 1 }
            });
          }

          // Create Cheat Log
          const log = await prisma.cheatLog.create({
            data: {
              assignmentId: assignment.id,
              type: violationType,
              details
            }
          });

          // Sync in memory session cache
          const session = activeSessions.get(sessionKey);
          if (session) {
            session.tabSwitchCount = updatedAssignment.tabSwitchCount;
            session.exitFullscreenCount = updatedAssignment.exitFullscreenCount;
            if (['FACE_LOOK_AWAY', 'MULTIPLE_FACES', 'NO_FACE_DETECTED'].includes(violationType)) {
              session.faceViolationCount = (session.faceViolationCount || 0) + 1;
              session.faceStatus = violationType === 'FACE_LOOK_AWAY' ? 'look_away'
                : violationType === 'MULTIPLE_FACES' ? 'multiple_faces' : 'no_face';
            }
            session.lastActive = Date.now();
            activeSessions.set(sessionKey, session);
          }

          // Broadcast alert to admins
          io.to('admin-room').emit('violation-alert', {
            studentId,
            studentName: session?.studentName || 'Student',
            examId,
            type: violationType,
            totalTabSwitches: updatedAssignment.tabSwitchCount,
            totalFullscreenExits: updatedAssignment.exitFullscreenCount,
            totalFaceViolations: session?.faceViolationCount || 0,
            details,
            timestamp: log.timestamp
          });
          io.to('admin-room').emit('live-sessions-update', Array.from(activeSessions.values()));
        }
      } catch (err) {
        logger.error(`Error saving security violation: ${(err as Error).message}`);
      }
    });

    // Admin broadcasts time extension
    socket.on('extend-exam-time', (data: { examId: string; studentId: string; extensionMinutes: number }) => {
      const { examId, studentId, extensionMinutes } = data;
      logger.info(`Admin extending exam ${examId} for student ${studentId} by ${extensionMinutes}m`);

      // Emit event to student client specifically
      io.to('admin-room').emit('log-activity', `Extended exam for student by ${extensionMinutes} mins`);
      io.emit(`time-extended::${examId}::${studentId}`, { extensionMinutes });
    });

    // Admin terminates student exam session
    socket.on('terminate-exam-session', (data: { examId: string; studentId: string; reason: string }) => {
      const { examId, studentId, reason } = data;
      logger.warn(`Admin terminated exam ${examId} for student ${studentId}. Reason: ${reason}`);

      io.to('admin-room').emit('log-activity', `Force terminated exam session for student: ${reason}`);
      io.emit(`force-terminate::${examId}::${studentId}`, { reason });
    });

    // Admin broadcasts announcement
    socket.on('send-announcement', async (data: { examId: string; message: string; type: 'GENERAL' | 'WARNING' | 'EMERGENCY' }) => {
      const { examId, message, type } = data;

      try {
        const announcement = await prisma.announcement.create({
          data: {
            examId,
            message,
            type
          }
        });

        // Broadcast to specific exam room
        io.to(`exam-${examId}`).emit('announcement-broadcast', announcement);
        logger.info(`Announcement broadcasted to exam-${examId}: ${message}`);
      } catch (err) {
        logger.error(`Error broadcasting announcement: ${(err as Error).message}`);
      }
    });

    // Student completes/submits exam, clean up session
    socket.on('end-exam-session', (data: { studentId: string; examId: string }) => {
      const { studentId, examId } = data;
      const sessionKey = `${examId}::${studentId}`;
      activeSessions.delete(sessionKey);
      io.to('admin-room').emit('live-sessions-update', Array.from(activeSessions.values()));
      logger.info(`Exam session ended: ${sessionKey}`);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });
};
