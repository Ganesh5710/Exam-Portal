import { Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { prisma } from '../../database/db';
import { AuthenticatedRequest } from '../../middleware/auth';
import { logger } from '../../config/logger';

const backupDir = path.join(__dirname, '../../../backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

export const createBackup = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    logger.info('Database Backup: Starting export job.');

    // Fetch all database tables
    const [
      users,
      departments,
      subjects,
      questions,
      exams,
      examQuestions,
      examAssignments,
      submissions,
      answers,
      settings
    ] = await prisma.$transaction([
      prisma.user.findMany(),
      prisma.department.findMany(),
      prisma.subject.findMany(),
      prisma.question.findMany(),
      prisma.exam.findMany(),
      prisma.examQuestion.findMany(),
      prisma.examAssignment.findMany(),
      prisma.submission.findMany(),
      prisma.answer.findMany(),
      prisma.systemSettings.findMany()
    ]);

    const backupPayload = {
      timestamp: new Date().toISOString(),
      data: {
        users,
        departments,
        subjects,
        questions,
        exams,
        examQuestions,
        examAssignments,
        submissions,
        answers,
        settings
      }
    };

    const fileName = `backup-${Date.now()}.json`;
    const targetPath = path.join(backupDir, fileName);

    fs.writeFileSync(targetPath, JSON.stringify(backupPayload, null, 2), 'utf8');
    logger.info(`Database Backup: Successfully created backup ${fileName}`);

    return res.status(200).json({
      success: true,
      message: 'Database backup created successfully.',
      data: {
        fileName,
        size: fs.statSync(targetPath).size,
        createdAt: backupPayload.timestamp
      }
    });
  } catch (error) {
    next(error);
  }
};

export const listBackups = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const files = fs.readdirSync(backupDir);
    const backups = files
      .filter(file => file.startsWith('backup-') && file.endsWith('.json'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);
        return {
          fileName: file,
          size: stats.size,
          createdAt: stats.mtime
        };
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return res.status(200).json({ success: true, data: backups });
  } catch (error) {
    next(error);
  }
};

export const downloadBackup = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { fileName } = req.params;
  const filePath = path.join(backupDir, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Backup file not found.' });
  }

  return res.download(filePath, fileName);
};

export const restoreBackup = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { fileName } = req.body;
  const filePath = path.join(backupDir, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'Backup file not found.' });
  }

  try {
    logger.info(`Database Restore: Initiating rollback to ${fileName}`);
    const backupContent = fs.readFileSync(filePath, 'utf8');
    const { data } = JSON.parse(backupContent);

    // Delete existing records in transaction to prevent constraint conflicts (dependent tables first)
    await prisma.$transaction([
      prisma.answer.deleteMany(),
      prisma.submission.deleteMany(),
      prisma.examAssignment.deleteMany(),
      prisma.examQuestion.deleteMany(),
      prisma.question.deleteMany(),
      prisma.exam.deleteMany(),
      prisma.subject.deleteMany(),
      prisma.department.deleteMany(),
      prisma.user.deleteMany(),
      prisma.systemSettings.deleteMany()
    ]);

    // Restore tables in dependencies order
    if (data.settings?.length) await prisma.systemSettings.createMany({ data: data.settings });
    if (data.departments?.length) await prisma.department.createMany({ data: data.departments });
    if (data.users?.length) await prisma.user.createMany({ data: data.users });
    if (data.subjects?.length) await prisma.subject.createMany({ data: data.subjects });
    if (data.questions?.length) await prisma.question.createMany({ data: data.questions });
    if (data.exams?.length) await prisma.exam.createMany({ data: data.exams });
    if (data.examQuestions?.length) await prisma.examQuestion.createMany({ data: data.examQuestions });
    if (data.examAssignments?.length) await prisma.examAssignment.createMany({ data: data.examAssignments });
    if (data.submissions?.length) await prisma.submission.createMany({ data: data.submissions });
    if (data.answers?.length) await prisma.answer.createMany({ data: data.answers });

    logger.info(`Database Restore: Rollback completed successfully.`);
    return res.status(200).json({ success: true, message: 'Database successfully restored from backup.' });
  } catch (error) {
    next(error);
  }
};
