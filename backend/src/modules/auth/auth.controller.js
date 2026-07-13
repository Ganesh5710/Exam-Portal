"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.refresh = exports.login = exports.verifyOtp = exports.sendOtp = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../../database/db");
const logger_1 = require("../../config/logger");
const email_1 = require("../../utils/email");
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'super-secret-access-token-key-2026-portal';
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'super-secret-refresh-token-key-2026-portal';
const ACCESS_EXP = process.env.JWT_ACCESS_EXPIRATION || '15m';
const REFRESH_EXP = process.env.JWT_REFRESH_EXPIRATION || '7d';
const generateTokens = async (userId, email, role) => {
    const accessToken = jsonwebtoken_1.default.sign({ id: userId, email, role }, ACCESS_SECRET, { expiresIn: ACCESS_EXP });
    const refreshTokenString = jsonwebtoken_1.default.sign({ id: userId }, REFRESH_SECRET, { expiresIn: REFRESH_EXP });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    // Store refresh token in database
    const tokenRecord = await db_1.prisma.refreshToken.create({
        data: {
            token: refreshTokenString,
            userId,
            expiresAt,
        }
    });
    return { accessToken, refreshToken: refreshTokenString };
};
const login = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
        // Check account status and lock time
        if (user.status === 'BLOCKED') {
            return res.status(403).json({ success: false, message: 'Account blocked. Please contact administrator.' });
        }
        if (user.lockUntil && user.lockUntil > new Date()) {
            const waitTime = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
            return res.status(403).json({
                success: false,
                message: `Account is temporarily locked. Try again in ${waitTime} minute(s).`
            });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch) {
            // Increment login failures
            const attempts = user.loginAttempts + 1;
            let lockUntil = null;
            if (attempts >= 5) {
                lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
                logger_1.logger.warn(`User ${email} locked due to failed attempts`);
            }
            await db_1.prisma.user.update({
                where: { id: user.id },
                data: { loginAttempts: attempts, lockUntil }
            });
            return res.status(401).json({
                success: false,
                message: attempts >= 5
                    ? 'Account locked for 15 minutes due to too many failed attempts.'
                    : 'Invalid email or password.'
            });
        }
        // Reset login failures on success
        await db_1.prisma.user.update({
            where: { id: user.id },
            data: { loginAttempts: 0, lockUntil: null }
        });
        const { accessToken, refreshToken } = await generateTokens(user.id, user.email, user.role);
        // Save tokens in cookies (HTTPOnly for security)
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15m
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
        });
        // Create Audit Log
        await db_1.prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'USER_LOGIN',
                target: `User ID: ${user.id}`,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            }
        });
        return res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    departmentId: user.departmentId
                },
                accessToken,
                refreshToken
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const refresh = async (req, res, next) => {
    const { refreshToken: requestToken } = req.body;
    if (!requestToken) {
        return res.status(400).json({ success: false, message: 'Refresh token is required.' });
    }
    try {
        // Verify token exists and is valid
        const tokenRecord = await db_1.prisma.refreshToken.findUnique({
            where: { token: requestToken },
            include: { user: true }
        });
        if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
            return res.status(401).json({ success: false, message: 'Invalid or expired refresh token.' });
        }
        // Revoke old token (Refresh Token Rotation)
        await db_1.prisma.refreshToken.update({
            where: { id: tokenRecord.id },
            data: { revoked: true }
        });
        // Verify JWT payload
        const decoded = jsonwebtoken_1.default.verify(requestToken, REFRESH_SECRET);
        if (decoded.id !== tokenRecord.userId) {
            return res.status(401).json({ success: false, message: 'Token ownership mismatch.' });
        }
        const user = tokenRecord.user;
        if (user.status === 'BLOCKED') {
            return res.status(403).json({ success: false, message: 'User account is blocked.' });
        }
        // Generate new tokens
        const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user.id, user.email, user.role);
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000
        });
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
        return res.status(200).json({
            success: true,
            data: {
                accessToken,
                refreshToken: newRefreshToken
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.refresh = refresh;
const logout = async (req, res, next) => {
    const { refreshToken } = req.body;
    try {
        if (refreshToken) {
            // Invalidate token in Database
            await db_1.prisma.refreshToken.updateMany({
                where: { token: refreshToken },
                data: { revoked: true }
            });
        }
        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');
        return res.status(200).json({ success: true, message: 'Logout successful.' });
    }
    catch (error) {
        next(error);
    }
};
exports.logout = logout;
const sendOtp = async (req, res, next) => {
    const { email } = req.body;
    try {
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (user && user.role === 'ADMIN') {
            return res.status(400).json({ success: false, message: 'Administrators must log in using password credentials.' });
        }
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
        if (user) {
            await db_1.prisma.user.update({
                where: { id: user.id },
                data: { otp, otpExpiresAt }
            });
        } else {
            await db_1.prisma.user.create({
                data: {
                    email,
                    passwordHash: '',
                    firstName: email.split('@')[0],
                    lastName: '',
                    role: 'STUDENT',
                    status: 'ACTIVE',
                    otp,
                    otpExpiresAt
                }
            });
        }
        console.log(`[OTP Verification] Generated code ${otp} for ${email}`);
        const emailResult = await (0, email_1.sendEmail)({
            to: email,
            subject: 'Your Exam Portal OTP Verification Code',
            text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
            html: `<h3>Exam Portal Login</h3><p>Your verification code is: <strong>${otp}</strong></p><p>This code is valid for 5 minutes.</p>`
        });
        return res.status(200).json({
            success: true,
            message: 'Verification code sent to your email address.',
            // Return debugOtp in development or if SMTP failed for easy fallback access
            ...((process.env.NODE_ENV !== 'production' || !emailResult.success) ? { debugOtp: otp } : {})
        });
    }
    catch (error) {
        next(error);
    }
};
exports.sendOtp = sendOtp;
const verifyOtp = async (req, res, next) => {
    const { email, otp } = req.body;
    try {
        const user = await db_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid or unregistered email address.' });
        }
        if (!user.otp || !user.otpExpiresAt || user.otpExpiresAt < new Date()) {
            return res.status(401).json({ success: false, message: 'Verification code has expired or is invalid. Please request a new one.' });
        }
        if (user.otp !== otp) {
            return res.status(401).json({ success: false, message: 'Incorrect verification code.' });
        }
        // Clear OTP on successful validation
        await db_1.prisma.user.update({
            where: { id: user.id },
            data: { otp: null, otpExpiresAt: null, loginAttempts: 0, lockUntil: null }
        });
        const { accessToken, refreshToken } = await generateTokens(user.id, user.email, user.role);
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15m
        });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7d
        });
        // Create Audit Log
        await db_1.prisma.auditLog.create({
            data: {
                userId: user.id,
                action: 'USER_LOGIN',
                target: `User ID: ${user.id}`,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent']
            }
        });
        return res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    departmentId: user.departmentId
                },
                accessToken,
                refreshToken
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.verifyOtp = verifyOtp;
