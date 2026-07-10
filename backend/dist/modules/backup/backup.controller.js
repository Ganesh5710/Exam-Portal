"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restoreBackup = exports.downloadBackup = exports.listBackups = exports.createBackup = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const db_1 = require("../../database/db");
const logger_1 = require("../../config/logger");
const backupDir = path_1.default.join(__dirname, '../../../backups');
if (!fs_1.default.existsSync(backupDir)) {
    fs_1.default.mkdirSync(backupDir, { recursive: true });
}
const createBackup = async (req, res, next) => {
    try {
        logger_1.logger.info('Database Backup: Starting export job.');
        // Fetch all database tables
        const [users, departments, subjects, questions, exams, examQuestions, examAssignments, submissions, answers, settings] = await db_1.prisma.$transaction([
            db_1.prisma.user.findMany(),
            db_1.prisma.department.findMany(),
            db_1.prisma.subject.findMany(),
            db_1.prisma.question.findMany(),
            db_1.prisma.exam.findMany(),
            db_1.prisma.examQuestion.findMany(),
            db_1.prisma.examAssignment.findMany(),
            db_1.prisma.submission.findMany(),
            db_1.prisma.answer.findMany(),
            db_1.prisma.systemSettings.findMany()
        ]);
        const backupPayload = {
            timestamp: new Date().toISOString(),
            data: {
                users,
                departments,
                subjects,
                questions,
                exams,
                examQuestions,
                examAssignments,
                submissions,
                answers,
                settings
            }
        };
        const fileName = `backup-${Date.now()}.json`;
        const targetPath = path_1.default.join(backupDir, fileName);
        fs_1.default.writeFileSync(targetPath, JSON.stringify(backupPayload, null, 2), 'utf8');
        logger_1.logger.info(`Database Backup: Successfully created backup ${fileName}`);
        return res.status(200).json({
            success: true,
            message: 'Database backup created successfully.',
            data: {
                fileName,
                size: fs_1.default.statSync(targetPath).size,
                createdAt: backupPayload.timestamp
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createBackup = createBackup;
const listBackups = async (req, res, next) => {
    try {
        const files = fs_1.default.readdirSync(backupDir);
        const backups = files
            .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
            .map(file => {
            const filePath = path_1.default.join(backupDir, file);
            const stats = fs_1.default.statSync(filePath);
            return {
                fileName: file,
                size: stats.size,
                createdAt: stats.mtime
            };
        })
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        return res.status(200).json({ success: true, data: backups });
    }
    catch (error) {
        next(error);
    }
};
exports.listBackups = listBackups;
const downloadBackup = async (req, res, next) => {
    const { fileName } = req.params;
    const filePath = path_1.default.join(backupDir, fileName);
    if (!fs_1.default.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'Backup file not found.' });
    }
    return res.download(filePath, fileName);
};
exports.downloadBackup = downloadBackup;
const restoreBackup = async (req, res, next) => {
    const { fileName } = req.body;
    const filePath = path_1.default.join(backupDir, fileName);
    if (!fs_1.default.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'Backup file not found.' });
    }
    try {
        logger_1.logger.info(`Database Restore: Initiating rollback to ${fileName}`);
        const backupContent = fs_1.default.readFileSync(filePath, 'utf8');
        const { data } = JSON.parse(backupContent);
        // Delete existing records in transaction to prevent constraint conflicts (dependent tables first)
        await db_1.prisma.$transaction([
            db_1.prisma.answer.deleteMany(),
            db_1.prisma.submission.deleteMany(),
            db_1.prisma.examAssignment.deleteMany(),
            db_1.prisma.examQuestion.deleteMany(),
            db_1.prisma.question.deleteMany(),
            db_1.prisma.exam.deleteMany(),
            db_1.prisma.subject.deleteMany(),
            db_1.prisma.department.deleteMany(),
            db_1.prisma.user.deleteMany(),
            db_1.prisma.systemSettings.deleteMany()
        ]);
        // Restore tables in dependencies order
        if (data.settings?.length)
            await db_1.prisma.systemSettings.createMany({ data: data.settings });
        if (data.departments?.length)
            await db_1.prisma.department.createMany({ data: data.departments });
        if (data.users?.length)
            await db_1.prisma.user.createMany({ data: data.users });
        if (data.subjects?.length)
            await db_1.prisma.subject.createMany({ data: data.subjects });
        if (data.questions?.length)
            await db_1.prisma.question.createMany({ data: data.questions });
        if (data.exams?.length)
            await db_1.prisma.exam.createMany({ data: data.exams });
        if (data.examQuestions?.length)
            await db_1.prisma.examQuestion.createMany({ data: data.examQuestions });
        if (data.examAssignments?.length)
            await db_1.prisma.examAssignment.createMany({ data: data.examAssignments });
        if (data.submissions?.length)
            await db_1.prisma.submission.createMany({ data: data.submissions });
        if (data.answers?.length)
            await db_1.prisma.answer.createMany({ data: data.answers });
        logger_1.logger.info(`Database Restore: Rollback completed successfully.`);
        return res.status(200).json({ success: true, message: 'Database successfully restored from backup.' });
    }
    catch (error) {
        next(error);
    }
};
exports.restoreBackup = restoreBackup;
