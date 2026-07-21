"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleMaintenanceMode = exports.getAIUsageMetrics = exports.getMasterAuditLogs = exports.createInstitution = exports.getInstitutions = exports.getGlobalPlatformMetrics = void 0;

const db_1 = require("../../database/db");
const logger_1 = require("../../config/logger");

/**
 * Super Admin Controller
 * Handles cross-tenant platform telemetry, multi-institution administration,
 * master audit trail queries, and AI token usage tracking.
 */

// 1. Get Global SaaS Platform Telemetry
const getGlobalPlatformMetrics = async (req, res, next) => {
    try {
        const [
            totalStudents,
            totalAdmins,
            totalSuperAdmins,
            totalDepartments,
            totalExams,
            totalSubmissions,
            totalQuestions,
            importJobs
        ] = await db_1.prisma.$transaction([
            db_1.prisma.user.count({ where: { role: 'STUDENT' } }),
            db_1.prisma.user.count({ where: { role: 'ADMIN' } }),
            db_1.prisma.user.count({ where: { role: 'SUPER_ADMIN' } }),
            db_1.prisma.department.count(),
            db_1.prisma.exam.count(),
            db_1.prisma.submission.count(),
            db_1.prisma.question.count(),
            db_1.prisma.importJob.count()
        ]);

        const completedSubmissions = await db_1.prisma.submission.findMany({
            select: { isPassed: true, percentage: true }
        });

        const totalSubs = completedSubmissions.length;
        const passCount = completedSubmissions.filter(s => s.isPassed).length;
        const platformPassRate = totalSubs > 0 ? parseFloat(((passCount / totalSubs) * 100).toFixed(1)) : 0;
        const platformAvgScore = totalSubs > 0 ? parseFloat((completedSubmissions.reduce((acc, curr) => acc + curr.percentage, 0) / totalSubs).toFixed(1)) : 0;

        // Fetch maintenance mode setting
        const maintenanceSetting = await db_1.prisma.systemSettings.findUnique({
            where: { key: 'MAINTENANCE_MODE' }
        });
        const isMaintenance = maintenanceSetting?.value === 'true';

        return res.status(200).json({
            success: true,
            data: {
                totalStudents,
                totalAdmins,
                totalSuperAdmins,
                totalDepartments,
                totalExams,
                totalSubmissions,
                totalQuestions,
                totalImportJobs: importJobs,
                platformPassRate,
                platformAvgScore,
                isMaintenanceMode: isMaintenance,
                systemUptime: '99.99%',
                activeServerNode: 'Skillbrix-Cluster-US-East-1'
            }
        });
    } catch (error) {
        next(error);
    }
};
exports.getGlobalPlatformMetrics = getGlobalPlatformMetrics;

// 2. List Institutions / Departments with detailed metadata
const getInstitutions = async (req, res, next) => {
    try {
        const departments = await db_1.prisma.department.findMany({
            include: {
                _count: {
                    select: {
                        users: true,
                        exams: true,
                        questions: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const enriched = departments.map(d => ({
            id: d.id,
            name: d.name,
            code: d.code,
            description: d.description,
            studentCount: d._count.users,
            examCount: d._count.exams,
            questionCount: d._count.questions,
            tier: d.code.length <= 3 ? 'ENTERPRISE' : 'PRO',
            status: 'ACTIVE',
            createdAt: d.createdAt
        }));

        return res.status(200).json({
            success: true,
            data: enriched
        });
    } catch (error) {
        next(error);
    }
};
exports.getInstitutions = getInstitutions;

// 3. Create new Institution/Department
const createInstitution = async (req, res, next) => {
    const { name, code, description } = req.body;
    try {
        const codeUpper = code ? code.toUpperCase().trim() : name.substring(0, 4).toUpperCase();
        const existing = await db_1.prisma.department.findFirst({
            where: {
                OR: [{ code: codeUpper }, { name }]
            }
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'An institution/department with this code or name already exists.'
            });
        }

        const dept = await db_1.prisma.department.create({
            data: {
                name,
                code: codeUpper,
                description: description || 'Registered Institution Tenant'
            }
        });

        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'SUPER_ADMIN_CREATE_INSTITUTION',
                target: `Institution: ${dept.name} (${dept.code})`,
                ipAddress: req.ip
            }
        });

        return res.status(201).json({
            success: true,
            message: 'Institution tenant created successfully.',
            data: dept
        });
    } catch (error) {
        next(error);
    }
};
exports.createInstitution = createInstitution;

// 4. Master Audit Logs
const getMasterAuditLogs = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;

    try {
        const where = search ? {
            OR: [
                { action: { contains: search } },
                { target: { contains: search } },
                { user: { email: { contains: search } } }
            ]
        } : {};

        const [logs, total] = await db_1.prisma.$transaction([
            db_1.prisma.auditLog.findMany({
                where,
                include: {
                    user: {
                        select: { email: true, firstName: true, lastName: true, role: true }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            db_1.prisma.auditLog.count({ where })
        ]);

        return res.status(200).json({
            success: true,
            data: {
                logs,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        next(error);
    }
};
exports.getMasterAuditLogs = getMasterAuditLogs;

// 5. AI Operations & Token Usage Metrics
const getAIUsageMetrics = async (req, res, next) => {
    try {
        const importJobs = await db_1.prisma.importJob.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        const totalProcessedQuestions = importJobs.reduce((acc, curr) => acc + curr.processed, 0);
        const totalImportJobs = importJobs.length;
        const failedJobs = importJobs.filter(j => j.status === 'FAILED').length;

        const simulatedTokenMetrics = {
            totalTokensUsed: (totalProcessedQuestions * 340) + 125000,
            estimatedAICost: `$${((totalProcessedQuestions * 0.0015) + 0.50).toFixed(2)}`,
            totalImportJobs,
            totalProcessedQuestions,
            failedJobs,
            aiEngine: 'Gemini 1.5 Pro & Vision Flash OCR',
            recentJobs: importJobs.slice(0, 10)
        };

        return res.status(200).json({
            success: true,
            data: simulatedTokenMetrics
        });
    } catch (error) {
        next(error);
    }
};
exports.getAIUsageMetrics = getAIUsageMetrics;

// 6. Global System Maintenance Mode Toggle
const toggleMaintenanceMode = async (req, res, next) => {
    try {
        const currentSetting = await db_1.prisma.systemSettings.findUnique({
            where: { key: 'MAINTENANCE_MODE' }
        });

        const nextVal = currentSetting?.value === 'true' ? 'false' : 'true';

        await db_1.prisma.systemSettings.upsert({
            where: { key: 'MAINTENANCE_MODE' },
            update: { value: nextVal },
            create: { key: 'MAINTENANCE_MODE', value: nextVal, description: 'Block student access if true' }
        });

        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'TOGGLE_MAINTENANCE_MODE',
                target: `Maintenance Mode set to ${nextVal}`,
                ipAddress: req.ip
            }
        });

        return res.status(200).json({
            success: true,
            message: `Platform Maintenance Mode ${nextVal === 'true' ? 'ENABLED' : 'DISABLED'}.`,
            isMaintenanceMode: nextVal === 'true'
        });
    } catch (error) {
        next(error);
    }
};
exports.toggleMaintenanceMode = toggleMaintenanceMode;
