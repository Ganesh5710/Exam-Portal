"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const users_controller_1 = require("./users.controller");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const zod_1 = require("zod");
const multer = require("multer");
const upload = multer({ storage: multer.memoryStorage() });
const router = (0, express_1.Router)();
const studentCreateSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Valid email required'),
        firstName: zod_1.z.string().min(1, 'First name is required'),
        lastName: zod_1.z.string().min(1, 'Last name is required'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters').optional(),
        departmentId: zod_1.z.string().uuid().optional().nullable(),
    })
});
const studentUpdateSchema = zod_1.z.object({
    body: zod_1.z.object({
        firstName: zod_1.z.string().min(1, 'First name is required'),
        lastName: zod_1.z.string().min(1, 'Last name is required'),
        departmentId: zod_1.z.string().uuid().optional().nullable(),
        status: zod_1.z.enum(['ACTIVE', 'BLOCKED']).optional()
    })
});
router.use(auth_1.protect);
router.use((0, auth_1.restrictTo)('ADMIN'));
router.get('/', users_controller_1.getStudents);
router.post('/', (0, validate_1.validate)(studentCreateSchema), users_controller_1.createStudent);
router.put('/:id', (0, validate_1.validate)(studentUpdateSchema), users_controller_1.updateStudent);
router.delete('/bulk', users_controller_1.bulkDeleteStudents);
router.delete('/:id', users_controller_1.deleteStudent);
router.patch('/:id/block', users_controller_1.toggleBlockStudent);
router.patch('/:id/toggle-block', users_controller_1.toggleBlockStudent);
router.post('/import', users_controller_1.bulkImportStudents);
router.post('/import-file', upload.single('file'), users_controller_1.importStudentsFile);
exports.default = router;
