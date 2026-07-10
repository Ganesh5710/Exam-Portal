"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const departments_controller_1 = require("./departments.controller");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const deptSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(1, 'Name is required'),
        code: zod_1.z.string().min(1, 'Code is required'),
        description: zod_1.z.string().optional()
    })
});
router.use(auth_1.protect);
router.get('/', departments_controller_1.getDepartments);
router.post('/', (0, auth_1.restrictTo)('ADMIN'), (0, validate_1.validate)(deptSchema), departments_controller_1.createDepartment);
router.put('/:id', (0, auth_1.restrictTo)('ADMIN'), (0, validate_1.validate)(deptSchema), departments_controller_1.updateDepartment);
router.delete('/:id', (0, auth_1.restrictTo)('ADMIN'), departments_controller_1.deleteDepartment);
exports.default = router;
