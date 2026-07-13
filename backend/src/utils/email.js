const nodemailer = require('nodemailer');
const { prisma } = require('../database/db');
const { logger } = require('../config/logger');

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // 1. Fetch SMTP settings from database
    const settings = await prisma.systemSettings.findMany();
    const settingsMap = settings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const host = settingsMap.SMTP_HOST || process.env.SMTP_HOST || 'smtp.mailtrap.io';
    const port = parseInt(settingsMap.SMTP_PORT || process.env.SMTP_PORT || '2525');
    const user = settingsMap.SMTP_USER || process.env.SMTP_USER || '';
    const pass = settingsMap.SMTP_PASS || process.env.SMTP_PASS || '';
    const institutionName = settingsMap.INSTITUTION_NAME || 'SecureExam Portal';

    // 2. Create transporter
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: user && pass ? { user, pass } : undefined,
    });

    // 3. Send email
    const mailOptions = {
      from: `"${institutionName}" <noreply@admin.in>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent successfully to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error(`SMTP email delivery failed to ${to}: ${error.message}`);
    return { success: false, error: error.message };
  }
};

module.exports = { sendEmail };
