"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAIQuestions = exports.runQuestionCode = exports.bulkImportQuestions = exports.deleteQuestion = exports.updateQuestion = exports.createQuestion = exports.getQuestions = void 0;
const db_1 = require("../../database/db");
const codeExecution_service_1 = require("./codeExecution.service");
const gemini_1 = require("../../config/gemini");
const getQuestions = async (req, res, next) => {
    const search = req.query.search || '';
    const type = req.query.type || undefined;
    const difficulty = req.query.difficulty || undefined;
    const subjectId = req.query.subjectId || '';
    try {
        const where = {
            content: { contains: search }
        };
        if (type)
            where.type = type;
        if (difficulty)
            where.difficulty = difficulty;
        if (subjectId)
            where.subjectId = subjectId;
        const questions = await db_1.prisma.question.findMany({
            where,
            include: {
                subject: {
                    select: { name: true, code: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return res.status(200).json({ success: true, data: questions });
    }
    catch (error) {
        next(error);
    }
};
exports.getQuestions = getQuestions;
const createQuestion = async (req, res, next) => {
    const { type, content, options, answers, explanation, score, negativeMarks, difficulty, tags, fileUrl, subjectId } = req.body;
    try {
        const question = await db_1.prisma.question.create({
            data: {
                type,
                content,
                options: options || null,
                answers,
                explanation: explanation || null,
                score: parseFloat(score) || 1.0,
                negativeMarks: parseFloat(negativeMarks) || 0.0,
                difficulty,
                tags: tags || [],
                fileUrl: fileUrl || null,
                subjectId
            }
        });
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'CREATE_QUESTION',
                target: `Question ID: ${question.id}`,
                ipAddress: req.ip
            }
        });
        return res.status(201).json({ success: true, data: question });
    }
    catch (error) {
        next(error);
    }
};
exports.createQuestion = createQuestion;
const updateQuestion = async (req, res, next) => {
    const { id } = req.params;
    const { type, content, options, answers, explanation, score, negativeMarks, difficulty, tags, fileUrl, subjectId } = req.body;
    try {
        const existing = await db_1.prisma.question.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Question not found.' });
        }
        const updated = await db_1.prisma.question.update({
            where: { id },
            data: {
                type: type || existing.type,
                content: content || existing.content,
                options: options !== undefined ? options : existing.options,
                answers: answers !== undefined ? answers : existing.answers,
                explanation: explanation !== undefined ? explanation : existing.explanation,
                score: score !== undefined ? parseFloat(score) : existing.score,
                negativeMarks: negativeMarks !== undefined ? parseFloat(negativeMarks) : existing.negativeMarks,
                difficulty: difficulty || existing.difficulty,
                tags: tags || existing.tags,
                fileUrl: fileUrl !== undefined ? fileUrl : existing.fileUrl,
                subjectId: subjectId || existing.subjectId
            }
        });
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'UPDATE_QUESTION',
                target: `Question ID: ${id}`,
                ipAddress: req.ip
            }
        });
        return res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
};
exports.updateQuestion = updateQuestion;
const deleteQuestion = async (req, res, next) => {
    const { id } = req.params;
    try {
        const existing = await db_1.prisma.question.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Question not found.' });
        }
        await db_1.prisma.question.delete({ where: { id } });
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'DELETE_QUESTION',
                target: `Question ID: ${id}`,
                ipAddress: req.ip
            }
        });
        return res.status(200).json({ success: true, message: 'Question deleted successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteQuestion = deleteQuestion;
const bulkImportQuestions = async (req, res, next) => {
    const { questions } = req.body; // Array of Question records
    if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ success: false, message: 'List of questions is required.' });
    }
    try {
        let imported = 0;
        for (const record of questions) {
            const { type, content, options, answers, explanation, score, negativeMarks, difficulty, tags, subjectCode } = record;
            const sub = await db_1.prisma.subject.findUnique({ where: { code: subjectCode } });
            if (!sub)
                continue; // Skip if subject doesn't exist
            await db_1.prisma.question.create({
                data: {
                    type,
                    content,
                    options: options || null,
                    answers,
                    explanation: explanation || null,
                    score: parseFloat(score) || 1.0,
                    negativeMarks: parseFloat(negativeMarks) || 0.0,
                    difficulty: difficulty || 'MEDIUM',
                    tags: tags || [],
                    subjectId: sub.id
                }
            });
            imported++;
        }
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'BULK_IMPORT_QUESTIONS',
                target: `Imported: ${imported}`,
                ipAddress: req.ip
            }
        });
        return res.status(200).json({
            success: true,
            message: `Bulk import complete. Imported ${imported} questions.`
        });
    }
    catch (error) {
        next(error);
    }
};
exports.bulkImportQuestions = bulkImportQuestions;
const runQuestionCode = async (req, res, next) => {
    const { language, code, input, expectedOutput, questionId } = req.body;
    if (!language || !code) {
        return res.status(400).json({ success: false, message: 'Language and code are required.' });
    }
    try {
        let testCases = [];
        if (questionId) {
            const question = await db_1.prisma.question.findUnique({ where: { id: questionId } });
            if (question && question.type === 'CODING') {
                const answersObj = question.answers;
                if (answersObj && Array.isArray(answersObj.testCases)) {
                    testCases = answersObj.testCases;
                }
            }
        }
        // Fallback if no questionId or no testCases found
        if (testCases.length === 0) {
            testCases = [{
                    input: input || '',
                    expectedOutput: expectedOutput || '',
                    isHidden: false
                }];
        }
        const report = await (0, codeExecution_service_1.executeCode)(language, code, testCases);
        // Filter out input/output details for hidden test cases
        if (report && Array.isArray(report.results)) {
            report.results = report.results.map((res, index) => {
                const originalTc = testCases[index];
                if (originalTc && originalTc.isHidden) {
                    return {
                        passed: res.passed,
                        input: '[HIDDEN TEST CASE]',
                        expected: '[HIDDEN TEST CASE]',
                        actual: res.passed ? '[HIDDEN]' : '[OUTPUT MISMATCH / RUNTIME FAILURE]',
                        error: res.error ? 'RUNTIME_ERROR' : undefined,
                        timeTakenMs: res.timeTakenMs
                    };
                }
                return res;
            });
        }
        return res.status(200).json({ success: true, data: report });
    }
    catch (error) {
        next(error);
    }
};
exports.runQuestionCode = runQuestionCode;
const generateAIQuestions = async (req, res, next) => {
    const { topic, difficulty, type, count, subjectId } = req.body;
    if (!topic || !subjectId) {
        return res.status(400).json({ success: false, message: 'Topic and subjectId are required.' });
    }
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        return res.status(400).json({
            success: false,
            message: 'Gemini API Key is missing. Please configure GEMINI_API_KEY in your backend .env file.'
        });
    }
    try {
        const prompt = `You are an expert academic examiner. Generate ${count || 3} questions about the topic: "${topic}".
Difficulty level: ${difficulty || 'MEDIUM'}.
Question type: ${type || 'MCQ'}.

Depending on the question type, strictly follow these JSON structure rules:
1. For MCQ:
   - "content": string (the question text)
   - "options": array of 4 strings
   - "answers": array of 1 string (must match exactly one of the options)
2. For TRUE_FALSE:
   - "content": string (the question text)
   - "options": null or []
   - "answers": "True" or "False"
3. For FILL_BLANK:
   - "content": string (use "___" in the text for the blank)
   - "options": null or []
   - "answers": array of acceptable correct string answers
4. For DESCRIPTIVE:
   - "content": string (the essay/explanation prompt)
   - "options": null
   - "answers": string (model answer guidelines / keywords)
5. For CODING:
   - "content": string (detailed problem description specifying input/output formats)
   - "options": []
   - "answers": JSON object: {"testCases": [{"input": "string input", "expectedOutput": "expected string output", "isHidden": false}, ...]} (provide at least 2 public test cases and 2 hidden test cases)

Each question must also include:
- "difficulty": "${difficulty || 'MEDIUM'}"
- "score": number (suggested points, e.g. 5 for MCQ, 15 for CODING)
- "negativeMarks": number (e.g. 1 for MCQ, 0 for CODING)
- "explanation": string (why the answer is correct)
- "tags": array of strings

Return ONLY a JSON array of question objects. Do not wrap it in markdown code blocks or add any conversational text. Just return the raw JSON array.`;
        const result = await (0, gemini_1.callGeminiWithFallback)(geminiApiKey, { prompt });
        const generatedQuestions = JSON.parse(result.text);
        // Enrich questions with subjectId
        const enriched = (Array.isArray(generatedQuestions) ? generatedQuestions : [generatedQuestions]).map((q) => ({
            ...q,
            subjectId
        }));
        return res.status(200).json({ success: true, data: enriched, model: result.model });
    }
    catch (error) {
        // Return a proper JSON error instead of crashing
        return res.status(502).json({
            success: false,
            message: error.message || 'AI generation failed. Please try again.',
        });
    }
};
exports.generateAIQuestions = generateAIQuestions;
