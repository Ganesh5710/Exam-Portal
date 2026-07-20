"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDefaultSettings = exports.clearAllData = exports.updateSettings = exports.getSettings = void 0;
const bcryptjs_1 = require("bcryptjs");
const db_1 = require("../../database/db");
/**
 * Fetches all system configuration parameters from systemSettings table
 * and converts array records into a simple key-value keymap object.
 */
const getSettings = async (req, res, next) => {
    try {
        const settings = await db_1.prisma.systemSettings.findMany();
        // Convert array to simple key-value dictionary object
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});
        return res.status(200).json({ success: true, data: settingsMap });
    }
    catch (error) {
        next(error);
    }
};
exports.getSettings = getSettings;
const updateSettings = async (req, res, next) => {
    const updates = req.body; // Record<string, string>
    try {
        const keys = Object.keys(updates);
        if (keys.length === 0) {
            return res.status(400).json({ success: false, message: 'Settings payload is empty.' });
        }
        // Update settings sequentially without transaction for pooler compatibility
        for (const key of keys) {
            await db_1.prisma.systemSettings.upsert({
                where: { key },
                update: { value: String(updates[key]) },
                create: { key, value: String(updates[key]) }
            });
        }
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'UPDATE_SYSTEM_SETTINGS',
                target: `Keys: ${keys.join(', ')}`,
                ipAddress: req.ip
            }
        });
        return res.status(200).json({ success: true, message: 'System settings updated successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSettings = updateSettings;
const clearAllData = async (req, res, next) => {
    try {
        // Delete all dependent records in correct order
        await db_1.prisma.examQuestion.deleteMany({});
        await db_1.prisma.examAssignment.deleteMany({});
        await db_1.prisma.answer.deleteMany({});
        await db_1.prisma.submission.deleteMany({});
        await db_1.prisma.question.deleteMany({});
        await db_1.prisma.exam.deleteMany({});
        await db_1.prisma.refreshToken.deleteMany({});
        await db_1.prisma.passwordResetToken.deleteMany({});
        await db_1.prisma.emailVerificationToken.deleteMany({});
        await db_1.prisma.auditLog.deleteMany({});
        // Delete all non-admin users
        await db_1.prisma.user.deleteMany({
            where: {
                role: { not: 'ADMIN' }
            }
        });
        // Delete all departments
        await db_1.prisma.department.deleteMany({});
        // Reset admin password
        const adminEmail = req.user?.email;
        if (adminEmail) {
            const hash = await bcryptjs_1.hash('Admin@123', 10);
            await db_1.prisma.user.updateMany({
                where: { role: 'ADMIN' },
                data: { passwordHash: hash, loginAttempts: 0, lockUntil: null }
            });
        }
        return res.status(200).json({
            success: true,
            message: 'All data cleared successfully. Only admin account is preserved.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.clearAllData = clearAllData;
// Seed helper to trigger on server startup
const seedDefaultSettings = async () => {
    const defaults = [
        { key: 'INSTITUTION_NAME', value: 'SecureExam Tech University', description: 'Institution title branding' },
        { key: 'INSTITUTION_LOGO', value: '', description: 'Branding logo asset path' },
        { key: 'THEME', value: 'dark', description: 'Portal base theme' },
        { key: 'SMTP_HOST', value: 'smtp.mailtrap.io', description: 'Email server address' },
        { key: 'SMTP_PORT', value: '2525', description: 'Email server port' },
        { key: 'EXAM_PASS_PERCENT', value: '40', description: 'Global default passing threshold percentage' },
        { key: 'SESSION_TIMEOUT', value: '60', description: 'Session timeout in minutes' },
        { key: 'MAINTENANCE_MODE', value: 'false', description: 'Block student access if true' }
    ];
    try {
        for (const item of defaults) {
            const exist = await db_1.prisma.systemSettings.findUnique({ where: { key: item.key } });
            if (!exist) {
                await db_1.prisma.systemSettings.create({ data: item });
            }
        }
    }
    catch (err) {
        // Fail silently on early boot
    }
};
exports.seedDefaultSettings = seedDefaultSettings;
