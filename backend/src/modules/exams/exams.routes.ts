import { Router } from 'express';
import { getExams, createExam, updateExam, deleteExam, assignExam, getExamQuestionsForStudent, bulkDeleteExams } from './exams.controller';
import { protect, restrictTo } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();

const examCreateSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required'),
    duration: z.number().int().positive('Duration must be positive'),
    passingMarks: z.number().positive(),
    startTime: z.string(),
    endTime: z.string(),
    subjectId: z.string().uuid('Subject must be assigned'),
    questionIds: z.array(z.string()).optional()
  })
});

router.use(protect);

router.get('/', getExams);
router.get('/:id/questions', restrictTo('STUDENT'), getExamQuestionsForStudent);

// Admin-only operations
router.post('/', restrictTo('ADMIN'), validate(examCreateSchema), createExam);
router.put('/:id', restrictTo('ADMIN'), updateExam);
router.delete('/bulk', restrictTo('ADMIN'), bulkDeleteExams);
router.delete('/:id', restrictTo('ADMIN'), deleteExam);
router.post('/assign', restrictTo('ADMIN'), assignExam);

export default router;
