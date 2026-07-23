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
        type: zod_1.z.preprocess(val => typeof val === 'string' ? val.toUpperCase() : val, zod_1.z.enum(['MCQ', 'MULTI_CORRECT', 'TRUE_FALSE', 'FILL_BLANK', 'DESCRIPTIVE', 'CODING'])),
        content: zod_1.z.string().min(1, 'Question text content is required'),
        options: zod_1.z.any().nullable().optional(), // options holds array of choice options
        answers: zod_1.z.any(), // correct indexes/answers map/strings
        explanation: zod_1.z.string().nullable().optional(),
        score: zod_1.z.number().positive().optional(),
        negativeMarks: zod_1.z.number().nonnegative().optional(),
        difficulty: zod_1.z.preprocess(val => typeof val === 'string' ? val.toUpperCase() : val, zod_1.z.enum(['EASY', 'MEDIUM', 'HARD'])),
        tags: zod_1.z.array(zod_1.z.string()).nullable().optional(),
        fileUrl: zod_1.z.string().nullable().optional(),
        departmentId: zod_1.z.string().uuid('Department must be assigned')
    })
});
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const imgStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../../../../uploads');
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname) || '.png';
        cb(null, `diagram-${uniqueSuffix}${ext}`);
    }
});

const uploadImg = multer({
    storage: imgStorage,
    limits: { fileSize: 25 * 1024 * 1024 }
});

router.use(auth_1.protect);
router.post('/upload-image', (0, auth_1.restrictTo)('ADMIN'), uploadImg.single('file'), questions_controller_1.uploadQuestionImage);
router.post('/run-code', questions_controller_1.runQuestionCode);
router.post('/generate-ai', (0, auth_1.restrictTo)('ADMIN'), questions_controller_1.generateAIQuestions);
router.get('/', (0, auth_1.restrictTo)('ADMIN'), questions_controller_1.getQuestions);
router.post('/', (0, auth_1.restrictTo)('ADMIN'), (0, validate_1.validate)(questionCreateSchema), questions_controller_1.createQuestion);
router.put('/:id', (0, auth_1.restrictTo)('ADMIN'), questions_controller_1.updateQuestion);
router.delete('/bulk', (0, auth_1.restrictTo)('ADMIN'), questions_controller_1.bulkDeleteQuestions);
router.delete('/:id', (0, auth_1.restrictTo)('ADMIN'), questions_controller_1.deleteQuestion);
router.post('/import', (0, auth_1.restrictTo)('ADMIN'), questions_controller_1.bulkImportQuestions);
exports.default = router;
