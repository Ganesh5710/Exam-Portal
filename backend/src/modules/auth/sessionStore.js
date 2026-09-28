"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearUserSession = exports.hasActiveSession = exports.getUserSession = exports.registerUserSession = exports.userActiveSessions = void 0;

const db_1 = require("../../database/db");
const logger_1 = require("../../config/logger");

const userActiveSessions = new Map();
exports.userActiveSessions = userActiveSessions;

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

const hasActiveSession = (userId) => {
    if (!userId) return false;
    const session = userActiveSessions.get(userId);
    if (!session) return false;

    if (Date.now() - session.lastActive > INACTIVITY_TIMEOUT_MS) {
        userActiveSessions.delete(userId);
        return false;
    }

    return true;
};
exports.hasActiveSession = hasActiveSession;

const registerUserSession = (userId, ipAddress, userAgent) => {
    const sessionToken = `sess_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const sessionData = {
        sessionToken,
        userId,
        loginTime: Date.now(),
        lastActive: Date.now(),
        ipAddress: ipAddress || '127.0.0.1',
        userAgent: userAgent || 'Unknown'
    };

    userActiveSessions.set(userId, sessionData);
    return sessionToken;
};
exports.registerUserSession = registerUserSession;

const getUserSession = (userId) => {
    return userActiveSessions.get(userId) || null;
};
exports.getUserSession = getUserSession;

const clearUserSession = async (userId) => {
    if (!userId) return;
    userActiveSessions.delete(userId);
    try {
        await db_1.prisma.refreshToken.updateMany({
            where: { userId },
            data: { revoked: true }
        });
    } catch (err) {
        logger_1.logger.error(`Error clearing user session tokens: ${err.message}`);
    }
};
exports.clearUserSession = clearUserSession;
