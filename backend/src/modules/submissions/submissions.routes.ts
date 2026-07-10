import { Router } from 'express';
import { saveAnswers, submitExam, getSubmissionsForExam, gradeDescriptiveAnswer, getSubmissions, updateSubmission, deleteSubmission, bulkDeleteSubmissions } from './submissions.controller';
import { protect, restrictTo } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();

const answersSaveSchema = z.object({
  body: z.object({
    examId: z.string().uuid(),
    answers: z.array(z.object({
      questionId: z.string().uuid(),
      studentAnswer: z.any()
    }))
  })
});

const submitSchema = z.object({
  body: z.object({
    examId: z.string().uuid(),
    tabSwitchCount: z.number().int().nonnegative().optional(),
    exitFullscreenCount: z.number().int().nonnegative().optional()
  })
});

router.use(protect);

router.post('/save', restrictTo('STUDENT'), validate(answersSaveSchema), saveAnswers);
router.post('/submit', restrictTo('STUDENT'), validate(submitSchema), submitExam);

// Admin-only routing
router.get('/', restrictTo('ADMIN'), getSubmissions);
router.put('/:id', restrictTo('ADMIN'), updateSubmission);
router.delete('/bulk', restrictTo('ADMIN'), bulkDeleteSubmissions);
router.delete('/:id', restrictTo('ADMIN'), deleteSubmission);
router.get('/exam/:examId', restrictTo('ADMIN'), getSubmissionsForExam);
router.post('/grade/:answerId', restrictTo('ADMIN'), gradeDescriptiveAnswer);

export default router;
