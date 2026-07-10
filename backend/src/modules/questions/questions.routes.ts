import { Router } from 'express';
import { getQuestions, createQuestion, updateQuestion, deleteQuestion, bulkImportQuestions, runQuestionCode, generateAIQuestions, bulkDeleteQuestions } from './questions.controller';
import { protect, restrictTo } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();

const questionCreateSchema = z.object({
  body: z.object({
    type: z.enum(['MCQ', 'MULTI_CORRECT', 'TRUE_FALSE', 'FILL_BLANK', 'DESCRIPTIVE', 'CODING']),
    content: z.string().min(1, 'Question text content is required'),
    options: z.any().optional(), // options holds array of choice options
    answers: z.any(), // correct indexes/answers map/strings
    explanation: z.string().optional(),
    score: z.number().positive().optional(),
    negativeMarks: z.number().nonnegative().optional(),
    difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']),
    tags: z.array(z.string()).optional(),
    fileUrl: z.string().optional(),
    subjectId: z.string().uuid('Subject must be assigned')
  })
});

router.use(protect);

router.post('/run-code', runQuestionCode);
router.post('/generate-ai', restrictTo('ADMIN'), generateAIQuestions);
router.get('/', restrictTo('ADMIN'), getQuestions);
router.post('/', restrictTo('ADMIN'), validate(questionCreateSchema), createQuestion);
router.put('/:id', restrictTo('ADMIN'), updateQuestion);
router.delete('/bulk', restrictTo('ADMIN'), bulkDeleteQuestions);
router.delete('/:id', restrictTo('ADMIN'), deleteQuestion);
router.post('/import', restrictTo('ADMIN'), bulkImportQuestions);

export default router;
