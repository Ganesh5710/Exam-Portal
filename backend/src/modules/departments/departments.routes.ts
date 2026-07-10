import { Router } from 'express';
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from './departments.controller';
import { protect, restrictTo } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();

const deptSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required'),
    code: z.string().min(1, 'Code is required'),
    description: z.string().optional()
  })
});

router.use(protect);

router.get('/', getDepartments);
router.post('/', restrictTo('ADMIN'), validate(deptSchema), createDepartment);
router.put('/:id', restrictTo('ADMIN'), validate(deptSchema), updateDepartment);
router.delete('/:id', restrictTo('ADMIN'), deleteDepartment);

export default router;
