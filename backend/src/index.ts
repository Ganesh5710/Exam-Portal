import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

import { logger } from './config/logger';
import { prisma } from './database/db';
import { initSocketHandler } from './socket/index';
import { errorHandler } from './middleware/error';
import { apiLimiter } from './middleware/rateLimit';

// Routes Imports
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/users/users.routes';
import deptRoutes from './modules/departments/departments.routes';
import subjectRoutes from './modules/subjects/subjects.routes';
import questionRoutes from './modules/questions/questions.routes';
import examRoutes from './modules/exams/exams.routes';
import submissionRoutes from './modules/submissions/submissions.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import backupRoutes from './modules/backup/backup.routes';
import settingsRoutes from './modules/settings/settings.routes';
import importRoutes from './modules/import/import.routes';

import { seedDefaultSettings } from './modules/settings/settings.controller';
import { runAutosaveDatabaseSync } from './modules/autosave/autosave.job';
import { seedDatabase } from './database/seed';

const app = express();
const server = http.createServer(app);

// Init Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true
  },
  pingTimeout: 60000,
  connectionStateRecovery: {} // Automatically recover connection states
});

initSocketHandler(io);

// Security and utility Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false // Allow loading local uploads files on client
}));
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Local media folder static route
const uploadsPath = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API router binds
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', apiLimiter, userRoutes);
app.use('/api/v1/departments', apiLimiter, deptRoutes);
app.use('/api/v1/subjects', apiLimiter, subjectRoutes);
app.use('/api/v1/questions', apiLimiter, questionRoutes);
app.use('/api/v1/exams', apiLimiter, examRoutes);
app.use('/api/v1/submissions', apiLimiter, submissionRoutes);
app.use('/api/v1/analytics', apiLimiter, analyticsRoutes);
app.use('/api/v1/backups', apiLimiter, backupRoutes);
app.use('/api/v1/settings', apiLimiter, settingsRoutes);
app.use('/api/v1/import', apiLimiter, importRoutes);

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
app.use(errorHandler);

// Background Cron Jobs
// Trigger database autosave sync every 30 seconds
setInterval(async () => {
  await runAutosaveDatabaseSync();
}, 30000);

const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  logger.info(`Server boot completed. Running on port ${PORT}`);
  await seedDatabase();
  await seedDefaultSettings();
});

export default server;
