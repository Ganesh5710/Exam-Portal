"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAssistantQuery = exports.getExamPerformanceAnalytics = exports.getDashboardSummaryMetrics = void 0;
const db_1 = require("../../database/db");
const gemini_1 = require("../../config/gemini");
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

const localFallbackQuery = (query, context) => {
    const q = query.toLowerCase();
    
    if (q.includes("fail") || q.includes("failed")) {
        const failed = context.submissions.filter(s => !s.isPassed);
        return {
            answer: `Here are the students who failed their exams (scored below passing marks). Out of ${context.submissions.length} total submissions, ${failed.length} failed.`,
            columns: ["Student Name", "Exam Title", "Score", "Percentage", "Grade"],
            rows: failed.map(s => [s.studentName, s.examTitle, s.score, `${s.percentage}%`, s.grade]),
            chartType: "BAR",
            chartData: failed.map(s => ({ label: s.studentName, value: s.percentage }))
        };
    }
    
    if (q.includes("cse") && (q.includes("score") || q.includes("failed") || q.includes("below"))) {
        const threshold = q.includes("50") ? 50 : 100;
        const cseRecords = context.submissions.filter(s => {
            const student = context.students.find(st => st.name === s.studentName);
            return student?.departmentCode === 'CSE' && s.percentage < threshold;
        });
        return {
            answer: `Found ${cseRecords.length} CSE student(s) who scored below ${threshold}% in exams.`,
            columns: ["Student Name", "Exam Title", "Percentage", "Grade", "Violations"],
            rows: cseRecords.map(s => [s.studentName, s.examTitle, `${s.percentage}%`, s.grade, s.violationsCount]),
            chartType: "BAR",
            chartData: cseRecords.map(s => ({ label: s.studentName, value: s.percentage }))
        };
    }

    if (q.includes("cse")) {
        const cseStudents = context.students.filter(s => s.departmentCode === 'CSE');
        return {
            answer: `There are currently ${cseStudents.length} registered students in the Computer Science & Engineering (CSE) department.`,
            columns: ["Student Name", "Email", "Department"],
            rows: cseStudents.map(s => [s.name, s.email, s.departmentCode]),
            chartType: "PIE",
            chartData: [
                { label: "CSE Students", value: cseStudents.length },
                { label: "Other Departments", value: context.students.length - cseStudents.length }
            ]
        };
    }

    if (q.includes("average") || q.includes("avg")) {
        const examAverages = {};
        context.submissions.forEach(s => {
            if (!examAverages[s.examTitle]) {
                examAverages[s.examTitle] = { sum: 0, count: 0 };
            }
            examAverages[s.examTitle].sum += s.percentage;
            examAverages[s.examTitle].count += 1;
        });
        const rows = Object.keys(examAverages).map(title => {
            const avg = examAverages[title].sum / examAverages[title].count;
            return [title, `${avg.toFixed(1)}%`, examAverages[title].count];
        });
        return {
            answer: `Here is the average score breakdown for each exam. The overall student cohort performance shows varying averages across topics.`,
            columns: ["Exam Title", "Average Score", "Total Candidates"],
            rows,
            chartType: "BAR",
            chartData: Object.keys(examAverages).map(title => ({
                label: title,
                value: parseFloat((examAverages[title].sum / examAverages[title].count).toFixed(1))
            }))
        };
    }

    const totalSubmissions = context.submissions.length;
    const passes = context.submissions.filter(s => s.isPassed).length;
    const passRate = totalSubmissions > 0 ? (passes / totalSubmissions) * 100 : 0;
    return {
        answer: `Welcome to the Skillbrix AI Assistant! I can help you query students, grades, and pass rates. Databases current statistics: ${context.students.length} students, ${context.exams.length} exams, ${totalSubmissions} submissions, overall pass rate is ${passRate.toFixed(1)}%.`,
        columns: ["Metric Name", "Value"],
        rows: [
            ["Total Students", context.students.length],
            ["Total Exams", context.exams.length],
            ["Total Submissions", totalSubmissions],
            ["Overall Pass Rate", `${passRate.toFixed(1)}%`]
        ],
        chartType: "PIE",
        chartData: [
            { label: "Passed", value: passes },
            { label: "Failed", value: totalSubmissions - passes }
        ]
    };
};

const runAssistantQuery = async (req, res, next) => {
    const { query } = req.body;
    if (!query || !query.trim()) {
        return res.status(400).json({ success: false, message: "Query string is required." });
    }
    try {
        const [users, exams, submissions, departments] = await Promise.all([
            db_1.prisma.user.findMany({ select: { id: true, firstName: true, lastName: true, email: true, role: true, departmentId: true } }),
            db_1.prisma.exam.findMany({ include: { department: true, examQuestions: { include: { question: true } } } }),
            db_1.prisma.submission.findMany({ include: { student: true, exam: true } }),
            db_1.prisma.department.findMany()
        ]);

        const context = {
            students: users.filter(u => u.role === 'STUDENT').map(u => ({
                name: `${u.firstName} ${u.lastName}`.trim(),
                email: u.email,
                departmentCode: departments.find(d => d.id === u.departmentId)?.code || 'N/A'
            })),
            departments: departments.map(d => ({ name: d.name, code: d.code })),
            exams: exams.map(e => ({
                title: e.title,
                departmentCode: e.department?.code || 'N/A',
                passingMarks: e.passingMarks,
                duration: e.duration,
                status: e.status,
                questionCount: e.examQuestions?.length || 0
            })),
            submissions: submissions.map(s => {
                const examQuestions = exams.find(e => e.id === s.examId)?.examQuestions || [];
                const maxMark = examQuestions.length > 0
                    ? examQuestions.reduce((sum, eq) => sum + (eq.question?.score ?? 0), 0)
                    : (s.exam?.passingMarks ?? 0);
                return {
                    studentName: `${s.student?.firstName || ''} ${s.student?.lastName || ''}`.trim(),
                    studentEmail: s.student?.email || '',
                    examTitle: s.exam?.title || '',
                    score: s.totalScore ?? 0,
                    maxScore: maxMark,
                    percentage: s.percentage ? parseFloat(s.percentage.toFixed(1)) : 0,
                    isPassed: s.isPassed,
                    grade: s.grade,
                    status: s.status,
                    violationsCount: s.violationsCount ?? 0,
                    submitTime: s.submitTime ? new Date(s.submitTime).toISOString().split('T')[0] : ''
                };
            })
        };

        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            const localData = localFallbackQuery(query, context);
            return res.status(200).json({ success: true, data: localData, model: "local-offline-fallback" });
        }

        const prompt = `You are the Skillbrix AI Dashboard Assistant. You help instructors analyze exam results, students, departments, and metrics.
You are given the current database state in JSON format:
<DATABASE_CONTEXT>
${JSON.stringify(context, null, 2)}
</DATABASE_CONTEXT>

The user asked the following question: "${query}"

Return a JSON object with:
1. "answer": string (A professional, conversational answer to the question, summarizing key insights based on the database context. Be clear and specific).
2. "columns": array of strings (e.g. ["Student Name", "Email", "Score", "Result"]) - if the answer contains a list of entities, records, or table data. Otherwise null or empty.
3. "rows": array of arrays of strings/numbers (matching the columns) - if the answer contains a table. Otherwise null or empty.
4. "chartType": string ("BAR", "PIE", "LINE", or null) - if the data can be visualised as a chart.
5. "chartData": array of objects (e.g. [{"label": "CSE", "value": 75}, ...]) - if chartType is not null.

Return ONLY this JSON object. Do not wrap in markdown or anything else.`;

        try {
            const result = await (0, gemini_1.callGeminiWithFallback)(geminiApiKey, { prompt, jsonMode: true });
            const parsed = JSON.parse(result.text);
            return res.status(200).json({ success: true, data: parsed, model: result.model });
        } catch (geminiErr) {
            console.warn("Gemini query failed in Assistant, using local fallback", geminiErr.message);
            const localData = localFallbackQuery(query, context);
            return res.status(200).json({ success: true, data: localData, model: "local-offline-fallback" });
        }
    } catch (error) {
        next(error);
    }
};
exports.runAssistantQuery = runAssistantQuery;
