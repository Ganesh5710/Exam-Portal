"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteSubject = exports.updateSubject = exports.createSubject = exports.getSubjects = void 0;
const db_1 = require("../../database/db");
const getSubjects = async (req, res, next) => {
    try {
        const subjects = await db_1.prisma.subject.findMany({
            include: {
                department: { select: { name: true, code: true } },
                _count: { select: { questions: true, exams: true } }
            },
            orderBy: { name: 'asc' }
        });
        return res.status(200).json({ success: true, data: subjects });
    }
    catch (error) {
        next(error);
    }
};
exports.getSubjects = getSubjects;
const createSubject = async (req, res, next) => {
    const { name, code, course, semester, departmentId } = req.body;
    try {
        const existing = await db_1.prisma.subject.findUnique({ where: { code } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Subject with this code already exists.' });
        }
        const subject = await db_1.prisma.subject.create({
            data: {
                name,
                code,
                course,
                semester: parseInt(semester),
                departmentId
            }
        });
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'CREATE_SUBJECT',
                target: `Subject ID: ${subject.id}`,
                ipAddress: req.ip
            }
        });
        return res.status(201).json({ success: true, data: subject });
    }
    catch (error) {
        next(error);
    }
};
exports.createSubject = createSubject;
const updateSubject = async (req, res, next) => {
    const { id } = req.params;
    const { name, code, course, semester, departmentId } = req.body;
    try {
        const sub = await db_1.prisma.subject.findUnique({ where: { id } });
        if (!sub) {
            return res.status(404).json({ success: false, message: 'Subject not found.' });
        }
        const existing = await db_1.prisma.subject.findFirst({
            where: {
                code,
                NOT: { id }
            }
        });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Subject with this code already exists.' });
        }
        const updated = await db_1.prisma.subject.update({
            where: { id },
            data: {
                name,
                code,
                course,
                semester: parseInt(semester),
                departmentId
            }
        });
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'UPDATE_SUBJECT',
                target: `Subject ID: ${id}`,
                ipAddress: req.ip
            }
        });
        return res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSubject = updateSubject;
const deleteSubject = async (req, res, next) => {
    const { id } = req.params;
    try {
        const sub = await db_1.prisma.subject.findUnique({ where: { id } });
        if (!sub) {
            return res.status(404).json({ success: false, message: 'Subject not found.' });
        }
        await db_1.prisma.subject.delete({ where: { id } });
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'DELETE_SUBJECT',
                target: `Subject ID: ${id} (${sub.name})`,
                ipAddress: req.ip
            }
        });
        return res.status(200).json({ success: true, message: 'Subject deleted successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSubject = deleteSubject;
