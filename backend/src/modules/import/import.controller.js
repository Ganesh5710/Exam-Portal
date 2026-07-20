"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveImport = exports.cancelJob = exports.getJobStatus = exports.uploadImportFile = void 0;
const db_1 = require("../../database/db");
const import_job_1 = require("./import.job");
const logger_1 = require("../../config/logger");
// 1. Upload file and enqueue import job
const uploadImportFile = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a file.' });
    }
    try {
        // Create pending ImportJob entry
        const job = await db_1.prisma.importJob.create({
            data: {
                fileName: req.file.originalname,
                status: 'PENDING',
                progress: 0
            }
        });
        // Enqueue job to background queue
        await import_job_1.importQueue.add('parse-document', {
            jobId: job.id,
            filePath: req.file.path,
            mimeType: req.file.mimetype
        });
        return res.status(200).json({
            success: true,
            message: 'File uploaded successfully. Processing started in the background.',
            data: { jobId: job.id, fileName: job.fileName }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.uploadImportFile = uploadImportFile;
// 2. Fetch background job progress / status
const getJobStatus = async (req, res, next) => {
    const { id } = req.params;
    try {
        const job = await db_1.prisma.importJob.findUnique({
            where: { id }
        });
        if (!job) {
            return res.status(404).json({ success: false, message: 'Import job not found.' });
        }
        return res.status(200).json({
            success: true,
            data: {
                id: job.id,
                fileName: job.fileName,
                status: job.status,
                progress: job.progress,
                totalItems: job.totalItems,
                processed: job.processed,
                failed: job.failed,
                duplicates: job.duplicates,
                errorMessage: job.errorMessage,
                resultData: job.resultData ? JSON.parse(job.resultData) : null,
                createdAt: job.createdAt
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getJobStatus = getJobStatus;
// 3. Cancel background job
const cancelJob = async (req, res, next) => {
    const { id } = req.params;
    try {
        const job = await db_1.prisma.importJob.findUnique({ where: { id } });
        if (!job) {
            return res.status(404).json({ success: false, message: 'Import job not found.' });
        }
        if (job.status === 'PROCESSING' || job.status === 'PENDING') {
            await db_1.prisma.importJob.update({
                where: { id },
                data: { status: 'CANCELLED', progress: 100 }
            });
        }
        return res.status(200).json({ success: true, message: 'Job cancellation requested.' });
    }
    catch (error) {
        next(error);
    }
};
exports.cancelJob = cancelJob;
// 4. Batch Import approved questions with Prisma Transactions and Duplicate Resolution
/**
 * Batch processes user-approved questions from document import jobs.
 * Resolves target department IDs, handles duplicate actions (SKIP/REPLACE), and inserts in chunks of 500.
 */
const approveImport = async (req, res, next) => {
    const { id } = req.params;
    const { departmentId, questions, duplicateActions } = req.body;
    if (!departmentId || !Array.isArray(questions)) {
        return res.status(400).json({ success: false, message: 'departmentId and questions array are required.' });
    }
    try {
        const job = await db_1.prisma.importJob.findUnique({ where: { id } });
        if (!job) {
            return res.status(404).json({ success: false, message: 'Import job not found.' });
        }

        const deptCache = new Map();

        const allDepts = await db_1.prisma.department.findMany();
        allDepts.forEach(d => {
            deptCache.set(d.code.toUpperCase().trim(), d.id);
            deptCache.set(d.name.toLowerCase().trim(), d.id);
        });

        const resolveDepartmentId = async (q) => {
            if (departmentId !== 'auto-detect') {
                return departmentId;
            }

            const rawDept = q.departmentCode || q.department || 'General';
            const deptCode = rawDept.toUpperCase().trim();
            let resolvedDeptId = deptCache.get(deptCode) || deptCache.get(rawDept.toLowerCase().trim());

            if (!resolvedDeptId) {
                try {
                    const newDept = await db_1.prisma.department.create({
                        data: {
                            name: rawDept,
                            code: deptCode,
                            description: 'Auto-created during question import'
                        }
                    });
                    resolvedDeptId = newDept.id;
                    deptCache.set(deptCode, newDept.id);
                    deptCache.set(rawDept.toLowerCase().trim(), newDept.id);
                } catch (e) {
                    const existing = await db_1.prisma.department.findFirst({
                        where: { OR: [{ code: deptCode }, { name: rawDept }] }
                    });
                    if (existing) {
                        resolvedDeptId = existing.id;
                        deptCache.set(deptCode, existing.id);
                        deptCache.set(rawDept.toLowerCase().trim(), existing.id);
                    } else {
                        const firstDept = await db_1.prisma.department.findFirst();
                        resolvedDeptId = firstDept?.id;
                    }
                }
            }

            if (!resolvedDeptId) {
                try {
                    const fallbackDept = await db_1.prisma.department.create({
                        data: {
                            name: 'General',
                            code: 'GENERAL',
                            description: 'Fallback department for imported questions'
                        }
                    });
                    resolvedDeptId = fallbackDept.id;
                    deptCache.set('GENERAL', fallbackDept.id);
                } catch (e) {
                    const existing = await db_1.prisma.department.findUnique({ where: { code: 'GENERAL' } });
                    if (existing) {
                        resolvedDeptId = existing.id;
                    }
                }
            }

            return resolvedDeptId;
        };

        let processedCount = 0;
        let duplicatesCount = 0;
        let failedCount = 0;

        // Resolve all department IDs up front
        const questionsWithDept = [];
        for (const q of questions) {
            try {
                const qDeptId = await resolveDepartmentId(q);
                if (!qDeptId) { failedCount++; continue; }
                questionsWithDept.push({ ...q, _resolvedDeptId: qDeptId });
            } catch (e) { failedCount++; }
        }

        // Separate duplicates from new questions
        const toInsert = [];
        const toUpdate = [];

        for (const q of questionsWithDept) {
            const existing = await db_1.prisma.question.findFirst({
                where: { departmentId: q._resolvedDeptId, content: q.content }
            });
            if (existing) {
                const action = duplicateActions?.[q.content] || 'SKIP';
                if (action === 'SKIP') {
                    duplicatesCount++;
                } else if (action === 'REPLACE' || action === 'UPDATE') {
                    toUpdate.push({ existingId: existing.id, q });
                }
            } else {
                toInsert.push({
                    type: q.type,
                    content: q.content,
                    options: q.options || null,
                    answers: q.answers,
                    explanation: q.explanation || null,
                    score: parseFloat(q.score) || 5.0,
                    negativeMarks: parseFloat(q.negativeMarks) || 0.0,
                    difficulty: q.difficulty || 'MEDIUM',
                    tags: q.tags || [],
                    departmentId: q._resolvedDeptId
                });
            }
        }

        // Batch insert new questions in chunks of 500
        const chunkSize = 500;
        for (let i = 0; i < toInsert.length; i += chunkSize) {
            const chunk = toInsert.slice(i, i + chunkSize);
            try {
                const result = await db_1.prisma.question.createMany({ data: chunk, skipDuplicates: true });
                processedCount += result.count;
            } catch (e) {
                logger_1.logger.error(`Batch insert error: ${e.message}`);
                failedCount += chunk.length;
            }
        }

        // Handle updates individually (these are rare)
        for (const { existingId, q } of toUpdate) {
            try {
                await db_1.prisma.question.update({
                    where: { id: existingId },
                    data: {
                        options: q.options || null,
                        answers: q.answers,
                        explanation: q.explanation || null,
                        score: parseFloat(q.score) || 5.0,
                        negativeMarks: parseFloat(q.negativeMarks) || 0.0,
                        difficulty: q.difficulty || 'MEDIUM',
                        tags: q.tags || []
                    }
                });
                processedCount++;
            } catch (e) {
                logger_1.logger.error(`Update error: ${e.message}`);
                failedCount++;
            }
        }

        // Create Audit Log entry
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'BULK_QUESTION_IMPORT',
                target: `Job: ${job.fileName} | Imported: ${processedCount} | Duplicates: ${duplicatesCount} | Failed: ${failedCount}`,
                ipAddress: req.ip
            }
        });
        // Update final job metadata in database
        await db_1.prisma.importJob.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                processed: processedCount,
                duplicates: duplicatesCount,
                failed: failedCount
            }
        });
        return res.status(200).json({
            success: true,
            message: `Import completed. Imported: ${processedCount}, Duplicates: ${duplicatesCount}, Failed: ${failedCount}`
        });
    }
    catch (error) {
        next(error);
    }
};
exports.approveImport = approveImport;
