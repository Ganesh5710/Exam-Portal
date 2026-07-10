"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getExamPerformanceAnalytics = exports.getDashboardSummaryMetrics = void 0;
const db_1 = require("../../database/db");
const getDashboardSummaryMetrics = async (req, res, next) => {
    try {
        const [studentsCount, examsCount, activeExamsCount, completedSubmissions] = await db_1.prisma.$transaction([
            db_1.prisma.user.count({ where: { role: 'STUDENT' } }),
            db_1.prisma.exam.count(),
            db_1.prisma.exam.count({ where: { status: 'PUBLISHED' } }),
            db_1.prisma.submission.findMany({ select: { totalScore: true, isPassed: true, percentage: true } })
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
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));
        const todaysExamsCount = await db_1.prisma.exam.count({
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
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboardSummaryMetrics = getDashboardSummaryMetrics;
const getExamPerformanceAnalytics = async (req, res, next) => {
    const { examId } = req.params;
    try {
        const exam = await db_1.prisma.exam.findUnique({
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
        const grades = {};
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
    }
    catch (error) {
        next(error);
    }
};
exports.getExamPerformanceAnalytics = getExamPerformanceAnalytics;
