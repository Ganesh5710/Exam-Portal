import { Router } from 'express';
import { getDashboardSummaryMetrics, getExamPerformanceAnalytics } from './analytics.controller';
import { protect, restrictTo } from '../../middleware/auth';

const router = Router();

router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/summary', getDashboardSummaryMetrics);
router.get('/exam/:examId', getExamPerformanceAnalytics);

export default router;
