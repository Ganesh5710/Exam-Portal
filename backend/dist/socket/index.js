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
            const { studentId, studentName, examId, currentSection } = data;
            const roomName = `exam-${examId}`;
            socket.join(roomName);
            const sessionKey = `${examId}::${studentId}`;
            const initialSession = {
                studentId,
                studentName,
                examId,
                socketId: socket.id,
                currentQuestionIndex: 0,
                currentSection: currentSection || 'Section 1: Physics',
                candidateStatus: 'Active',
                audioLevelMeter: 'Normal (12 dB)',
                streamActive: true,
                remainingTime: data.remainingTime || 0,
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
            const { studentId, examId, currentQuestionIndex, currentSection, candidateStatus, audioLevelMeter, remainingTime, internetStatus, fullscreenStatus, faceStatus } = data;
            const sessionKey = `${examId}::${studentId}`;
            const session = activeSessions.get(sessionKey);
            if (session) {
                session.socketId = socket.id;
                session.currentQuestionIndex = currentQuestionIndex ?? session.currentQuestionIndex;
                if (currentSection) session.currentSection = currentSection;
                if (candidateStatus) session.candidateStatus = candidateStatus;
                if (audioLevelMeter) session.audioLevelMeter = audioLevelMeter;
                session.remainingTime = remainingTime ?? session.remainingTime;
                session.internetStatus = internetStatus ?? session.internetStatus;
                session.fullscreenStatus = fullscreenStatus ?? session.fullscreenStatus;
                if (faceStatus) session.faceStatus = faceStatus;
                session.lastActive = Date.now();
                activeSessions.set(sessionKey, session);
                io.to('admin-room').emit('live-sessions-update', Array.from(activeSessions.values()));
            }
        });
        // WebRTC Signaling Relay Events
        socket.on('webrtc-offer', (data) => {
            const { targetSocketId, offer, studentId } = data;
            if (targetSocketId) {
                io.to(targetSocketId).emit('webrtc-offer', { offer, senderSocketId: socket.id, studentId });
            } else {
                io.to('admin-room').emit('webrtc-offer', { offer, senderSocketId: socket.id, studentId });
            }
        });
        socket.on('webrtc-answer', (data) => {
            const { targetSocketId, answer } = data;
            if (targetSocketId) {
                io.to(targetSocketId).emit('webrtc-answer', { answer, senderSocketId: socket.id });
            }
        });
        socket.on('webrtc-candidate', (data) => {
            const { targetSocketId, candidate } = data;
            if (targetSocketId) {
                io.to(targetSocketId).emit('webrtc-candidate', { candidate, senderSocketId: socket.id });
            } else {
                io.to('admin-room').emit('webrtc-candidate', { candidate, senderSocketId: socket.id });
            }
        });
        socket.on('request-webrtc-stream', (data) => {
            const { studentSocketId } = data;
            if (studentSocketId) {
                io.to(studentSocketId).emit('admin-requested-stream', { adminSocketId: socket.id });
            }
        });
        socket.on('candidate-frame', (data) => {
            const { studentId, frame, quality } = data;
            // Use volatile emit so frames are dropped if buffer is busy, eliminating memory queuing
            socket.volatile.to('admin-room').emit('candidate-frame-broadcast', { studentId, frame, quality });
            socket.volatile.to('admin-room').emit(`candidate-frame::${studentId}`, { studentId, frame, quality });
        });
        // Admin controls video quality mode (LOW, STANDARD, MAX_HD)
        socket.on('set-video-quality', (data) => {
            const { quality, studentId } = data;
            if (studentId) {
                io.emit(`video-quality-mode::${studentId}`, { quality });
                io.to('admin-room').emit('video-quality-changed', { studentId, quality });
            } else {
                io.emit('video-quality-mode-global', { quality });
                io.to('admin-room').emit('video-quality-changed', { quality });
            }
            logger_1.logger.info(`Video quality mode changed to ${quality} for ${studentId || 'all candidates'}`);
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
        // Admin broadcasts announcement to all active candidates simultaneously
        socket.on('broadcast-global-announcement', (data) => {
            const { message, type } = data;
            logger_1.logger.info(`Global announcement broadcasted to all active candidates: ${message}`);
            io.emit('global-announcement', { message, type: type || 'GENERAL', timestamp: Date.now() });
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
        socket.on('disconnect', async () => {
            logger_1.logger.info(`Socket disconnected: ${socket.id}`);
            const sessionStore_1 = require('../modules/auth/sessionStore');
            for (const [key, session] of activeSessions.entries()) {
                if (session.socketId === socket.id) {
                    session.candidateStatus = 'Hardware Disconnected';
                    io.to('admin-room').emit('live-sessions-update', Array.from(activeSessions.values()));

                    // 15s grace period to distinguish F5 page refresh from actual tab closure
                    setTimeout(async () => {
                        const currentSession = activeSessions.get(key);
                        if (currentSession && currentSession.socketId === socket.id && (Date.now() - currentSession.lastActive >= 15000)) {
                            logger_1.logger.info(`Tab closed by candidate ${session.studentName} (${session.studentId}). Performing automatic session cleanup.`);
                            activeSessions.delete(key);
                            if (session.studentId) {
                                await sessionStore_1.clearUserSession(session.studentId);
                            }
                            io.to('admin-room').emit('live-sessions-update', Array.from(activeSessions.values()));
                        }
                    }, 15000);
                    break;
                }
            }
        });
    });
};
exports.initSocketHandler = initSocketHandler;
