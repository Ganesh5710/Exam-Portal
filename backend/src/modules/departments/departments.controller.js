"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteDepartment = exports.updateDepartment = exports.createDepartment = exports.getDepartments = void 0;
const db_1 = require("../../database/db");
const getDepartments = async (req, res, next) => {
    try {
        const departments = await db_1.prisma.department.findMany({
            include: {
                _count: {
                    select: { users: { where: { role: 'STUDENT' } }, exams: true, questions: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        return res.status(200).json({ success: true, data: departments });
    }
    catch (error) {
        next(error);
    }
};
exports.getDepartments = getDepartments;
const createDepartment = async (req, res, next) => {
    const { name, code, description } = req.body;
    try {
        const existing = await db_1.prisma.department.findFirst({
            where: {
                OR: [{ name }, { code }]
            }
        });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Department with this name or code already exists.' });
        }
        const dept = await db_1.prisma.department.create({
            data: { name, code, description }
        });
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'CREATE_DEPARTMENT',
                target: `Department ID: ${dept.id}`,
                ipAddress: req.ip
            }
        });
        return res.status(201).json({ success: true, data: dept });
    }
    catch (error) {
        next(error);
    }
};
exports.createDepartment = createDepartment;
const updateDepartment = async (req, res, next) => {
    const { id } = req.params;
    const { name, code, description } = req.body;
    try {
        const dept = await db_1.prisma.department.findUnique({ where: { id } });
        if (!dept) {
            return res.status(404).json({ success: false, message: 'Department not found.' });
        }
        const existing = await db_1.prisma.department.findFirst({
            where: {
                OR: [{ name }, { code }],
                NOT: { id }
            }
        });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Department with this name or code already exists.' });
        }
        const updated = await db_1.prisma.department.update({
            where: { id },
            data: { name, code, description }
        });
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'UPDATE_DEPARTMENT',
                target: `Department ID: ${id}`,
                ipAddress: req.ip
            }
        });
        return res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
};
exports.updateDepartment = updateDepartment;
const deleteDepartment = async (req, res, next) => {
    const { id } = req.params;
    try {
        const dept = await db_1.prisma.department.findUnique({ where: { id } });
        if (!dept) {
            return res.status(404).json({ success: false, message: 'Department not found.' });
        }
        await db_1.prisma.department.delete({ where: { id } });
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'DELETE_DEPARTMENT',
                target: `Department ID: ${id} (${dept.name})`,
                ipAddress: req.ip
            }
        });
        return res.status(200).json({ success: true, message: 'Department deleted successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteDepartment = deleteDepartment;
