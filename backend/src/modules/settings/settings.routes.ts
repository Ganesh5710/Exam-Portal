import { Router } from 'express';
import { getSettings, updateSettings } from './settings.controller';
import { protect, restrictTo } from '../../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', getSettings);
router.put('/', restrictTo('ADMIN'), updateSettings);

export default router;
