"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportQueue = exports.mailQueue = void 0;
const logger_1 = require("./logger");
const nodemailer_1 = __importDefault(require("nodemailer"));
// Setup email SMTP transport
const transporter = nodemailer_1.default.createTransport({
    host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.SMTP_PORT || '2525'),
    auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '',
    },
});
// Job runners
const runMailJob = async (data) => {
    try {
        const isMock = !process.env.SMTP_USER || !process.env.SMTP_PASS;
        if (isMock) {
            logger_1.logger.info(`[MOCK EMAIL] Sent mail to ${data.to} | Subject: ${data.subject}`);
            return;
        }
        await transporter.sendMail({
            from: process.env.SMTP_FROM || 'noreply@onlineexamportal.com',
            to: data.to,
            subject: data.subject,
            html: data.html,
        });
        logger_1.logger.info(`Email dispatched to ${data.to}`);
    }
    catch (error) {
        logger_1.logger.error(`Error sending email to ${data.to}: ${error.message}`);
    }
};
const runReportJob = async (data) => {
    logger_1.logger.info(`[REPORT TASK] Processing report ${data.reportId} of type ${data.type}`);
    // Simulate heavy computation (e.g. PDF building)
    await new Promise((resolve) => setTimeout(resolve, 3000));
    logger_1.logger.info(`[REPORT TASK] Finished processing report ${data.reportId}`);
};
// Use memory-based async queue (no Redis dependency)
// This ensures email and report jobs work reliably without Redis
logger_1.logger.info('Using memory-based async queues for mail and reports.');
const mailQueue = {
    add: async (name, data) => {
        logger_1.logger.info(`[Queue] Add mail-job: ${name}`);
        setTimeout(() => runMailJob(data), 500);
        return { id: `mail-${Date.now()}` };
    }
};
exports.mailQueue = mailQueue;
const reportQueue = {
    add: async (name, data) => {
        logger_1.logger.info(`[Queue] Add report-job: ${name}`);
        setTimeout(() => runReportJob(data), 500);
        return { id: `report-${Date.now()}` };
    }
};
exports.reportQueue = reportQueue;
