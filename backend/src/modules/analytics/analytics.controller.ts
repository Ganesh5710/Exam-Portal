import { Response, NextFunction } from 'express';
import { prisma } from '../../database/db';
import { AuthenticatedRequest } from '../../middleware/auth';

export const getDashboardSummaryMetrics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const [
      studentsCount,
      examsCount,
      activeExamsCount,
      completedSubmissions
    ] = await prisma.$transaction([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.exam.count(),
      prisma.exam.count({ where: { status: 'PUBLISHED' } }),
      prisma.submission.findMany({ select: { totalScore: true, isPassed: true, percentage: true } })
    ]);

    const totalSubmissions = completedSubmissions.length;
    const avgScore = totalSubmissions > 0
      ? completedSubmissions.reduce((sum, s) => sum + s.percentage, 0) / totalSubmissions
      : 0;
    const passCount = completedSubmissions.filter(s => s.isPassed).length;
    const passPercentage = totalSubmissions > 0 ? (passCount / totalSubmissions) * 100 : 0;

    const highestScore = totalSubmissions > 0 ? Math.max(...completedSubmissions.map(s => s.percentage)) : 0;
    const lowestScore = totalSubmissions > 0 ? Math.min(...completedSubmissions.map(s => s.percentage)) : 0;

    // Get today's exams
    const today = new Date();
    const startOfDay = new Date(today.setHours(0,0,0,0));
    const endOfDay = new Date(today.setHours(23,59,59,999));
    const todaysExamsCount = await prisma.exam.count({
      where: {
        startTime: { gte: startOfDay, lte: endOfDay }
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        totalStudents: studentsCount,
        totalExams: examsCount,
        liveExams: activeExamsCount,
        todaysExams: todaysExamsCount,
        avgScore: parseFloat(avgScore.toFixed(2)),
        highestScore: parseFloat(highestScore.toFixed(2)),
        lowestScore: parseFloat(lowestScore.toFixed(2)),
        passPercentage: parseFloat(passPercentage.toFixed(2))
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getExamPerformanceAnalytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { examId } = req.params;

  try {
    const exam = await prisma.exam.findUnique({
      where: { id: examId },
      include: {
        submissions: {
          include: {
            student: { select: { firstName: true, lastName: true, email: true } }
          }
        }
      }
    });

    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    const totalSubmissions = exam.submissions.length;
    if (totalSubmissions === 0) {
      return res.status(200).json({
        success: true,
        data: {
          examTitle: exam.title,
          submissionsCount: 0,
          averageScore: 0,
          passRate: 0,
          gradeDistribution: {}
        }
      });
    }

    const totalScoreSum = exam.submissions.reduce((sum, s) => sum + s.totalScore, 0);
    const avgScore = totalScoreSum / totalSubmissions;
    const passes = exam.submissions.filter(s => s.isPassed).length;
    const passRate = (passes / totalSubmissions) * 100;

    const grades: Record<string, number> = {};
    exam.submissions.forEach(s => {
      const g = s.grade || 'F';
      grades[g] = (grades[g] || 0) + 1;
    });

    return res.status(200).json({
      success: true,
      data: {
        examTitle: exam.title,
        submissionsCount: totalSubmissions,
        averageScore: parseFloat(avgScore.toFixed(2)),
        passRate: parseFloat(passRate.toFixed(2)),
        gradeDistribution: grades
      }
    });
  } catch (error) {
    next(error);
  }
};
