"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const backup_controller_1 = require("./backup.controller");
const auth_1 = require("../../middleware/auth");
const validate_1 = require("../../middleware/validate");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const restoreSchema = zod_1.z.object({
    body: zod_1.z.object({
        fileName: zod_1.z.string().min(1, 'Backup filename is required')
    })
});
router.use(auth_1.protect);
router.use((0, auth_1.restrictTo)('ADMIN'));
router.post('/', backup_controller_1.createBackup);
router.get('/', backup_controller_1.listBackups);
router.get('/:fileName', backup_controller_1.downloadBackup);
router.post('/restore', (0, validate_1.validate)(restoreSchema), backup_controller_1.restoreBackup);
exports.default = router;
