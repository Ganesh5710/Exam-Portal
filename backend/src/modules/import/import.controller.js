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

        // ── PATH A: Instant Offline Mode (Header or Structured File) ──────────────
        const forceOffline = req.headers['x-offline-import'] === 'true' || req.body?.offline === 'true';
        if (forceOffline || ['.xlsx', '.xls', '.csv', '.json'].includes(ext)) {
            let questions = [];
            if (['.xlsx', '.xls', '.csv', '.json'].includes(ext)) {
                questions = import_job_1.parseStructuredFile(filePath, ext);
            } else {
                let docText = '';
                try { docText = await import_job_1.extractTextFromFile(filePath, mimeType); } catch (_) {}
                if (docText) questions = import_job_1.parseQuestionsLocally(docText);
            }
            if (questions && questions.length > 0) {
                cleanup();
                logger_1.logger.info(`[extract] Offline parse successful: ${questions.length} questions`);
                return res.status(200).json({
                    success: true,
                    data: { questions, source: 'offline' }
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

            // Always preserve extracted text if present
            documentText = extractedText || '';
            const fileBuffer = fs_1.readFileSync(filePath);
            mediaData = { mimeType: 'application/pdf', data: fileBuffer.toString('base64') };
        } else {
            documentText = await import_job_1.extractTextFromFile(filePath, mimeType);
        }

        // Build the AI prompt - check header/body override first, then DB systemSettings, then env var
        let geminiApiKey = req.headers['x-gemini-api-key'] || req.body?.apiKey || null;

        if (!geminiApiKey) {
            try {
                const setting = await db_1.prisma.systemSettings.findUnique({
                    where: { key: 'GEMINI_API_KEY' }
                });
                if (setting?.value && setting.value.trim()) {
                    geminiApiKey = setting.value.trim();
                }
            } catch (_) {}
        }

        if (!geminiApiKey) {
            geminiApiKey = process.env.GEMINI_API_KEY;
        }

        if (!geminiApiKey) {
            cleanup();
            return res.status(500).json({
                success: false,
                message: 'GEMINI_API_KEY is not set. Please enter your API Key or set it in Admin → Settings.'
            });
        }

        logger_1.logger.info(`[extract] Executing Gemini extraction using key prefix: ${geminiApiKey.substring(0, 10)}...`);

        const prompt = `You are an expert Optical Character Recognition (OCR) and LaTeX formatting engine for advanced Mathematics, Physics, and Chemistry exam papers.

Your task is to parse EVERY question from the uploaded document/image into a clean structured JSON array — without dropping, skipping, or altering any mathematical expression.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 RULE 1: MATHEMATICAL FORMULATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Matrices: Always render as full 2D arrays. NEVER flatten into a single line.
  Round brackets: $\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$
  Square brackets: $\\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$
  Determinant: $\\begin{vmatrix} a & b \\\\ c & d \\end{vmatrix}$

- Fractions: Always use $\\frac{numerator}{denominator}$. NEVER use "/" for math fractions.

- Square roots: $\\sqrt{x}$, nth roots: $\\sqrt[n]{x}$

- Integrals: $\\int_{a}^{b} f(x)\\,dx$, $\\int_{0}^{\\pi} \\sin(x)\\,dx$

- Limits: $\\lim_{x \\to 0} \\frac{\\sin x}{x}$

- Sums/Products: $\\sum_{i=1}^{n} i^2$, $\\prod_{k=1}^{n} k$

- Derivatives: $\\frac{d}{dx}(x^2) = 2x$, $\\frac{\\partial f}{\\partial x}$

- Subscripts & Superscripts: Always use curly braces for multi-character indices. e.g., $x^{10}$, $a_{ij}$, $e^{i\\pi}$

- Greek Letters & Symbols: $\\alpha$, $\\beta$, $\\gamma$, $\\theta$, $\\pi$, $\\Delta$, $\\Sigma$, $\\lambda$, $\\mu$, $\\omega$, $\\infty$, $\\vec{v}$, $\\hat{n}$

- Piecewise functions: Use $\\begin{cases} f_1(x) & \\text{if } x > 0 \\\\ f_2(x) & \\text{if } x \\leq 0 \\end{cases}$

- Multi-step equations: Use $\\begin{align*} eq1 \\\\ eq2 \\end{align*}$

- Ordered pairs: $\\left(9, \\frac{1}{9}\\right)$, $\\left(3, \\frac{1}{81}\\right)$

- Absolute values: $|x|$ or $\\left|\\frac{a}{b}\\right|$

- Vectors & dot products: $\\vec{A} \\cdot \\vec{B}$, $|\\vec{F}| = ma$

- Chemical formulas (Chemistry): $H_2O$, $CO_2$, $H_2SO_4$, reaction arrows: $\\rightarrow$, $\\rightleftharpoons$

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 RULE 2: OPTIONS & ANSWERS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Preserve ALL 4 MCQ option choices (A, B, C, D) exactly as in the original.
- Wrap all option math content in LaTeX $...$
- Prefix each option with "(A)", "(B)", "(C)", "(D)".
- Matrix option example: "(A) $\\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}$"
- Fraction option example: "(B) $\\frac{1}{3}$"
- Answer field: Return the EXACT full option string including the (A)/(B)/(C)/(D) prefix and its full LaTeX content.
  Example: "answers": ["(B) $\\frac{1}{3}$"]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🖼️ RULE 3: DIAGRAMS & IMAGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- If a question has a diagram, circuit, graph, or geometric figure, insert a placeholder in the content field:
  [Diagram: brief description of figure]
- Set "fileUrl": null

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 RULE 4: JSON OUTPUT SCHEMA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Return ONLY a raw JSON array. NO markdown fences. NO explanation text. Start with [ and end with ].

Each question object:
{
  "type": "MCQ",
  "content": "Full question text with all math in $...$",
  "options": ["(A) ...", "(B) ...", "(C) ...", "(D) ..."],
  "answers": ["(X) exact full option text as in options array"],
  "explanation": "",
  "difficulty": "MEDIUM",
  "score": 4,
  "negativeMarks": 1,
  "tags": ["Mathematics"],
  "topic": "Matrices / Calculus / Vectors / etc.",
  "fileUrl": null
}

EXTRACT EVERY SINGLE QUESTION. DO NOT SKIP ANY. Start your response with [`;

        let fullPrompt = prompt;
        if (!mediaData) {
            fullPrompt += `\n\nDocument content to extract from:\n\n${documentText}`;
        } else {
            fullPrompt += `\n\nAnalyze the attached document/image directly and extract ALL questions from it.`;
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

        // Fallback local parsing & smart paragraph chunking if AI returned no questions
        if (questions.length === 0) {
            let textToParse = documentText;
            if (!textToParse || !textToParse.trim()) {
                try {
                    const dataBuffer = fs_1.readFileSync(filePath);
                    const parsed = await pdf_parse_1.default(dataBuffer);
                    if (parsed.text && parsed.text.trim()) textToParse = parsed.text;
                } catch (_) {}
            }
            if (textToParse && textToParse.trim()) {
                logger_1.logger.info(`[extract] Running offline fallback question parsing...`);
                questions = import_job_1.parseQuestionsLocally(textToParse);
                if (questions.length === 0) {
                    const paragraphs = textToParse.split(/\n\s*\n/).map(p => p.trim()).filter(p => p.length > 10);
                    questions = paragraphs.map((p, idx) => ({
                        type: 'MCQ',
                        content: p,
                        options: ['(A) Option A', '(B) Option B', '(C) Option C', '(D) Option D'],
                        answers: ['(A) Option A'],
                        explanation: 'Extracted from document paragraph.',
                        difficulty: 'MEDIUM',
                        score: 4,
                        negativeMarks: 1,
                        tags: ['Extracted Document'],
                        topic: 'General'
                    }));
                }
            }
        }

        if (questions.length === 0) {
            cleanup();
            return res.status(400).json({
                success: false,
                message: lastAiError
                  ? lastAiError
                  : 'No valid questions could be extracted from this document.'
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
