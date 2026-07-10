"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importQueue = exports.processImportJob = exports.parseQuestionsWithAI = exports.extractTextFromFile = void 0;
// Queue-free import processor (no BullMQ/Redis dependency)
// @ts-ignore
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const mammoth_1 = __importDefault(require("mammoth"));
const xlsx = __importStar(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
const db_1 = require("../../database/db");
const logger_1 = require("../../config/logger");
const gemini_1 = require("../../config/gemini");
// 1. Text extraction helpers
const extractTextFromFile = async (filePath, mimeType) => {
    if (mimeType === 'text/plain' || mimeType === 'text/markdown' || filePath.endsWith('.md') || filePath.endsWith('.txt')) {
        return fs_1.default.readFileSync(filePath, 'utf8');
    }
    else if (mimeType === 'text/csv' || filePath.endsWith('.csv')) {
        return fs_1.default.readFileSync(filePath, 'utf8');
    }
    else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || filePath.endsWith('.docx')) {
        const result = await mammoth_1.default.extractRawText({ path: filePath });
        return result.value || '';
    }
    else if (mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || filePath.endsWith('.xlsx') || filePath.endsWith('.xls')) {
        const workbook = xlsx.readFile(filePath);
        let text = '';
        for (const name of workbook.SheetNames) {
            const sheet = workbook.Sheets[name];
            text += `\n--- Sheet: ${name} ---\n`;
            text += xlsx.utils.sheet_to_csv(sheet);
        }
        return text;
    }
    else if (mimeType === 'application/pdf' || filePath.endsWith('.pdf')) {
        const dataBuffer = fs_1.default.readFileSync(filePath);
        const parsed = await pdf_parse_1.default(dataBuffer);
        return parsed.text || '';
    }
    return '';
};
exports.extractTextFromFile = extractTextFromFile;
// 2. Call Gemini for parsing questions
const parseQuestionsWithAI = async (documentText, mediaData) => {
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        throw new Error('GEMINI_API_KEY is not configured in backend .env');
    }
    const prompt = `You are an expert exam ingestion tool. Analyze the provided document, extract all questions, and output a raw JSON array of question objects.
Ignore headers, footers, page numbers, and watermarks. Ignore duplicate questions.

Return questions matching this exact schema:
1. For MCQ:
   - "type": "MCQ"
   - "content": string (the question content, preserving mathematical formulas / special symbols)
   - "options": array of 4 choice strings
   - "answers": array of 1 string (matching exactly one of the options)
2. For MULTI_CORRECT:
   - "type": "MULTI_CORRECT"
   - "content": string
   - "options": array of choice strings
   - "answers": array of strings (correct options)
3. For TRUE_FALSE:
   - "type": "TRUE_FALSE"
   - "content": string
   - "options": ["True", "False"]
   - "answers": "True" or "False"
4. For FILL_BLANK:
   - "type": "FILL_BLANK"
   - "content": string (use "___" for the blank)
   - "options": []
   - "answers": array of acceptable answers
5. For DESCRIPTIVE:
   - "type": "DESCRIPTIVE"
   - "content": string
   - "options": []
   - "answers": string (answer key guidelines)
6. For CODING:
   - "type": "CODING"
   - "content": string (problem description and requirements)
   - "options": []
   - "answers": JSON object: {"testCases": [{"input": "string input", "expectedOutput": "expected output", "isHidden": false}, ...]}

Include in every question:
- "difficulty": "EASY", "MEDIUM", or "HARD" (detect if available, else guess)
- "score": number (suggested points, default: 5)
- "negativeMarks": number (default: 0)
- "explanation": string (answer explanation if available)
- "tags": array of strings
- "subjectCode": string (detect subject name or code if mentioned in headers/text, e.g. CS201)
- "topic": string (guess/detect topic name)

Return ONLY a JSON array of question objects. Do not write markdown blocks or explanations. Just return the JSON array.`;
    // Build the full prompt including document content
    let fullPrompt = prompt;
    if (!mediaData) {
        fullPrompt += `\n\nDocument content:\n${documentText}`;
    }
    const result = await (0, gemini_1.callGeminiWithFallback)(geminiApiKey, {
        prompt: fullPrompt,
        mediaData,
    });
    const parsed = JSON.parse(result.text);
    return Array.isArray(parsed) ? parsed : [parsed];
};
exports.parseQuestionsWithAI = parseQuestionsWithAI;
// 3. Main processing function for jobs
const processImportJob = async (jobId, filePath, mimeType) => {
    try {
        logger_1.logger.info(`Starting Import Job ${jobId} | File: ${filePath}`);
        // Update progress to 15% (Reading File)
        await db_1.prisma.importJob.update({
            where: { id: jobId },
            data: { status: 'PROCESSING', progress: 15 }
        });
        let documentText = '';
        let mediaData = undefined;
        // For scanned PDFs or images, we send Base64 directly to Gemini (handles OCR natively)
        const isImage = mimeType.startsWith('image/');
        const isPdf = mimeType === 'application/pdf';
        if (isImage || isPdf) {
            // Send directly as inlineData to Gemini for OCR & high-fidelity layout parsing
            await db_1.prisma.importJob.update({
                where: { id: jobId },
                data: { progress: 35 } // OCR / Image Load
            });
            const fileBuffer = fs_1.default.readFileSync(filePath);
            mediaData = {
                mimeType: mimeType,
                data: fileBuffer.toString('base64')
            };
        }
        else {
            // Extract text locally first (Word, Excel, MD, CSV)
            documentText = await (0, exports.extractTextFromFile)(filePath, mimeType);
            if (!documentText.trim()) {
                throw new Error('File is empty or could not be extracted locally.');
            }
        }
        // Update progress to 60% (Sending to AI Parser)
        await db_1.prisma.importJob.update({
            where: { id: jobId },
            data: { progress: 60 }
        });
        // Run AI extraction
        const extractedQuestions = await (0, exports.parseQuestionsWithAI)(documentText, mediaData);
        // Validate structure and clean questions list
        const validatedQuestions = extractedQuestions.map((q) => {
            const cleanQ = { ...q };
            cleanQ.type = ['MCQ', 'MULTI_CORRECT', 'TRUE_FALSE', 'FILL_BLANK', 'DESCRIPTIVE', 'CODING'].includes(q.type)
                ? q.type
                : 'MCQ';
            cleanQ.score = parseFloat(q.score) || 5.0;
            cleanQ.negativeMarks = parseFloat(q.negativeMarks) || 0.0;
            cleanQ.difficulty = ['EASY', 'MEDIUM', 'HARD'].includes(q.difficulty) ? q.difficulty : 'MEDIUM';
            cleanQ.tags = Array.isArray(q.tags) ? q.tags : [];
            // Perform AI validations
            cleanQ.validationWarnings = [];
            if (cleanQ.type === 'MCQ' && (!Array.isArray(cleanQ.options) || cleanQ.options.length < 2)) {
                cleanQ.validationWarnings.push('MCQ has less than 2 options.');
            }
            if (cleanQ.type === 'MCQ' && (!cleanQ.answers || (Array.isArray(cleanQ.answers) && cleanQ.answers.length === 0))) {
                cleanQ.validationWarnings.push('MCQ has no correct answer key.');
            }
            if (cleanQ.type === 'FILL_BLANK' && !cleanQ.content.includes('___')) {
                cleanQ.validationWarnings.push('Fill-in-the-blank question missing blanks ("___").');
            }
            if (cleanQ.type === 'TRUE_FALSE' && !['True', 'False'].includes(String(cleanQ.answers))) {
                cleanQ.validationWarnings.push('True/False question has invalid answer value.');
            }
            return cleanQ;
        });
        // Update database status to PREVIEW_READY
        await db_1.prisma.importJob.update({
            where: { id: jobId },
            data: {
                status: 'PREVIEW_READY',
                progress: 100,
                totalItems: validatedQuestions.length,
                resultData: JSON.stringify(validatedQuestions)
            }
        });
        logger_1.logger.info(`Import Job ${jobId} successfully parsed ${validatedQuestions.length} questions.`);
    }
    catch (error) {
        logger_1.logger.error(`Error in Import Job ${jobId}: ${error.message}`);
        await db_1.prisma.importJob.update({
            where: { id: jobId },
            data: {
                status: 'FAILED',
                progress: 100,
                errorMessage: error.message
            }
        });
    }
    finally {
        // Delete uploaded temp file to conserve space
        try {
            if (fs_1.default.existsSync(filePath)) {
                fs_1.default.unlinkSync(filePath);
            }
        }
        catch (e) {
            // ignore
        }
    }
};
exports.processImportJob = processImportJob;
// 4. BullMQ Queue and Worker definitions
const redisUrl = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
exports.importQueue = null;
// Always use memory-based queue (no Redis dependency for development)
// This ensures the import system works regardless of Redis availability
logger_1.logger.info('Using memory-based async import queue (no Redis dependency).');
exports.importQueue = {
    add: async (name, data) => {
        logger_1.logger.info(`[Import Queue] Processing job: ${name}`);
        // Process asynchronously in background
        setTimeout(() => {
            (0, exports.processImportJob)(data.jobId, data.filePath, data.mimeType);
        }, 500);
        return { id: `job-${data.jobId}` };
    }
};
