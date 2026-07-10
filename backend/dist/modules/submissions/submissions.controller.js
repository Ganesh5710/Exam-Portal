"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gradeDescriptiveAnswer = exports.getSubmissionsForExam = exports.submitExam = exports.saveAnswers = void 0;
const db_1 = require("../../database/db");
const codeExecution_service_1 = require("../questions/codeExecution.service");
const saveAnswers = async (req, res, next) => {
    const { examId, answers } = req.body; // answers is an array of { questionId, studentAnswer }
    const studentId = req.user?.id || '';
    try {
        const assignment = await db_1.prisma.examAssignment.findUnique({
            where: { examId_studentId: { examId, studentId } }
        });
        if (!assignment || assignment.status !== 'STARTED') {
            return res.status(403).json({ success: false, message: 'Exam has not been started or already submitted.' });
        }
        // Initialize or get submission
        let submission = await db_1.prisma.submission.findUnique({
            where: { examId_studentId: { examId, studentId } }
        });
        if (!submission) {
            submission = await db_1.prisma.submission.create({
                data: {
                    examId,
                    studentId,
                    status: 'PENDING'
                }
            });
        }
        // Save individual answers
        for (const ans of answers) {
            const { questionId, studentAnswer } = ans;
            await db_1.prisma.answer.upsert({
                where: {
                    submissionId_questionId: {
                        submissionId: submission.id,
                        questionId
                    }
                },
                create: {
                    submissionId: submission.id,
                    questionId,
                    studentAnswer
                },
                update: {
                    studentAnswer
                }
            });
        }
        return res.status(200).json({ success: true, message: 'Answers saved successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.saveAnswers = saveAnswers;
const submitExam = async (req, res, next) => {
    const { examId, tabSwitchCount, exitFullscreenCount } = req.body;
    const studentId = req.user?.id || '';
    try {
        const assignment = await db_1.prisma.examAssignment.findUnique({
            where: { examId_studentId: { examId, studentId } },
            include: { exam: { include: { examQuestions: { include: { question: true } } } } }
        });
        if (!assignment || assignment.status !== 'STARTED') {
            return res.status(400).json({ success: false, message: 'Exam is not in a submittable state.' });
        }
        // Update assignment status
        await db_1.prisma.examAssignment.update({
            where: { id: assignment.id },
            data: {
                status: 'SUBMITTED',
                submitTime: new Date(),
                tabSwitchCount: tabSwitchCount || 0,
                exitFullscreenCount: exitFullscreenCount || 0
            }
        });
        // Fetch submission
        let submission = await db_1.prisma.submission.findUnique({
            where: { examId_studentId: { examId, studentId } },
            include: { answers: true }
        });
        if (!submission) {
            submission = await db_1.prisma.submission.create({
                data: { examId, studentId, status: 'PENDING' },
                include: { answers: true }
            });
        }
        // Start auto-evaluation
        const examQuestions = assignment.exam.examQuestions.map(eq => eq.question);
        let totalScore = 0;
        let autoGradingComplete = true;
        for (const question of examQuestions) {
            const savedAns = submission.answers.find(a => a.questionId === question.id);
            const studentResponse = savedAns?.studentAnswer;
            let isCorrect = false;
            let scoreAwarded = 0;
            if (!studentResponse) {
                // Unanswered
                isCorrect = false;
                scoreAwarded = 0;
            }
            else if (question.type === 'MCQ') {
                const correctOpt = question.answers; // Key of correct option
                const responseString = studentResponse.selectedOption;
                isCorrect = correctOpt === responseString;
                scoreAwarded = isCorrect ? question.score : (assignment.exam.allowNegativeMarking ? -question.negativeMarks : 0);
            }
            else if (question.type === 'TRUE_FALSE') {
                const correctVal = String(question.answers).toLowerCase();
                const studentVal = String(studentResponse.value).toLowerCase();
                isCorrect = correctVal === studentVal;
                scoreAwarded = isCorrect ? question.score : (assignment.exam.allowNegativeMarking ? -question.negativeMarks : 0);
            }
            else if (question.type === 'FILL_BLANK') {
                const correctAnswers = Array.isArray(question.answers)
                    ? question.answers.map(a => String(a).trim().toLowerCase())
                    : [String(question.answers).trim().toLowerCase()];
                const studentVal = String(studentResponse.value).trim().toLowerCase();
                isCorrect = correctAnswers.includes(studentVal);
                scoreAwarded = isCorrect ? question.score : (assignment.exam.allowNegativeMarking ? -question.negativeMarks : 0);
            }
            else if (question.type === 'MULTI_CORRECT') {
                const correctOpts = question.answers; // Array of correct options keys
                const selectedOpts = studentResponse.selectedOptions;
                isCorrect = Array.isArray(selectedOpts) &&
                    correctOpts.length === selectedOpts.length &&
                    correctOpts.every(o => selectedOpts.includes(o));
                scoreAwarded = isCorrect ? question.score : (assignment.exam.allowNegativeMarking ? -question.negativeMarks : 0);
            }
            else if (question.type === 'CODING') {
                const studentCode = studentResponse.value || '';
                const studentLanguage = studentResponse.language || 'python';
                let testCases = [];
                const answersObj = question.answers;
                if (answersObj && Array.isArray(answersObj.testCases)) {
                    testCases = answersObj.testCases;
                }
                if (studentCode.trim() && testCases.length > 0) {
                    try {
                        const report = await (0, codeExecution_service_1.executeCode)(studentLanguage, studentCode, testCases);
                        const totalCases = testCases.length;
                        const passedCases = report.results.filter(r => r.passed).length;
                        isCorrect = passedCases === totalCases;
                        scoreAwarded = totalCases > 0 ? parseFloat(((passedCases / totalCases) * question.score).toFixed(2)) : 0;
                    }
                    catch (execErr) {
                        isCorrect = false;
                        scoreAwarded = 0;
                    }
                }
                else {
                    isCorrect = false;
                    scoreAwarded = 0;
                }
            }
            else {
                // Descriptive requires manual grading
                autoGradingComplete = false;
                continue;
            }
            if (savedAns) {
                await db_1.prisma.answer.update({
                    where: { id: savedAns.id },
                    data: { isCorrect, scoreAwarded }
                });
                totalScore += scoreAwarded;
            }
        }
        // Calculate percentages
        const maxPossibleScore = examQuestions.reduce((acc, q) => acc + q.score, 0);
        const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
        const isPassed = percentage >= assignment.exam.passingMarks;
        let grade = 'F';
        if (isPassed) {
            if (percentage >= 90)
                grade = 'A+';
            else if (percentage >= 80)
                grade = 'A';
            else if (percentage >= 70)
                grade = 'B';
            else if (percentage >= 60)
                grade = 'C';
            else
                grade = 'D';
        }
        await db_1.prisma.submission.update({
            where: { id: submission.id },
            data: {
                totalScore,
                percentage,
                isPassed,
                grade,
                status: autoGradingComplete ? 'COMPLETED' : 'PENDING',
                violationsCount: (tabSwitchCount || 0) + (exitFullscreenCount || 0),
                submitTime: new Date()
            }
        });
        await db_1.prisma.auditLog.create({
            data: {
                userId: studentId,
                action: 'SUBMIT_EXAM',
                target: `Exam ID: ${examId}`,
                ipAddress: req.ip
            }
        });
        return res.status(200).json({
            success: true,
            message: 'Exam submitted successfully.',
            data: {
                totalScore,
                percentage,
                isPassed,
                grade,
                status: autoGradingComplete ? 'COMPLETED' : 'PENDING'
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.submitExam = submitExam;
const getSubmissionsForExam = async (req, res, next) => {
    const { examId } = req.params;
    try {
        const submissions = await db_1.prisma.submission.findMany({
            where: { examId },
            include: {
                student: { select: { firstName: true, lastName: true, email: true } },
                answers: { include: { question: true } }
            },
            orderBy: { totalScore: 'desc' }
        });
        return res.status(200).json({ success: true, data: submissions });
    }
    catch (error) {
        next(error);
    }
};
exports.getSubmissionsForExam = getSubmissionsForExam;
const gradeDescriptiveAnswer = async (req, res, next) => {
    const { answerId } = req.params;
    const { scoreAwarded, feedback } = req.body;
    try {
        const answer = await db_1.prisma.answer.findUnique({
            where: { id: answerId },
            include: { question: true, submission: true }
        });
        if (!answer) {
            return res.status(404).json({ success: false, message: 'Answer record not found.' });
        }
        const maxScore = answer.question.score;
        if (scoreAwarded > maxScore) {
            return res.status(400).json({ success: false, message: `Score cannot exceed maximum points of ${maxScore}` });
        }
        // Update individual score
        await db_1.prisma.answer.update({
            where: { id: answerId },
            data: {
                scoreAwarded: parseFloat(scoreAwarded),
                isCorrect: parseFloat(scoreAwarded) >= maxScore / 2,
                feedback
            }
        });
        // Recalculate submission score
        const submissionAnswers = await db_1.prisma.answer.findMany({
            where: { submissionId: answer.submissionId }
        });
        const totalScore = submissionAnswers.reduce((sum, a) => sum + (a.scoreAwarded || 0), 0);
        const examQuestions = await db_1.prisma.examQuestion.findMany({
            where: { examId: answer.submission.examId },
            include: { question: true }
        });
        const maxPossibleScore = examQuestions.reduce((acc, eq) => acc + eq.question.score, 0);
        const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
        const exam = await db_1.prisma.exam.findUnique({ where: { id: answer.submission.examId } });
        const passingMarks = exam?.passingMarks || 40;
        const isPassed = percentage >= passingMarks;
        // Check if other descriptive questions in this submission are still un-evaluated
        const pendingQuestionsCount = submissionAnswers.filter(a => a.scoreAwarded === null).length;
        await db_1.prisma.submission.update({
            where: { id: answer.submissionId },
            data: {
                totalScore,
                percentage,
                isPassed,
                status: pendingQuestionsCount === 0 ? 'COMPLETED' : 'PENDING'
            }
        });
        return res.status(200).json({ success: true, message: 'Answer graded successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.gradeDescriptiveAnswer = gradeDescriptiveAnswer;
