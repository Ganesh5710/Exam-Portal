"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkDeleteQuestions = exports.generateAIQuestions = exports.runQuestionCode = exports.bulkImportQuestions = exports.deleteQuestion = exports.updateQuestion = exports.createQuestion = exports.getQuestions = void 0;
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
    let { type, content, options, answers, explanation, score, negativeMarks, difficulty, tags, fileUrl, subjectId } = req.body;
    try {
        if (type) type = type.toUpperCase();
        if (difficulty) difficulty = difficulty.toUpperCase();
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
    let { type, content, options, answers, explanation, score, negativeMarks, difficulty, tags, fileUrl, subjectId } = req.body;
    try {
        if (type) type = type.toUpperCase();
        if (difficulty) difficulty = difficulty.toUpperCase();
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
// Local Questions DB for common CS/Programming/Web topics to fall back to when Gemini API quota runs out
const LOCAL_QUESTIONS_DB = {
    'binary search': [
        {
            type: 'MCQ',
            content: 'What is the time complexity of Binary Search in the worst case?',
            options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
            answers: ['O(log n)'],
            difficulty: 'MEDIUM',
            score: 5,
            negativeMarks: 1,
            explanation: 'Binary Search divides the search space in half with each step, leading to a logarithmic time complexity of O(log n).',
            tags: ['Algorithms', 'Searching', 'Binary Search']
        },
        {
            type: 'TRUE_FALSE',
            content: 'Binary search can be applied to an unsorted array.',
            options: ['True', 'False'],
            answers: 'False',
            difficulty: 'EASY',
            score: 3,
            negativeMarks: 0,
            explanation: 'Binary search requires the elements to be sorted beforehand to determine which half of the array to search next.',
            tags: ['Searching', 'Binary Search']
        },
        {
            type: 'CODING',
            content: 'Write an iterative function in Python that performs binary search on a sorted list of numbers, returning the index or -1.',
            options: [],
            answers: {
                testCases: [
                    { input: '[1, 2, 3, 4, 5], 3', expectedOutput: '2', isHidden: false },
                    { input: '[1, 2, 3, 4, 5], 6', expectedOutput: '-1', isHidden: false }
                ]
            },
            difficulty: 'HARD',
            score: 15,
            negativeMarks: 0,
            explanation: 'Iterative implementation uses low and high pointers, updating mid = low + (high-low)/2 until match is found.',
            tags: ['Coding', 'Algorithms', 'Searching']
        }
    ],
    'react': [
        {
            type: 'MCQ',
            content: 'Which hook is used to perform side effects in a functional React component?',
            options: ['useState', 'useContext', 'useEffect', 'useReducer'],
            answers: ['useEffect'],
            difficulty: 'EASY',
            score: 5,
            negativeMarks: 0,
            explanation: 'useEffect handles side effects such as data fetching, subscriptions, or manual DOM changes.',
            tags: ['React', 'Frontend', 'Hooks']
        },
        {
            type: 'TRUE_FALSE',
            content: 'React components must always start with a capital letter.',
            options: ['True', 'False'],
            answers: 'True',
            difficulty: 'EASY',
            score: 3,
            negativeMarks: 0,
            explanation: 'In JSX, lower-case tag names are treated as HTML tags, whereas capitalized names are treated as React components.',
            tags: ['React', 'JSX']
        }
    ],
    'sql': [
        {
            type: 'MCQ',
            content: 'Which SQL keyword is used to sort the result-set?',
            options: ['SORT BY', 'ORDER BY', 'GROUP BY', 'ORDER'],
            answers: ['ORDER BY'],
            difficulty: 'EASY',
            score: 5,
            negativeMarks: 0,
            explanation: 'ORDER BY is used to sort records in ascending or descending order.',
            tags: ['SQL', 'Database']
        }
    ]
};
function generateQuestionsLocally(topic, type, count) {
    const normTopic = topic.toLowerCase().trim();
    let baseQuestions = LOCAL_QUESTIONS_DB[normTopic];
    if (!baseQuestions) {
        const key = Object.keys(LOCAL_QUESTIONS_DB).find(k => normTopic.includes(k) || k.includes(normTopic));
        if (key) {
            baseQuestions = LOCAL_QUESTIONS_DB[key];
        }
    }
    if (!baseQuestions) {
        // General high-quality templates for fallback
        baseQuestions = [
            {
                type: 'MCQ',
                content: `Which of the following best describes the main concept of ${topic}?`,
                options: [
                    `An optimized approach to solve problems related to ${topic}`,
                    `A legacy method that has been replaced in modern systems`,
                    `A hardware component used to accelerate computation`,
                    `A database constraints index option`
                ],
                answers: [`An optimized approach to solve problems related to ${topic}`],
                difficulty: 'MEDIUM',
                score: 5,
                negativeMarks: 1,
                explanation: `${topic} is a key paradigm designed to optimize performance and structural clarity in software systems.`,
                tags: [topic, 'General']
            },
            {
                type: 'TRUE_FALSE',
                content: `Is ${topic} commonly used in modern web applications and enterprise software architectures?`,
                options: ['True', 'False'],
                answers: 'True',
                difficulty: 'EASY',
                score: 3,
                negativeMarks: 0,
                explanation: `${topic} is widely adopted and considered a best practice in modern software engineering.`,
                tags: [topic]
            },
            {
                type: 'FILL_BLANK',
                content: `${topic} is a technique used to improve computational ___ and resource management.`,
                options: [],
                answers: ['efficiency', 'performance', 'speed'],
                difficulty: 'MEDIUM',
                score: 5,
                negativeMarks: 0,
                explanation: `Improving efficiency is a primary driver behind adopting ${topic}.`,
                tags: [topic]
            }
        ];
    }
    let filtered = baseQuestions;
    if (type && type !== 'ANY') {
        filtered = baseQuestions.filter(q => q.type === type);
        if (filtered.length === 0) {
            filtered = baseQuestions;
        }
    }
    const result = [];
    for (let i = 0; i < count; i++) {
        const original = filtered[i % filtered.length];
        result.push({
            ...original,
            content: count > filtered.length && i >= filtered.length
                ? `${original.content} (Set ${Math.floor(i / filtered.length) + 1})`
                : original.content
        });
    }
    return result;
}
const generateAIQuestions = async (req, res, next) => {
    const { topic, difficulty, type, count, subjectId } = req.body;
    if (!topic || !subjectId) {
        return res.status(400).json({ success: false, message: 'Topic and subjectId are required.' });
    }
    const geminiApiKey = process.env.GEMINI_API_KEY;
    try {
        if (!geminiApiKey) {
            throw new Error('GEMINI_API_KEY missing');
        }
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
        console.warn(`Gemini generation failed: ${error.message}. Falling back to local questions generator.`);
        // Generate questions locally offline so user doesn't get a failure screen
        const localQuestions = generateQuestionsLocally(topic, type, count || 3);
        const enriched = localQuestions.map((q) => ({
            ...q,
            subjectId
        }));
        return res.status(200).json({
            success: true,
            data: enriched,
            model: 'local-offline-fallback',
            warning: 'Gemini rate-limit fallback active.'
        });
    }
};
exports.generateAIQuestions = generateAIQuestions;
const bulkDeleteQuestions = async (req, res, next) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
        return res.status(400).json({ success: false, message: 'Provide an array of question IDs.' });
    try {
        await db_1.prisma.examQuestion.deleteMany({ where: { questionId: { in: ids } } });
        await db_1.prisma.answer.deleteMany({ where: { questionId: { in: ids } } });
        const { count } = await db_1.prisma.question.deleteMany({ where: { id: { in: ids } } });
        return res.status(200).json({ success: true, message: `Deleted ${count} question(s).` });
    }
    catch (error) {
        next(error);
    }
};
exports.bulkDeleteQuestions = bulkDeleteQuestions;
