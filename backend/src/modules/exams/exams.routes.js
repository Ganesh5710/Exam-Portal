"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const exams_controller_1 = require("./exams.controller");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const examCreateSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(1, 'Title is required'),
        duration: zod_1.z.number().int().positive('Duration must be positive'),
        passingMarks: zod_1.z.number().positive(),
        startTime: zod_1.z.string(),
        endTime: zod_1.z.string(),
        departmentId: zod_1.z.string().uuid('Department must be assigned'),
        questionIds: zod_1.z.array(zod_1.z.string()).optional()
    })
});
router.use(auth_1.protect);
router.get('/', exams_controller_1.getExams);
router.get('/:id/questions', (0, auth_1.restrictTo)('STUDENT'), exams_controller_1.getExamQuestionsForStudent);
// Admin-only operations
router.post('/', (0, auth_1.restrictTo)('ADMIN'), (0, validate_1.validate)(examCreateSchema), exams_controller_1.createExam);
router.put('/:id', (0, auth_1.restrictTo)('ADMIN'), exams_controller_1.updateExam);
router.delete('/bulk', (0, auth_1.restrictTo)('ADMIN'), exams_controller_1.bulkDeleteExams);
router.delete('/:id', (0, auth_1.restrictTo)('ADMIN'), exams_controller_1.deleteExam);
router.post('/assign', (0, auth_1.restrictTo)('ADMIN'), exams_controller_1.assignExam);
exports.default = router;
