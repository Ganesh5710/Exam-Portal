"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../../middleware/auth");
const superadmin_controller_1 = require("./superadmin.controller");

const router = express_1.default.Router();

// Enforce authentication & SUPER_ADMIN role guard on all routes
router.use(auth_1.protect);
router.use((0, auth_1.restrictTo)('SUPER_ADMIN'));

router.get('/metrics', superadmin_controller_1.getGlobalPlatformMetrics);
router.get('/institutions', superadmin_controller_1.getInstitutions);
router.post('/institutions', superadmin_controller_1.createInstitution);
router.get('/audit-logs', superadmin_controller_1.getMasterAuditLogs);
router.get('/ai-usage', superadmin_controller_1.getAIUsageMetrics);
router.post('/toggle-maintenance', superadmin_controller_1.toggleMaintenanceMode);

exports.default = router;
