"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const validate_1 = require("../../middleware/validate");
const rateLimit_1 = require("../../middleware/rateLimit");
const zod_1 = require("zod");
const router = (0, express_1.Router)();
const loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Provide a valid email address'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters long'),
    })
});
const refreshSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
    })
});
router.post('/login', rateLimit_1.authLimiter, (0, validate_1.validate)(loginSchema), auth_controller_1.login);
router.post('/refresh', (0, validate_1.validate)(refreshSchema), auth_controller_1.refresh);
router.post('/logout', auth_controller_1.logout);
exports.default = router;
