"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subjects_controller_1 = require("./subjects.controller");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const subjectSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required'),
        code: zod_1.z.string().min(1, 'Code is required'),
        course: zod_1.z.string().min(1, 'Course designation required'),
        semester: zod_1.z.number().int().min(1).max(8),
        departmentId: zod_1.z.string().uuid('Valid department assignment required')
    })
});
router.use(auth_1.protect);
router.get('/', subjects_controller_1.getSubjects);
router.post('/', (0, auth_1.restrictTo)('ADMIN'), (0, validate_1.validate)(subjectSchema), subjects_controller_1.createSubject);
router.put('/:id', (0, auth_1.restrictTo)('ADMIN'), (0, validate_1.validate)(subjectSchema), subjects_controller_1.updateSubject);
router.delete('/:id', (0, auth_1.restrictTo)('ADMIN'), subjects_controller_1.deleteSubject);
exports.default = router;
