"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDefaultSettings = exports.updateSettings = exports.getSettings = void 0;
const db_1 = require("../../database/db");
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
