"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../../middleware/auth");
const import_controller_1 = require("./import.controller");

const router = (0, express_1.Router)();

// Configure multer for local uploads directory
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const dir = path_1.default.join(__dirname, '../../../../uploads');
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `import-${uniqueSuffix}${ext}`);
    }
});

const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50 MB
});

router.use(auth_1.protect);
router.use((0, auth_1.restrictTo)('ADMIN'));

// ── NEW synchronous extract endpoint (used by new QuestionImport.jsx) ──
router.post('/extract', upload.single('file'), import_controller_1.extractQuestions);

// ── Legacy endpoints (kept for backwards compatibility) ──
router.post('/upload', upload.single('file'), import_controller_1.uploadImportFile);
router.get('/status/:id', import_controller_1.getJobStatus);
router.post('/cancel/:id', import_controller_1.cancelJob);
router.post('/approve/:id', import_controller_1.approveImport);

exports.default = router;
