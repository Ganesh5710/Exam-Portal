"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const questions_controller_1 = require("./questions.controller");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const questionCreateSchema = zod_1.z.object({
    body: zod_1.z.object({
        type: zod_1.z.enum(['MCQ', 'MULTI_CORRECT', 'TRUE_FALSE', 'FILL_BLANK', 'DESCRIPTIVE', 'CODING']),
        content: zod_1.z.string().min(1, 'Question text content is required'),
        options: zod_1.z.any().optional(), // options holds array of choice options
        answers: zod_1.z.any(), // correct indexes/answers map/strings
        explanation: zod_1.z.string().optional(),
        score: zod_1.z.number().positive().optional(),
        negativeMarks: zod_1.z.number().nonnegative().optional(),
        difficulty: zod_1.z.enum(['EASY', 'MEDIUM', 'HARD']),
        tags: zod_1.z.array(zod_1.z.string()).optional(),
        fileUrl: zod_1.z.string().optional(),
        subjectId: zod_1.z.string().uuid('Subject must be assigned')
    })
});
router.use(auth_1.protect);
router.post('/run-code', questions_controller_1.runQuestionCode);
router.post('/generate-ai', (0, auth_1.restrictTo)('ADMIN'), questions_controller_1.generateAIQuestions);
router.get('/', (0, auth_1.restrictTo)('ADMIN'), questions_controller_1.getQuestions);
router.post('/', (0, auth_1.restrictTo)('ADMIN'), (0, validate_1.validate)(questionCreateSchema), questions_controller_1.createQuestion);
router.put('/:id', (0, auth_1.restrictTo)('ADMIN'), questions_controller_1.updateQuestion);
router.delete('/bulk', (0, auth_1.restrictTo)('ADMIN'), questions_controller_1.bulkDeleteQuestions);
router.delete('/:id', (0, auth_1.restrictTo)('ADMIN'), questions_controller_1.deleteQuestion);
router.post('/import', (0, auth_1.restrictTo)('ADMIN'), questions_controller_1.bulkImportQuestions);
exports.default = router;
