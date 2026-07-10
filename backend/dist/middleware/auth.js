"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../database/db");
const logger_1 = require("../config/logger");
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super-secret-access-token-key-2026-portal';
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
    }
    if (!token) {
        return res.status(401).json({ success: false, message: 'Authentication required. Please login.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
        // Fetch complete user profile & verify status is active
        const user = await db_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                role: true,
                firstName: true,
                lastName: true,
                status: true,
                departmentId: true,
            }
        });
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not found or deleted.' });
        }
        if (user.status === 'BLOCKED') {
            return res.status(403).json({ success: false, message: 'Your account is blocked. Contact administrator.' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        logger_1.logger.debug(`JWT verification failed: ${error.message}`);
        return res.status(401).json({ success: false, message: 'Session expired or invalid token.' });
    }
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Forbidden. You do not have permissions for this action.'
            });
        }
        next();
    };
};
exports.restrictTo = restrictTo;
