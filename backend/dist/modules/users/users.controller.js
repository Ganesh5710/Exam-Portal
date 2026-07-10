"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkImportStudents = exports.toggleBlockStudent = exports.deleteStudent = exports.updateStudent = exports.createStudent = exports.getStudents = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../../database/db");
const getStudents = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const departmentId = req.query.departmentId || '';
    const skip = (page - 1) * limit;
    try {
        const where = {
            role: 'STUDENT',
            OR: [
                { email: { contains: search } },
                { firstName: { contains: search } },
                { lastName: { contains: search } },
            ]
        };
        if (departmentId) {
            where.departmentId = departmentId;
        }
        const [students, total] = await db_1.prisma.$transaction([
            db_1.prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    status: true,
                    departmentId: true,
                    department: {
                        select: { name: true, code: true }
                    },
                    createdAt: true
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            db_1.prisma.user.count({ where })
        ]);
        return res.status(200).json({
            success: true,
            data: {
                students,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStudents = getStudents;
const createStudent = async (req, res, next) => {
    const { email, password, firstName, lastName, departmentId } = req.body;
    try {
        const existing = await db_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ success: false, message: 'Email already registered.' });
        }
        const passwordHash = await bcryptjs_1.default.hash(password || 'Student123!', 10);
        const student = await db_1.prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                departmentId: departmentId || null,
                role: 'STUDENT',
                status: 'ACTIVE'
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                status: true,
                departmentId: true,
                createdAt: true
            }
        });
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'CREATE_STUDENT',
                target: `Student ID: ${student.id} (${student.email})`,
                ipAddress: req.ip
            }
        });
        return res.status(201).json({ success: true, data: student });
    }
    catch (error) {
        next(error);
    }
};
exports.createStudent = createStudent;
const updateStudent = async (req, res, next) => {
    const { id } = req.params;
    const { firstName, lastName, departmentId, status } = req.body;
    try {
        const student = await db_1.prisma.user.findFirst({ where: { id, role: 'STUDENT' } });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }
        const updated = await db_1.prisma.user.update({
            where: { id },
            data: {
                firstName,
                lastName,
                departmentId: departmentId || null,
                status: status || student.status
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                status: true,
                departmentId: true
            }
        });
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'UPDATE_STUDENT',
                target: `Student ID: ${id}`,
                ipAddress: req.ip
            }
        });
        return res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
};
exports.updateStudent = updateStudent;
const deleteStudent = async (req, res, next) => {
    const { id } = req.params;
    try {
        const student = await db_1.prisma.user.findFirst({ where: { id, role: 'STUDENT' } });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }
        await db_1.prisma.user.delete({ where: { id } });
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'DELETE_STUDENT',
                target: `Student ID: ${id} (${student.email})`,
                ipAddress: req.ip
            }
        });
        return res.status(200).json({ success: true, message: 'Student deleted successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteStudent = deleteStudent;
const toggleBlockStudent = async (req, res, next) => {
    const { id } = req.params;
    try {
        const student = await db_1.prisma.user.findFirst({ where: { id, role: 'STUDENT' } });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }
        const newStatus = student.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
        await db_1.prisma.user.update({
            where: { id },
            data: { status: newStatus }
        });
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: newStatus === 'BLOCKED' ? 'BLOCK_STUDENT' : 'UNBLOCK_STUDENT',
                target: `Student ID: ${id}`,
                ipAddress: req.ip
            }
        });
        return res.status(200).json({ success: true, message: `Student status updated to ${newStatus}.` });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleBlockStudent = toggleBlockStudent;
const bulkImportStudents = async (req, res, next) => {
    const { students } = req.body; // Array of {email, firstName, lastName, departmentCode, password}
    if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ success: false, message: 'List of students is required.' });
    }
    try {
        let imported = 0;
        let skipped = 0;
        for (const record of students) {
            const { email, firstName, lastName, departmentCode, password } = record;
            const existing = await db_1.prisma.user.findUnique({ where: { email } });
            if (existing) {
                skipped++;
                continue;
            }
            let deptId = null;
            if (departmentCode) {
                const dept = await db_1.prisma.department.findUnique({ where: { code: departmentCode } });
                if (dept)
                    deptId = dept.id;
            }
            const passwordHash = await bcryptjs_1.default.hash(password || 'Student123!', 10);
            await db_1.prisma.user.create({
                data: {
                    email,
                    passwordHash,
                    firstName,
                    lastName,
                    departmentId: deptId,
                    role: 'STUDENT',
                    status: 'ACTIVE'
                }
            });
            imported++;
        }
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'BULK_IMPORT_STUDENTS',
                target: `Imported: ${imported}, Skipped: ${skipped}`,
                ipAddress: req.ip
            }
        });
        return res.status(200).json({
            success: true,
            message: `Bulk import complete. Imported: ${imported}, Skipped: ${skipped}`
        });
    }
    catch (error) {
        next(error);
    }
};
exports.bulkImportStudents = bulkImportStudents;
