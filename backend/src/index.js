"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("./config/logger");
const index_1 = require("./socket/index");
const error_1 = require("./middleware/error");
const rateLimit_1 = require("./middleware/rateLimit");
// Routes Imports
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const users_routes_1 = __importDefault(require("./modules/users/users.routes"));
const departments_routes_1 = __importDefault(require("./modules/departments/departments.routes"));
const subjects_routes_1 = __importDefault(require("./modules/subjects/subjects.routes"));
const questions_routes_1 = __importDefault(require("./modules/questions/questions.routes"));
const exams_routes_1 = __importDefault(require("./modules/exams/exams.routes"));
const submissions_routes_1 = __importDefault(require("./modules/submissions/submissions.routes"));
const analytics_routes_1 = __importDefault(require("./modules/analytics/analytics.routes"));
const backup_routes_1 = __importDefault(require("./modules/backup/backup.routes"));
const settings_routes_1 = __importDefault(require("./modules/settings/settings.routes"));
const import_routes_1 = __importDefault(require("./modules/import/import.routes"));
const settings_controller_1 = require("./modules/settings/settings.controller");
const autosave_job_1 = require("./modules/autosave/autosave.job");
const seed_1 = require("./database/seed");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
// Init Socket.io
const io = new socket_io_1.Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        credentials: true
    },
    pingTimeout: 60000,
    connectionStateRecovery: {} // Automatically recover connection states
});
(0, index_1.initSocketHandler)(io);
// Security and utility Middlewares
app.use((0, helmet_1.default)({
    crossOriginResourcePolicy: false // Allow loading local uploads files on client
}));
app.use((0, cors_1.default)({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Local media folder static route
const uploadsPath = path_1.default.join(__dirname, '../../uploads');
if (!fs_1.default.existsSync(uploadsPath)) {
    fs_1.default.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express_1.default.static(uploadsPath));
// API router binds
app.use('/api/v1/auth', auth_routes_1.default);
app.use('/api/v1/users', rateLimit_1.apiLimiter, users_routes_1.default);
app.use('/api/v1/departments', rateLimit_1.apiLimiter, departments_routes_1.default);
app.use('/api/v1/subjects', rateLimit_1.apiLimiter, subjects_routes_1.default);
app.use('/api/v1/questions', rateLimit_1.apiLimiter, questions_routes_1.default);
app.use('/api/v1/exams', rateLimit_1.apiLimiter, exams_routes_1.default);
app.use('/api/v1/submissions', rateLimit_1.apiLimiter, submissions_routes_1.default);
app.use('/api/v1/analytics', rateLimit_1.apiLimiter, analytics_routes_1.default);
app.use('/api/v1/backups', rateLimit_1.apiLimiter, backup_routes_1.default);
app.use('/api/v1/settings', rateLimit_1.apiLimiter, settings_routes_1.default);
app.use('/api/v1/import', rateLimit_1.apiLimiter, import_routes_1.default);
// Welcome and status page for the root route
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the SecureExam Enterprise Online Examination Portal API!',
        version: '1.0.0',
        status: 'ONLINE',
        documentation: '/api-docs (if configured)',
        health: '/health',
        timestamp: new Date()
    });
});
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', timestamp: new Date() });
});
// Global Error Handler
app.use(error_1.errorHandler);
// Background Cron Jobs
// Trigger database autosave sync every 30 seconds
setInterval(async () => {
    await (0, autosave_job_1.runAutosaveDatabaseSync)();
}, 30000);
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
    logger_1.logger.info(`Server boot completed. Running on port ${PORT}`);
    await (0, seed_1.seedDatabase)();
    await (0, settings_controller_1.seedDefaultSettings)();
});
exports.default = server;
