import { Router } from 'express';
import { createBackup, listBackups, downloadBackup, restoreBackup } from './backup.controller';
import { protect, restrictTo } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { z } from 'zod';

const router = Router();

const restoreSchema = z.object({
  body: z.object({
    fileName: z.string().min(1, 'Backup filename is required')
  })
});

router.use(protect);
router.use(restrictTo('ADMIN'));

router.post('/', createBackup);
router.get('/', listBackups);
router.get('/:fileName', downloadBackup);
router.post('/restore', validate(restoreSchema), restoreBackup);

export default router;
