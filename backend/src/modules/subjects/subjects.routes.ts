import { Router } from 'express';
import { getSubjects, createSubject, updateSubject, deleteSubject } from './subjects.controller';
import { protect, restrictTo } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();

const subjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().min(1, 'Code is required'),
    course: z.string().min(1, 'Course designation required'),
    semester: z.number().int().min(1).max(8),
    departmentId: z.string().uuid('Valid department assignment required')
  })
});

router.use(protect);

router.get('/', getSubjects);
router.post('/', restrictTo('ADMIN'), validate(subjectSchema), createSubject);
router.put('/:id', restrictTo('ADMIN'), validate(subjectSchema), updateSubject);
router.delete('/:id', restrictTo('ADMIN'), deleteSubject);

export default router;
