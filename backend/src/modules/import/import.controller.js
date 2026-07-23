"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.approveImport = exports.cancelJob = exports.getJobStatus = exports.uploadImportFile = exports.extractQuestions = void 0;

const db_1 = require("../../database/db");
const import_job_1 = require("./import.job");
const logger_1 = require("../../config/logger");
const gemini_1 = require("../../config/gemini");
const fs_1 = require("fs");
const path_1 = require("path");

/* ══════════════════════════════════════════════════════════
   NEW: Synchronous extract — upload → extract → return questions
   Called by POST /import/extract
══════════════════════════════════════════════════════════ */
const extractQuestions = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a file.' });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    const ext = path_1.extname(filePath).toLowerCase();

    const cleanup = () => {
        try { if (fs_1.existsSync(filePath)) fs_1.unlinkSync(filePath); } catch (_) {}
    };

    try {
        logger_1.logger.info(`[extract] Processing file: ${req.file.originalname} (${mimeType})`);

        // ── PATH A: Structured file (Excel / CSV / JSON) ──────────────
        if (['.xlsx', '.xls', '.csv', '.json'].includes(ext)) {
            const questions = import_job_1.parseStructuredFile(filePath, ext);
            if (questions && questions.length > 0) {
                cleanup();
                logger_1.logger.info(`[extract] Structured parse: ${questions.length} questions`);
                return res.status(200).json({
                    success: true,
                    data: { questions, source: 'structured' }
                });
            }
        }

        // ── PATH B: AI extraction for all other formats ──────────────
        let documentText = '';
        let mediaData = undefined;
        const isImage = mimeType.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.webp'].includes(ext);
        const isPdf = mimeType === 'application/pdf' || ext === '.pdf';

        if (isImage) {
            const fileBuffer = fs_1.readFileSync(filePath);
            let imageMime = 'image/jpeg';
            if (ext === '.png' || mimeType.includes('png')) imageMime = 'image/png';
            else if (ext === '.webp' || mimeType.includes('webp')) imageMime = 'image/webp';

            mediaData = { mimeType: imageMime, data: fileBuffer.toString('base64') };
            documentText = ''; // Send image directly to Gemini Vision!
        } else if (isPdf) {
            let extractedText = '';
            try {
                extractedText = await import_job_1.extractTextFromFile(filePath, mimeType);
            } catch (_) {}

            // Check if pdf-parse returned corrupted CID font garbage (e.g. 'Gau*c#G;gNof+M')
            const isGarbage = (text) => {
                if (!text || text.trim().length < 20) return true;
                const total = text.length;
                const weird = (text.match(/[\#\*\@\%\^\_\~\{\}\|\[\]\$\`\<\>]/g) || []).length;
                const alpha = (text.match(/[a-zA-Z0-9\s.,?!()\-+=\/]/g) || []).length;
                return (weird / total > 0.10) || (alpha / total < 0.60);
            };

            const fileBuffer = fs_1.readFileSync(filePath);
            mediaData = { mimeType: 'application/pdf', data: fileBuffer.toString('base64') };

            if (!isGarbage(extractedText)) {
                documentText = extractedText;
            } else {
                logger_1.logger.info(`[extract] PDF text contained font garble. Using Gemini Vision on PDF media directly.`);
                documentText = ''; // Send PDF directly to Gemini Vision!
            }
        } else {
            documentText = await import_job_1.extractTextFromFile(filePath, mimeType);
        }

        // Build the AI prompt - check env var first, then DB systemSettings as fallback
        let geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            try {
                const setting = await db_1.prisma.systemSettings.findUnique({
                    where: { key: 'GEMINI_API_KEY' }
                });
                if (setting?.value) geminiApiKey = setting.value;
            } catch (_) {}
        }
        if (!geminiApiKey) {
            cleanup();
            return res.status(500).json({
                success: false,
                message: 'GEMINI_API_KEY is not set. Please add it in Render → Environment Variables as GEMINI_API_KEY, or in Admin → Settings.'
            });
        }

        const prompt = `You are an expert exam ingestion tool for Physics, Chemistry, and Mathematics (including JEE Main / Advanced questions). Analyze the provided document carefully and extract ALL questions from it.

Rules:
- Extract every single question — do not skip any.
- Format all mathematical equations, fractions, square roots, matrices, determinants, transposes, ordered pairs, and scientific symbols cleanly using valid LaTeX syntax:
  - Matrices: \\begin{bmatrix} a & b & c \\\\ a & c & a \\\\ c & a & b \\end{bmatrix}
  - Fractions: \\frac{1}{3}, -\\frac{1}{3}, \\frac{2}{3}
  - Ordered Pairs / Tuples: \\left(9, \\frac{1}{9}\\right), \\left(3, \\frac{1}{81}\\right)
  - Equalities & Exponents: a^3 + b^3 + c^3 = 2, A^T A = I, x^2 + y^2 + z^2 = 1
- For MCQ: Include all 4 option choices accurately. Format option texts with LaTeX math formatting if options contain math fractions, matrices, or ordered pairs (e.g. ["3", "\\frac{1}{3}", "-\\frac{1}{3}", "\\frac{2}{3}"] or ["(3, 81)", "\\left(9, \\frac{1}{9}\\right)", "\\left(3, \\frac{1}{81}\\right)", "\\left(9, \\frac{1}{81}\\right)"]).
- If a question contains a diagram or figure reference, preserve it in the content text (e.g. "[Diagram attached: ...]").
- Return ONLY a raw JSON array. NO markdown fences, NO explanation text.

Schema per question object:
{
  "type": "MCQ" | "MULTI_CORRECT" | "TRUE_FALSE" | "FILL_BLANK" | "DESCRIPTIVE" | "CODING",
  "content": "Full question text with LaTeX math formulas and matrix formatting",
  "options": ["option1","option2","option3","option4"],
  "answers": ["correct option text"] OR "True"/"False" string for TRUE_FALSE,
  "explanation": "explanation text or empty string",
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "score": 5,
  "negativeMarks": 0,
  "tags": ["tag1","tag2"],
  "topic": "topic name or empty string",
  "fileUrl": "image/diagram url if present, otherwise null"
}

Return ONLY the JSON array. Start your response with [ and end with ].`;

        let fullPrompt = prompt;
        if (!mediaData) {
            fullPrompt += `\n\nDocument content to extract from:\n\n${documentText}`;
        }

        let questions = [];
        try {
            const result = await gemini_1.callGeminiWithFallback(geminiApiKey, { prompt: fullPrompt, mediaData });
            let text = result.text || '';
            // Strip markdown fences if present
            text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
            // Find the JSON array boundaries
            const startIdx = text.indexOf('[');
            const endIdx = text.lastIndexOf(']');
            if (startIdx !== -1 && endIdx !== -1) {
                text = text.slice(startIdx, endIdx + 1);
            }
            const parsed = JSON.parse(text);
            questions = Array.isArray(parsed) ? parsed : [parsed];
        } catch (aiErr) {
            logger_1.logger.warn(`[extract] AI parse failed: ${aiErr.message}. Trying local fallback.`);
        }

        // Fallback local parsing if AI returned no questions
        if (questions.length === 0) {
            if (!documentText || !documentText.trim()) {
                documentText = await import_job_1.extractTextFromFile(filePath, mimeType);
            }
            if (documentText && documentText.trim()) {
                questions = import_job_1.parseQuestionsLocally(documentText);
            }
        }

        // Validate & normalise each question
        questions = questions
            .filter(q => q && typeof q.content === 'string' && q.content.trim().length > 2)
            .map(q => {
                const validTypes = ['MCQ','MULTI_CORRECT','TRUE_FALSE','FILL_BLANK','DESCRIPTIVE','CODING'];
                const validDiffs = ['EASY','MEDIUM','HARD'];
                return {
                    type: validTypes.includes(q.type) ? q.type : 'MCQ',
                    content: q.content.trim(),
                    options: Array.isArray(q.options) ? q.options.map(String).filter(Boolean) : [],
                    answers: q.answers ?? [],
                    explanation: typeof q.explanation === 'string' ? q.explanation : '',
                    difficulty: validDiffs.includes(q.difficulty) ? q.difficulty : 'MEDIUM',
                    score: parseFloat(q.score) || 5,
                    negativeMarks: parseFloat(q.negativeMarks) || 0,
                    tags: Array.isArray(q.tags) ? q.tags.map(String) : [],
                    topic: typeof q.topic === 'string' ? q.topic : '',
                    subjectName: typeof q.subjectName === 'string' ? q.subjectName : (typeof q.subject === 'string' ? q.subject : ''),
                    subjectCode: typeof q.subjectCode === 'string' ? q.subjectCode : (typeof q.subjectName === 'string' ? q.subjectName : ''),
                    fileUrl: typeof q.fileUrl === 'string' ? q.fileUrl : (typeof q.imageUrl === 'string' ? q.imageUrl : null),
                };
            });

        cleanup();
        logger_1.logger.info(`[extract] AI extraction: ${questions.length} questions`);

        if (questions.length === 0) {
            return res.status(422).json({ success: false, message: 'File was uploaded but no readable questions or text could be extracted. Please check your file content or try an Excel (.xlsx) / Word (.docx) file.' });
        }

        return res.status(200).json({
            success: true,
            data: { questions, source: 'ai' }
        });

    } catch (error) {
        cleanup();
        logger_1.logger.error(`[extract] Error: ${error.message}`);
        next(error);
    }
};
exports.extractQuestions = extractQuestions;

/* ══════════════════════════════════════════════════════════
   LEGACY endpoints kept for backwards compatibility
══════════════════════════════════════════════════════════ */

// 1. Upload file and enqueue import job (legacy)
const uploadImportFile = async (req, res, next) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'Please upload a file.' });
    }
    try {
        const job = await db_1.prisma.importJob.create({
            data: {
                fileName: req.file.originalname,
                status: 'PENDING',
                progress: 0
            }
        });
        await import_job_1.importQueue.add('parse-document', {
            jobId: job.id,
            filePath: req.file.path,
            mimeType: req.file.mimetype
        });
        return res.status(200).json({
            success: true,
            message: 'File uploaded. Processing started.',
            data: { jobId: job.id, fileName: job.fileName }
        });
    } catch (error) {
        next(error);
    }
};
exports.uploadImportFile = uploadImportFile;

// 2. Get job status (legacy)
const getJobStatus = async (req, res, next) => {
    const { id } = req.params;
    try {
        const job = await db_1.prisma.importJob.findUnique({ where: { id } });
        if (!job) return res.status(404).json({ success: false, message: 'Import job not found.' });
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
    } catch (error) {
        next(error);
    }
};
exports.getJobStatus = getJobStatus;

// 3. Cancel job (legacy)
const cancelJob = async (req, res, next) => {
    const { id } = req.params;
    try {
        const job = await db_1.prisma.importJob.findUnique({ where: { id } });
        if (!job) return res.status(404).json({ success: false, message: 'Import job not found.' });
        if (job.status === 'PROCESSING' || job.status === 'PENDING') {
            await db_1.prisma.importJob.update({ where: { id }, data: { status: 'CANCELLED', progress: 100 } });
        }
        return res.status(200).json({ success: true, message: 'Job cancellation requested.' });
    } catch (error) {
        next(error);
    }
};
exports.cancelJob = cancelJob;

// 4. Approve import (legacy)
const approveImport = async (req, res, next) => {
    const { id } = req.params;
    const { departmentId, questions, duplicateActions } = req.body;
    if (!departmentId || !Array.isArray(questions)) {
        return res.status(400).json({ success: false, message: 'departmentId and questions array are required.' });
    }
    try {
        const job = await db_1.prisma.importJob.findUnique({ where: { id } });
        if (!job) return res.status(404).json({ success: false, message: 'Import job not found.' });

        const deptCache = new Map();
        const allDepts = await db_1.prisma.department.findMany();
        allDepts.forEach(d => {
            deptCache.set(d.code.toUpperCase().trim(), d.id);
            deptCache.set(d.name.toLowerCase().trim(), d.id);
        });

        const resolveDeptId = async (q) => {
            if (departmentId !== 'auto-detect') return departmentId;
            const rawDept = q.departmentCode || q.department || 'General';
            const deptCode = rawDept.toUpperCase().trim();
            let resolvedId = deptCache.get(deptCode) || deptCache.get(rawDept.toLowerCase().trim());
            if (!resolvedId) {
                try {
                    const nd = await db_1.prisma.department.create({ data: { name: rawDept, code: deptCode, description: 'Auto-created during import' } });
                    resolvedId = nd.id;
                    deptCache.set(deptCode, nd.id);
                } catch (_) {
                    const fd = await db_1.prisma.department.findFirst();
                    resolvedId = fd?.id;
                }
            }
            return resolvedId;
        };

        const subjCache = new Map();
        const allSubjs = await db_1.prisma.subject.findMany();
        allSubjs.forEach(s => {
            subjCache.set(s.code.toUpperCase().trim(), s.id);
            subjCache.set(s.name.toLowerCase().trim(), s.id);
        });

        const resolveSubjId = async (q, deptId) => {
            const rawSubj = (q.subjectName || q.subjectCode || q.subject || '').toString().trim();
            if (!rawSubj || rawSubj.toLowerCase() === 'auto' || rawSubj.toLowerCase() === 'null') return null;
            const cleanRaw = rawSubj.toLowerCase();
            const cleanUpper = rawSubj.toUpperCase();

            if (subjCache.has(cleanRaw)) return subjCache.get(cleanRaw);
            if (subjCache.has(cleanUpper)) return subjCache.get(cleanUpper);

            const matchedSubj = allSubjs.find(s => {
                const sName = s.name.toLowerCase();
                const sCode = s.code.toLowerCase();
                return sName === cleanRaw || sCode === cleanRaw ||
                       (cleanRaw.startsWith('math') && (sName.startsWith('math') || sCode.startsWith('math'))) ||
                       (cleanRaw.startsWith('phys') && (sName.startsWith('phys') || sCode.startsWith('phys'))) ||
                       (cleanRaw.startsWith('chem') && (sName.startsWith('chem') || sCode.startsWith('chem')));
            });

            if (matchedSubj) return matchedSubj.id;

            try {
                const codeKey = cleanUpper.replace(/[^A-Z0-9]/g, '').slice(0, 10) || 'SUBJ';
                const ns = await db_1.prisma.subject.create({
                    data: { name: rawSubj, code: `${codeKey}_${Date.now().toString().slice(-4)}`, departmentId: deptId }
                });
                allSubjs.push(ns);
                subjCache.set(cleanRaw, ns.id);
                return ns.id;
            } catch (_) {
                return null;
            }
        };

        let processedCount = 0, duplicatesCount = 0, failedCount = 0;
        const toInsert = [];

        for (const q of questions) {
            try {
                const deptId = await resolveDeptId(q);
                if (!deptId) { failedCount++; continue; }
                const subjId = await resolveSubjId(q, deptId);
                const existing = await db_1.prisma.question.findFirst({ where: { departmentId: deptId, content: q.content } });
                if (existing) {
                    const action = duplicateActions?.[q.content] || 'SKIP';
                    if (action !== 'SKIP') {
                        await db_1.prisma.question.update({ where: { id: existing.id }, data: { options: q.options || null, answers: q.answers, explanation: q.explanation || null, score: parseFloat(q.score) || 5, difficulty: q.difficulty || 'MEDIUM', tags: q.tags || [], subjectId: subjId || existing.subjectId } });
                        processedCount++;
                    } else {
                        duplicatesCount++;
                    }
                } else {
                    toInsert.push({ type: q.type, content: q.content, options: q.options || null, answers: q.answers, explanation: q.explanation || null, score: parseFloat(q.score) || 5, negativeMarks: parseFloat(q.negativeMarks) || 0, difficulty: q.difficulty || 'MEDIUM', tags: q.tags || [], departmentId: deptId, subjectId: subjId });
                }
            } catch (_) { failedCount++; }
        }

        for (let i = 0; i < toInsert.length; i += 500) {
            try {
                const r = await db_1.prisma.question.createMany({ data: toInsert.slice(i, i + 500), skipDuplicates: true });
                processedCount += r.count;
            } catch (_) { failedCount += 500; }
        }

        await db_1.prisma.importJob.update({ where: { id }, data: { status: 'COMPLETED', processed: processedCount, duplicates: duplicatesCount, failed: failedCount } });
        return res.status(200).json({ success: true, message: `Import completed. Saved: ${processedCount}, Duplicates: ${duplicatesCount}, Failed: ${failedCount}` });
    } catch (error) {
        next(error);
    }
};
exports.approveImport = approveImport;
