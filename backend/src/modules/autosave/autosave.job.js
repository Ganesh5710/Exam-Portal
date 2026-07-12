"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAutosaveDatabaseSync = void 0;
const redis_1 = require("../../config/redis");
const db_1 = require("../../database/db");
const logger_1 = require("../../config/logger");
// Sync cache states from Redis to database
const runAutosaveDatabaseSync = async () => {
    // Skip silently if Redis is not connected (no-op with in-memory cache that has no sessions)
    if (!redis_1.isRedisConnected) {
        return; // Silent skip - no error log spam
    }
    try {
        // 1. Scan Redis keys for exam sessions
        const keys = await redis_1.redisClient.keys('exam:session::*');
        if (keys.length === 0) {
            return; // No sessions to sync - skip silently
        }
        let syncedCount = 0;
        for (const key of keys) {
            // Key format: exam:session::examId::studentId
            const parts = key.split('::');
            if (parts.length < 3)
                continue;
            const examId = parts[1];
            const studentId = parts[2];
            const cachedData = await redis_1.redisClient.get(key);
            if (!cachedData)
                continue;
            const sessionObj = JSON.parse(cachedData);
            const answersMap = sessionObj.answers || {}; // Record<questionId, studentAnswer>
            // 2. Fetch or create submission
            let submission = await db_1.prisma.submission.findUnique({
                where: { examId_studentId: { examId, studentId } }
            });
            if (!submission) {
                submission = await db_1.prisma.submission.create({
                    data: {
                        examId,
                        studentId,
                        status: 'PENDING'
                    }
                });
            }
            // 3. Sync answers in bulk transactions
            for (const questionId of Object.keys(answersMap)) {
                const studentAnswer = answersMap[questionId];
                await db_1.prisma.answer.upsert({
                    where: {
                        submissionId_questionId: {
                            submissionId: submission.id,
                            questionId
                        }
                    },
                    create: {
                        submissionId: submission.id,
                        questionId,
                        studentAnswer
                    },
                    update: {
                        studentAnswer
                    }
                });
            }
            syncedCount++;
        }
        if (syncedCount > 0) {
            logger_1.logger.info(`Autosave: Flushed progress for ${syncedCount} active candidate(s).`);
        }
    }
    catch (error) {
        // Log once and quietly - don't flood
        logger_1.logger.warn(`Autosave: Sync skipped (${error.message})`);
    }
};
exports.runAutosaveDatabaseSync = runAutosaveDatabaseSync;
