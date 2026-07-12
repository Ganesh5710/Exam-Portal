"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketHandler = void 0;
const db_1 = require("../database/db");
const logger_1 = require("../config/logger");
// Global in-memory cache for live tracking of exam progress
const activeSessions = new Map();
const initSocketHandler = (io) => {
    io.on('connection', (socket) => {
        logger_1.logger.info(`Socket connected: ${socket.id}`);
        // Join admin feed
        socket.on('join-admin-monitor', () => {
            socket.join('admin-room');
            logger_1.logger.info(`Socket ${socket.id} joined admin monitor feed.`);
            // Emit current live sessions to newly connected admin
            socket.emit('live-sessions-update', Array.from(activeSessions.values()));
        });
        // Student joins exam room
        socket.on('start-exam-session', async (data) => {
            const { studentId, studentName, examId } = data;
            const roomName = `exam-${examId}`;
            socket.join(roomName);
            const sessionKey = `${examId}::${studentId}`;
            const initialSession = {
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
            logger_1.logger.info(`Student ${studentName} started exam session: ${examId}`);
        });
        // Student reports progress
        socket.on('report-progress', (data) => {
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
        socket.on('security-violation', async (data) => {
            const { studentId, examId, violationType, details } = data;
            const sessionKey = `${examId}::${studentId}`;
            try {
                const assignment = await db_1.prisma.examAssignment.findUnique({
                    where: { examId_studentId: { examId, studentId } }
                });
                if (assignment) {
                    // Increment count in assignment record
                    let updatedAssignment = assignment;
                    if (violationType === 'TAB_SWITCH') {
                        updatedAssignment = await db_1.prisma.examAssignment.update({
                            where: { id: assignment.id },
                            data: { tabSwitchCount: assignment.tabSwitchCount + 1 }
                        });
                    }
                    else if (violationType === 'FULLSCREEN_EXIT') {
                        updatedAssignment = await db_1.prisma.examAssignment.update({
                            where: { id: assignment.id },
                            data: { exitFullscreenCount: assignment.exitFullscreenCount + 1 }
                        });
                    }
                    // Create Cheat Log
                    const log = await db_1.prisma.cheatLog.create({
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
            }
            catch (err) {
                logger_1.logger.error(`Error saving security violation: ${err.message}`);
            }
        });
        // Admin broadcasts time extension
        socket.on('extend-exam-time', (data) => {
            const { examId, studentId, extensionMinutes } = data;
            logger_1.logger.info(`Admin extending exam ${examId} for student ${studentId} by ${extensionMinutes}m`);
            // Emit event to student client specifically
            io.to('admin-room').emit('log-activity', `Extended exam for student by ${extensionMinutes} mins`);
            io.emit(`time-extended::${examId}::${studentId}`, { extensionMinutes });
        });
        // Admin terminates student exam session
        socket.on('terminate-exam-session', (data) => {
            const { examId, studentId, reason } = data;
            logger_1.logger.warn(`Admin terminated exam ${examId} for student ${studentId}. Reason: ${reason}`);
            io.to('admin-room').emit('log-activity', `Force terminated exam session for student: ${reason}`);
            io.emit(`force-terminate::${examId}::${studentId}`, { reason });
        });
        // Admin broadcasts announcement
        socket.on('send-announcement', async (data) => {
            const { examId, message, type } = data;
            try {
                const announcement = await db_1.prisma.announcement.create({
                    data: {
                        examId,
                        message,
                        type
                    }
                });
                // Broadcast to specific exam room
                io.to(`exam-${examId}`).emit('announcement-broadcast', announcement);
                logger_1.logger.info(`Announcement broadcasted to exam-${examId}: ${message}`);
            }
            catch (err) {
                logger_1.logger.error(`Error broadcasting announcement: ${err.message}`);
            }
        });
        // Student completes/submits exam, clean up session
        socket.on('end-exam-session', (data) => {
            const { studentId, examId } = data;
            const sessionKey = `${examId}::${studentId}`;
            activeSessions.delete(sessionKey);
            io.to('admin-room').emit('live-sessions-update', Array.from(activeSessions.values()));
            logger_1.logger.info(`Exam session ended: ${sessionKey}`);
        });
        socket.on('disconnect', () => {
            logger_1.logger.info(`Socket disconnected: ${socket.id}`);
        });
    });
};
exports.initSocketHandler = initSocketHandler;
