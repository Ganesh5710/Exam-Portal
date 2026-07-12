"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * submissions.routes.ts
 * Defines all REST API routes for exam submission management.
 * Student routes: save answers, submit exam, view own result.
 * Admin routes: view all, grade, publish, bulk-publish, delete.
 */
const express_1 = require("express");
const submissions_controller_1 = require("./submissions.controller");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const answersSaveSchema = zod_1.z.object({
    body: zod_1.z.object({
        examId: zod_1.z.string().uuid(),
        answers: zod_1.z.array(zod_1.z.object({
            questionId: zod_1.z.string().uuid(),
            studentAnswer: zod_1.z.any()
        }))
    })
});
const submitSchema = zod_1.z.object({
    body: zod_1.z.object({
        examId: zod_1.z.string().uuid(),
        tabSwitchCount: zod_1.z.number().int().nonnegative().optional(),
        exitFullscreenCount: zod_1.z.number().int().nonnegative().optional()
    })
});
router.use(auth_1.protect);
router.post('/save', (0, auth_1.restrictTo)('STUDENT'), (0, validate_1.validate)(answersSaveSchema), submissions_controller_1.saveAnswers);
router.post('/submit', (0, auth_1.restrictTo)('STUDENT'), (0, validate_1.validate)(submitSchema), submissions_controller_1.submitExam);
router.get('/my-submission/:examId', (0, auth_1.restrictTo)('STUDENT'), submissions_controller_1.getMySubmission);
// Admin-only routing
router.get('/', (0, auth_1.restrictTo)('ADMIN'), submissions_controller_1.getSubmissions);
router.put('/:id', (0, auth_1.restrictTo)('ADMIN'), submissions_controller_1.updateSubmission);
router.post('/bulk-publish', (0, auth_1.restrictTo)('ADMIN'), submissions_controller_1.bulkPublishSubmissions);
router.delete('/bulk', (0, auth_1.restrictTo)('ADMIN'), submissions_controller_1.bulkDeleteSubmissions);
router.delete('/:id', (0, auth_1.restrictTo)('ADMIN'), submissions_controller_1.deleteSubmission);
router.get('/exam/:examId', (0, auth_1.restrictTo)('ADMIN'), submissions_controller_1.getSubmissionsForExam);
router.post('/grade/:answerId', (0, auth_1.restrictTo)('ADMIN'), submissions_controller_1.gradeDescriptiveAnswer);
exports.default = router;
