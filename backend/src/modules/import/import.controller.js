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

        // Build the AI prompt - check DB systemSettings FIRST, then env var as fallback
        let geminiApiKey = null;
        try {
            const setting = await db_1.prisma.systemSettings.findUnique({
                where: { key: 'GEMINI_API_KEY' }
            });
            if (setting?.value && setting.value.trim()) {
                geminiApiKey = setting.value.trim();
            }
        } catch (_) {}

        if (!geminiApiKey) {
            geminiApiKey = process.env.GEMINI_API_KEY;
        }

        if (!geminiApiKey) {
            cleanup();
            return res.status(500).json({
                success: false,
                message: 'GEMINI_API_KEY is not set. Please add it in Admin → Settings.'
            });
        }

        const prompt = `You are an expert exam ingestion tool for Physics, Chemistry, and Mathematics (including JEE Main / Advanced questions). Your task is to parse EVERY SINGLE question from the uploaded document into clean, perfectly formatted structured data — without dropping, skipping, or altering any mathematical expressions.

STRICT FORMATTING RULES:

1. LaTeX Enclosure:
   - Wrap ALL mathematical expressions, symbols, fractions, square roots, calculus notation, matrices, and scientific notation in LaTeX delimiters.
   - Use $...$ for inline math and $$...$$ for display-level math.
   - Examples:
     - Fraction: $\\frac{1}{3}$, $-\\frac{2}{3}$
     - Square root: $\\sqrt{x^2 + y^2}$
     - Integral: $\\int_0^{\\pi} \\sin(x)\\,dx$
     - Limit: $\\lim_{x \\to 0} \\frac{\\sin x}{x}$
     - Derivative: $\\frac{d}{dx}(x^2) = 2x$

2. Matrix Preservation (CRITICAL — Never Flatten Matrices):
   - Render every matrix exactly as a grid using proper LaTeX environments.
   - Use \\begin{pmatrix}...\\end{pmatrix} for round-bracketed matrices.
   - Use \\begin{bmatrix}...\\end{bmatrix} for square-bracketed matrices.
   - Use \\begin{vmatrix}...\\end{vmatrix} for determinants.
   - Use & to separate columns, and \\\\ to separate rows.
   - Example 3×3 matrix: $\\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{bmatrix}$
   - NEVER flatten a matrix into plain text like "a b c / d e f / g h i".

3. Fraction Formatting:
   - Always use $\\frac{numerator}{denominator}$ — NEVER use "/" for math fractions.
   - Ordered pairs with fractions: $\\left(9, \\frac{1}{9}\\right)$

4. Options Alignment:
   - Preserve ALL 4 MCQ option choices (A, B, C, D) exactly as in the original document.
   - If an option contains a matrix, fraction, or complex expression, format it fully in LaTeX.
   - Example options array: ["$\\frac{1}{3}$", "$-\\frac{1}{3}$", "$\\frac{2}{3}$", "$\\frac{1}{6}$"]
   - Example matrix options: ["$\\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}$", "$\\begin{bmatrix} 0 & 1 \\\\ 1 & 0 \\end{bmatrix}$", ...]

5. Diagram / Image:
   - If a question references a diagram or figure, write "[Diagram: figure X]" in the content field.
   - Set "fileUrl": null unless an actual image URL is directly embedded.

6. answers field:
   - For MCQ: The answer must be the EXACT full text of the correct option (including LaTeX), as it appears in the options array.
   - Example: if option B is "$\\frac{1}{3}$", then "answers": ["$\\frac{1}{3}$"]

7. Output:
   - Return ONLY a raw JSON array. NO markdown fences. NO explanation text before or after.
   - Start your response with [ and end with ]

JSON Schema per question:
{
  "type": "MCQ" | "MULTI_CORRECT" | "TRUE_FALSE" | "FILL_BLANK" | "DESCRIPTIVE",
  "content": "Full question text with all math in LaTeX $...$ or $$...$$",
  "options": ["(A) option text", "(B) option text", "(C) option text", "(D) option text"],
  "answers": ["exact matching option text"],
  "explanation": "explanation or empty string",
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "score": 4,
  "negativeMarks": 1,
  "tags": ["Mathematics", "JEE"],
  "topic": "topic name",
  "fileUrl": null
}

EXTRACT EVERY QUESTION. DO NOT SKIP ANY. Start response with [`;

        let fullPrompt = prompt;
        if (!mediaData) {
            fullPrompt += `\n\nDocument content to extract from:\n\n${documentText}`;
        } else {
            fullPrompt += `\n\nAnalyze the attached document image/file directly and extract all questions from it.`;
        }
        fullPrompt += `\n]`;

        let questions = [];
        let lastAiError = '';
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
            lastAiError = aiErr.message;
            logger_1.logger.warn(`[extract] AI parse failed: ${aiErr.message}. Trying local fallback.`);
        }

        // Fallback local parsing if AI returned no questions
        if (questions.length === 0) {
            if (documentText && documentText.trim()) {
                questions = import_job_1.parseQuestionsLocally(documentText);
            }
        }

        if (questions.length === 0) {
            cleanup();
            return res.status(400).json({
                success: false,
                message: lastAiError
                  ? `Extraction Error: ${lastAiError}`
                  : 'No valid questions could be extracted from this file. Ensure your GEMINI_API_KEY is active and quota is available.'
            });
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
