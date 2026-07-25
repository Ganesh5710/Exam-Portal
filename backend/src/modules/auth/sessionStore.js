"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearUserSession = exports.hasActiveSession = exports.getUserSession = exports.registerUserSession = exports.userActiveSessions = void 0;

const db_1 = require("../../database/db");
const logger_1 = require("../../config/logger");

// In-memory active candidate session store maps userId -> session details
const userActiveSessions = new Map();
exports.userActiveSessions = userActiveSessions;

// Session inactivity timeout: 30 minutes
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

/**
 * Checks if a candidate currently has an active, non-expired session on another device/browser.
 */
const hasActiveSession = (userId) => {
    if (!userId) return false;
    const session = userActiveSessions.get(userId);
    if (!session) return false;

    // If session has been inactive for over 30 minutes, consider it stale and clear it
    if (Date.now() - session.lastActive > INACTIVITY_TIMEOUT_MS) {
        userActiveSessions.delete(userId);
        return false;
    }

    return true;
};
exports.hasActiveSession = hasActiveSession;

/**
 * Registers an active candidate session token in the global store.
 */
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
    logger_1.logger.info(`Active session registered for user ${userId}: ${sessionToken}`);
    return sessionToken;
};
exports.registerUserSession = registerUserSession;

/**
 * Retrieves current active session data for a user.
 */
const getUserSession = (userId) => {
    return userActiveSessions.get(userId) || null;
};
exports.getUserSession = getUserSession;

/**
 * Clears and invalidates a user's active session token.
 */
const clearUserSession = async (userId) => {
    if (!userId) return;
    userActiveSessions.delete(userId);
    try {
        await db_1.prisma.refreshToken.updateMany({
            where: { userId },
            data: { revoked: true }
        });
        logger_1.logger.info(`Active session and refresh tokens cleared for user ${userId}`);
    } catch (err) {
        logger_1.logger.error(`Error clearing user session tokens: ${err.message}`);
    }
};
exports.clearUserSession = clearUserSession;
