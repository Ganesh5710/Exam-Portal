import { logger } from './logger';
import nodemailer from 'nodemailer';

// Setup email SMTP transport
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  port: parseInt(process.env.SMTP_PORT || '2525'),
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export interface MailJobPayload {
  to: string;
  subject: string;
  html: string;
}

export interface ReportJobPayload {
  reportId: string;
  type: string;
  filters: any;
}

// Job runners
const runMailJob = async (data: MailJobPayload) => {
  try {
    const isMock = !process.env.SMTP_USER || !process.env.SMTP_PASS;
    if (isMock) {
      logger.info(`[MOCK EMAIL] Sent mail to ${data.to} | Subject: ${data.subject}`);
      return;
    }
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@onlineexamportal.com',
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
    logger.info(`Email dispatched to ${data.to}`);
  } catch (error) {
    logger.error(`Error sending email to ${data.to}: ${(error as Error).message}`);
  }
};

const runReportJob = async (data: ReportJobPayload) => {
  logger.info(`[REPORT TASK] Processing report ${data.reportId} of type ${data.type}`);
  // Simulate heavy computation (e.g. PDF building)
  await new Promise((resolve) => setTimeout(resolve, 3000));
  logger.info(`[REPORT TASK] Finished processing report ${data.reportId}`);
};

// Use memory-based async queue (no Redis dependency)
// This ensures email and report jobs work reliably without Redis
logger.info('Using memory-based async queues for mail and reports.');

const mailQueue = {
  add: async (name: string, data: MailJobPayload) => {
    logger.info(`[Queue] Add mail-job: ${name}`);
    setTimeout(() => runMailJob(data), 500);
    return { id: `mail-${Date.now()}` };
  }
};

const reportQueue = {
  add: async (name: string, data: ReportJobPayload) => {
    logger.info(`[Queue] Add report-job: ${name}`);
    setTimeout(() => runReportJob(data), 500);
    return { id: `report-${Date.now()}` };
  }
};

export { mailQueue, reportQueue };
