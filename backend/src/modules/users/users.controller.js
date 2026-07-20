"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importStudentsFile = exports.bulkDeleteStudents = exports.bulkImportStudents = exports.toggleBlockStudent = exports.deleteStudent = exports.updateStudent = exports.createStudent = exports.getStudents = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../../database/db");
const XLSX = require("xlsx");
const path = require("path");
const getStudents = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const departmentId = req.query.departmentId || '';
    const skip = (page - 1) * limit;
    const all = req.query.all === 'true';
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
        const findOptions = {
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
            orderBy: { createdAt: 'desc' }
        };
        if (!all) {
            findOptions.skip = skip;
            findOptions.take = limit;
        }
        const [students, total] = await db_1.prisma.$transaction([
            db_1.prisma.user.findMany(findOptions),
            db_1.prisma.user.count({ where })
        ]);
        return res.status(200).json({
            success: true,
            data: {
                students,
                pagination: {
                    page: all ? 1 : page,
                    limit: all ? total : limit,
                    total,
                    pages: all ? 1 : Math.ceil(total / limit)
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
        const passwordHash = await bcryptjs_1.default.hash(password || 'user@123', 10);
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
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ success: false, message: 'List of students is required.' });
    }
    try {
        const emails = students.map(s => s.email).filter(Boolean);
        // 1. Batch select existing emails in a single query
        const existingUsers = await db_1.prisma.user.findMany({
            where: { email: { in: emails } },
            select: { email: true }
        });
        const existingEmails = new Set(existingUsers.map(u => u.email));
        // 2. Fetch all departments to map codes
        const departments = await db_1.prisma.department.findMany();
        const deptMap = new Map(departments.map(d => [d.code.toUpperCase().trim(), d.id]));
        const deptNameMap = new Map(departments.map(d => [d.name.toLowerCase().trim(), d.id]));

        // Auto-create missing departments if referenced in CSV
        const missingDepts = new Set();
        for (const record of students) {
            const { departmentCode } = record;
            if (departmentCode && departmentCode.trim()) {
                const codeUpper = departmentCode.toUpperCase().trim();
                const nameLower = departmentCode.toLowerCase().trim();
                if (!deptMap.has(codeUpper) && !deptNameMap.has(nameLower)) {
                    missingDepts.add(departmentCode.trim());
                }
            }
        }

        for (const deptName of missingDepts) {
            const codeUpper = deptName.toUpperCase();
            try {
                const createdDept = await db_1.prisma.department.create({
                    data: {
                        name: deptName,
                        code: codeUpper,
                        description: `Automatically created during student import`
                    }
                });
                deptMap.set(codeUpper, createdDept.id);
                deptNameMap.set(deptName.toLowerCase(), createdDept.id);
            } catch (err) {
                const existing = await db_1.prisma.department.findFirst({
                    where: {
                        OR: [
                            { code: codeUpper },
                            { name: deptName }
                        ]
                    }
                });
                if (existing) {
                    deptMap.set(codeUpper, existing.id);
                    deptNameMap.set(deptName.toLowerCase(), existing.id);
                }
            }
        }

        // 3. Pre-compute default password hash to avoid hashing it N times
        const defaultHash = await bcryptjs_1.default.hash('user@123', 10);
        const hashCache = new Map();
        hashCache.set('user@123', defaultHash);
        const newStudentsData = [];
        let skipped = 0;
        for (const record of students) {
            const { email, firstName, lastName, departmentCode, password } = record;
            if (!email) {
                skipped++;
                continue;
            }
            if (existingEmails.has(email)) {
                skipped++;
                continue;
            }
            let deptId = null;
            if (departmentCode && departmentCode.trim()) {
                const codeUpper = departmentCode.toUpperCase().trim();
                const nameLower = departmentCode.toLowerCase().trim();
                deptId = deptMap.get(codeUpper) || deptNameMap.get(nameLower) || null;
            }
            const pwd = password || 'user@123';
            let passwordHash = hashCache.get(pwd);
            if (!passwordHash) {
                passwordHash = await bcryptjs_1.default.hash(pwd, 10);
                hashCache.set(pwd, passwordHash);
            }
            newStudentsData.push({
                email,
                passwordHash,
                firstName: firstName || 'Student',
                lastName: lastName || '',
                departmentId: deptId,
                role: 'STUDENT',
                status: 'ACTIVE'
            });
        }
        // 4. Batch insert records in chunks of 500 to avoid PostgreSQL bind parameter limits
        let imported = 0;
        const chunkSize = 500;
        for (let i = 0; i < newStudentsData.length; i += chunkSize) {
            const chunk = newStudentsData.slice(i, i + chunkSize);
            const result = await db_1.prisma.user.createMany({
                data: chunk
            });
            imported += result.count;
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
const bulkDeleteStudents = async (req, res, next) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
        return res.status(400).json({ success: false, message: 'Provide an array of student IDs.' });
    try {
        const { count } = await db_1.prisma.user.deleteMany({ where: { id: { in: ids }, role: 'STUDENT' } });
        return res.status(200).json({ success: true, message: `Deleted ${count} student(s).` });
    }
    catch (error) {
        next(error);
    }
};
exports.bulkDeleteStudents = bulkDeleteStudents;

/**
 * Parses uploaded Excel, CSV, or JSON candidate files.
 * Normalizes fuzzy column header titles, caches default password hashes, auto-creates missing departments,
 * and bulk inserts candidate users in chunks of 500.
 */
const importStudentsFile = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a file.' });
    }
    try {
        let students = [];
        const ext = path.extname(req.file.originalname).toLowerCase();
        if (ext === '.json') {
            try {
                const parsed = JSON.parse(req.file.buffer.toString('utf-8'));
                students = Array.isArray(parsed) ? parsed : (parsed.students || []);
            } catch (err) {
                return res.status(400).json({ success: false, message: 'Invalid JSON file format.' });
            }
        } else {
            try {
                const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                students = XLSX.utils.sheet_to_json(sheet);
            } catch (err) {
                return res.status(400).json({ success: false, message: 'Invalid file format. Please upload Excel or CSV.' });
            }
        }

        if (!Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ success: false, message: 'No student records found in the uploaded file.' });
        }

        const normalizedStudents = students.map(row => {
            const getKey = (names) => {
                const found = Object.keys(row).find(k => names.includes(k.toLowerCase().trim().replace(/[\s_-]/g, '')));
                return found ? row[found] : null;
            };

            const email = getKey(['email', 'emailaddress']);
            const firstName = getKey(['firstname', 'firstname', 'name', 'studentname'])?.toString() || 'Student';
            const lastName = getKey(['lastname', 'lastname'])?.toString() || '';
            const departmentCode = getKey(['departmentcode', 'department', 'deptcode', 'dept'])?.toString() || '';
            const password = getKey(['password'])?.toString() || 'user@123';

            return { email, firstName, lastName, departmentCode, password };
        }).filter(r => r.email && r.email.toString().includes('@'));

        if (normalizedStudents.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid student email addresses found in the file.' });
        }

        const emails = normalizedStudents.map(s => s.email.toString().trim()).filter(Boolean);
        const existingUsers = await db_1.prisma.user.findMany({
            where: { email: { in: emails } },
            select: { email: true }
        });
        const existingEmails = new Set(existingUsers.map(u => u.email));

        const departments = await db_1.prisma.department.findMany();
        const deptMap = new Map(departments.map(d => [d.code.toUpperCase().trim(), d.id]));
        const deptNameMap = new Map(departments.map(d => [d.name.toLowerCase().trim(), d.id]));

        const missingDepts = new Set();
        for (const record of normalizedStudents) {
            const { departmentCode } = record;
            if (departmentCode && departmentCode.trim()) {
                const codeUpper = departmentCode.toUpperCase().trim();
                const nameLower = departmentCode.toLowerCase().trim();
                if (!deptMap.has(codeUpper) && !deptNameMap.has(nameLower)) {
                    missingDepts.add(departmentCode.trim());
                }
            }
        }

        for (const deptName of missingDepts) {
            const codeUpper = deptName.toUpperCase();
            try {
                const createdDept = await db_1.prisma.department.create({
                    data: {
                        name: deptName,
                        code: codeUpper,
                        description: `Automatically created during student import`
                    }
                });
                deptMap.set(codeUpper, createdDept.id);
                deptNameMap.set(deptName.toLowerCase(), createdDept.id);
            } catch (err) {
                const existing = await db_1.prisma.department.findFirst({
                    where: {
                        OR: [
                            { code: codeUpper },
                            { name: deptName }
                        ]
                    }
                });
                if (existing) {
                    deptMap.set(codeUpper, existing.id);
                    deptNameMap.set(deptName.toLowerCase(), existing.id);
                }
            }
        }

        const defaultHash = await bcryptjs_1.default.hash('user@123', 10);
        const hashCache = new Map();
        hashCache.set('user@123', defaultHash);
        const newStudentsData = [];
        let skipped = 0;

        for (const record of normalizedStudents) {
            const { email, firstName, lastName, departmentCode, password } = record;
            if (!email) {
                skipped++;
                continue;
            }
            const emailStr = email.toString().trim();
            if (existingEmails.has(emailStr)) {
                skipped++;
                continue;
            }
            let deptId = null;
            if (departmentCode && departmentCode.trim()) {
                const codeUpper = departmentCode.toUpperCase().trim();
                const nameLower = departmentCode.toLowerCase().trim();
                deptId = deptMap.get(codeUpper) || deptNameMap.get(nameLower) || null;
            }
            const pwd = password ? password.toString().trim() : 'user@123';
            let passwordHash = hashCache.get(pwd);
            if (!passwordHash) {
                passwordHash = await bcryptjs_1.default.hash(pwd, 10);
                hashCache.set(pwd, passwordHash);
            }
            newStudentsData.push({
                email: emailStr,
                passwordHash,
                firstName: firstName.toString().trim(),
                lastName: lastName.toString().trim(),
                departmentId: deptId,
                role: 'STUDENT',
                status: 'ACTIVE'
            });
        }

        let imported = 0;
        const chunkSize = 500;
        for (let i = 0; i < newStudentsData.length; i += chunkSize) {
            const chunk = newStudentsData.slice(i, i + chunkSize);
            const result = await db_1.prisma.user.createMany({
                data: chunk
            });
            imported += result.count;
        }

        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'BULK_IMPORT_STUDENTS_FILE',
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
exports.importStudentsFile = importStudentsFile;
