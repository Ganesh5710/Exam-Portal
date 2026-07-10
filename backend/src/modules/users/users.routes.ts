import { Router } from 'express';
import { getStudents, createStudent, updateStudent, deleteStudent, toggleBlockStudent, bulkImportStudents, bulkDeleteStudents } from './users.controller';
import { protect, restrictTo } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();

const studentCreateSchema = z.object({
  body: z.object({
    email: z.string().email('Valid email required'),
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    password: z.string().min(6, 'Password must be at least 6 characters').optional(),
    departmentId: z.string().uuid().optional().nullable(),
  })
});

const studentUpdateSchema = z.object({
  body: z.object({
    firstName: z.string().min(1, 'First name is required'),
    lastName: z.string().min(1, 'Last name is required'),
    departmentId: z.string().uuid().optional().nullable(),
    status: z.enum(['ACTIVE', 'BLOCKED']).optional()
  })
});

router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/', getStudents);
router.post('/', validate(studentCreateSchema), createStudent);
router.put('/:id', validate(studentUpdateSchema), updateStudent);
router.delete('/bulk', bulkDeleteStudents);
router.delete('/:id', deleteStudent);
router.patch('/:id/block', toggleBlockStudent);
router.post('/import', bulkImportStudents);

export default router;
