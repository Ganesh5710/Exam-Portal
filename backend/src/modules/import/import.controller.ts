import { Response, NextFunction } from 'express';
import { prisma } from '../../database/db';
import { AuthenticatedRequest } from '../../middleware/auth';
import { importQueue } from './import.job';
import { logger } from '../../config/logger';

// 1. Upload file and enqueue import job
export const uploadImportFile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a file.' });
  }

  try {
    // Create pending ImportJob entry
    const job = await prisma.importJob.create({
      data: {
        fileName: req.file.originalname,
        status: 'PENDING',
        progress: 0
      }
    });

    // Enqueue job to background queue
    await importQueue.add('parse-document', {
      jobId: job.id,
      filePath: req.file.path,
      mimeType: req.file.mimetype
    });

    return res.status(200).json({
      success: true,
      message: 'File uploaded successfully. Processing started in the background.',
      data: { jobId: job.id, fileName: job.fileName }
    });
  } catch (error) {
    next(error);
  }
};

// 2. Fetch background job progress / status
export const getJobStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const job = await prisma.importJob.findUnique({
      where: { id }
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Import job not found.' });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: job.id,
        fileName: job.fileName,
        status: job.status,
        progress: job.progress,
        totalItems: job.totalItems,
        processed: job.processed,
        failed: job.failed,
        duplicates: job.duplicates,
        errorMessage: job.errorMessage,
        resultData: job.resultData ? JSON.parse(job.resultData) : null,
        createdAt: job.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// 3. Cancel background job
export const cancelJob = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const job = await prisma.importJob.findUnique({ where: { id } });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Import job not found.' });
    }

    if (job.status === 'PROCESSING' || job.status === 'PENDING') {
      await prisma.importJob.update({
        where: { id },
        data: { status: 'CANCELLED', progress: 100 }
      });
    }

    return res.status(200).json({ success: true, message: 'Job cancellation requested.' });
  } catch (error) {
    next(error);
  }
};

// 4. Batch Import approved questions with Prisma Transactions and Duplicate Resolution
export const approveImport = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { subjectId, questions, duplicateActions } = req.body; 
  // duplicateActions mapping: { [questionContent]: 'SKIP' | 'REPLACE' | 'UPDATE' | 'KEEP_BOTH' }

  if (!subjectId || !Array.isArray(questions)) {
    return res.status(400).json({ success: false, message: 'subjectId and questions array are required.' });
  }

  try {
    const job = await prisma.importJob.findUnique({ where: { id } });
    if (!job) {
      return res.status(404).json({ success: false, message: 'Import job not found.' });
    }

    let processedCount = 0;
    let duplicatesCount = 0;
    let failedCount = 0;

    // Use Prisma transaction to guarantee database referential integrity
    await prisma.$transaction(async (tx) => {
      for (const q of questions) {
        try {
          // Check for duplicate in the same subject code context
          const existing = await tx.question.findFirst({
            where: {
              subjectId,
              content: q.content
            }
          });

          if (existing) {
            const action = duplicateActions?.[q.content] || 'SKIP';
            if (action === 'SKIP') {
              duplicatesCount++;
              continue;
            } else if (action === 'REPLACE' || action === 'UPDATE') {
              await tx.question.update({
                where: { id: existing.id },
                data: {
                  options: q.options || null,
                  answers: q.answers,
                  explanation: q.explanation || null,
                  score: parseFloat(q.score) || 5.0,
                  negativeMarks: parseFloat(q.negativeMarks) || 0.0,
                  difficulty: q.difficulty || 'MEDIUM',
                  tags: q.tags || []
                }
              });
              processedCount++;
              continue;
            }
          }

          // Insert new question
          await tx.question.create({
            data: {
              type: q.type,
              content: q.content,
              options: q.options || null,
              answers: q.answers,
              explanation: q.explanation || null,
              score: parseFloat(q.score) || 5.0,
              negativeMarks: parseFloat(q.negativeMarks) || 0.0,
              difficulty: q.difficulty || 'MEDIUM',
              tags: q.tags || [],
              subjectId
            }
          });
          processedCount++;
        } catch (itemErr) {
          logger.error(`Error saving individual question: ${(itemErr as Error).message}`);
          failedCount++;
        }
      }

      // Create Audit Log entry
      await tx.auditLog.create({
        data: {
          userId: req.user?.id,
          action: 'BULK_QUESTION_IMPORT',
          target: `Job: ${job.fileName} | Imported: ${processedCount} | Duplicates: ${duplicatesCount} | Failed: ${failedCount}`,
          ipAddress: req.ip
        }
      });
    });

    // Update final job metadata in database
    await prisma.importJob.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        processed: processedCount,
        duplicates: duplicatesCount,
        failed: failedCount
      }
    });

    return res.status(200).json({
      success: true,
      message: `Import completed. Imported: ${processedCount}, Duplicates: ${duplicatesCount}, Failed: ${failedCount}`
    });
  } catch (error) {
    next(error);
  }
};
