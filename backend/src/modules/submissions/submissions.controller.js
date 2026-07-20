"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkPublishSubmissions = exports.getMySubmission = exports.bulkDeleteSubmissions = exports.deleteSubmission = exports.updateSubmission = exports.getSubmissions = exports.gradeDescriptiveAnswer = exports.getSubmissionsForExam = exports.submitExam = exports.saveAnswers = void 0;
const db_1 = require("../../database/db");
const codeExecution_service_1 = require("../questions/codeExecution.service");
/**
 * Periodically upserts candidate answer entries into the database during active exam sessions,
 * ensuring answer state persistence against browser crashes or network interruptions.
 */
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
        // ── Helper: normalize answer text for comparison ─────────────────────
        const norm = (v) => String(v ?? '').trim().toLowerCase();
        // ── Extract correct answers as a string array ─────────────────────────
        const getCorrectArray = (rawAnswers) => {
            if (Array.isArray(rawAnswers))
                return rawAnswers.map(norm);
            if (typeof rawAnswers === 'string')
                return [norm(rawAnswers)];
            if (rawAnswers && typeof rawAnswers === 'object') {
                // e.g. { answer: "A" } or { correct: "B" }
                const v = rawAnswers.answer ?? rawAnswers.correct ?? rawAnswers.key ?? null;
                return v !== null ? [norm(v)] : [];
            }
            return [];
        };
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
                // Unanswered — skip, score stays 0
            }
            else if (question.type === 'MCQ') {
                // answers stored as ["correct text"] or "correct text"
                const correctList = getCorrectArray(question.answers);
                const studentChoice = norm(studentResponse.selectedOption);
                isCorrect = correctList.length > 0 && correctList.includes(studentChoice);
                scoreAwarded = isCorrect
                    ? question.score
                    : (assignment.exam.allowNegativeMarking ? -question.negativeMarks : 0);
            }
            else if (question.type === 'TRUE_FALSE') {
                const correctList = getCorrectArray(question.answers);
                const studentVal = norm(studentResponse.value);
                isCorrect = correctList.includes(studentVal);
                scoreAwarded = isCorrect
                    ? question.score
                    : (assignment.exam.allowNegativeMarking ? -question.negativeMarks : 0);
            }
            else if (question.type === 'FILL_BLANK') {
                const correctList = getCorrectArray(question.answers);
                const studentVal = norm(studentResponse.value);
                isCorrect = correctList.includes(studentVal);
                scoreAwarded = isCorrect
                    ? question.score
                    : (assignment.exam.allowNegativeMarking ? -question.negativeMarks : 0);
            }
            else if (question.type === 'MULTI_CORRECT') {
                // answers stored as array of correct option texts
                const correctSet = new Set(getCorrectArray(question.answers));
                const selectedOpts = Array.isArray(studentResponse.selectedOptions)
                    ? studentResponse.selectedOptions.map(norm)
                    : [];
                // Exact set match required
                isCorrect = correctSet.size === selectedOpts.length &&
                    selectedOpts.every(o => correctSet.has(o));
                // Partial credit: score proportional to correct selections
                if (!isCorrect && correctSet.size > 0) {
                    const correctCount = selectedOpts.filter(o => correctSet.has(o)).length;
                    const wrongCount = selectedOpts.filter(o => !correctSet.has(o)).length;
                    const partialFraction = Math.max(0, (correctCount - wrongCount)) / correctSet.size;
                    scoreAwarded = parseFloat((partialFraction * question.score).toFixed(2));
                }
                else {
                    scoreAwarded = isCorrect
                        ? question.score
                        : (assignment.exam.allowNegativeMarking ? -question.negativeMarks : 0);
                }
            }
            else if (question.type === 'CODING') {
                const studentCode = studentResponse.value || '';
                const studentLanguage = studentResponse.language || 'python';
                const answersObj = question.answers;
                const testCases = Array.isArray(answersObj?.testCases) ? answersObj.testCases : [];
                if (studentCode.trim() && testCases.length > 0) {
                    try {
                        const report = await (0, codeExecution_service_1.executeCode)(studentLanguage, studentCode, testCases);
                        const totalCases = testCases.length;
                        const passedCases = report.results.filter((r) => r.passed).length;
                        isCorrect = passedCases === totalCases;
                        scoreAwarded = totalCases > 0
                            ? parseFloat(((passedCases / totalCases) * question.score).toFixed(2))
                            : 0;
                    }
                    catch {
                        isCorrect = false;
                        scoreAwarded = 0;
                    }
                }
            }
            else {
                // DESCRIPTIVE — requires manual grading
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
        // ── Calculate percentage & grade ───────────────────────────────────────
        const maxPossibleScore = examQuestions.reduce((acc, q) => acc + q.score, 0);
        const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
        // passingMarks is stored as a raw score threshold (e.g. 40 out of 100)
        const isPassed = totalScore >= assignment.exam.passingMarks;
        let grade = 'F';
        if (percentage >= 90)
            grade = 'A+';
        else if (percentage >= 80)
            grade = 'A';
        else if (percentage >= 70)
            grade = 'B';
        else if (percentage >= 60)
            grade = 'C';
        else if (percentage >= 40)
            grade = 'D';
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
                maxPossibleScore,
                percentage: parseFloat(percentage.toFixed(2)),
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
        const isPassed = totalScore >= passingMarks;
        let grade = 'F';
        if (percentage >= 90)
            grade = 'A+';
        else if (percentage >= 80)
            grade = 'A';
        else if (percentage >= 70)
            grade = 'B';
        else if (percentage >= 60)
            grade = 'C';
        else if (percentage >= 40)
            grade = 'D';
        // Check if other descriptive questions in this submission are still un-evaluated
        const pendingQuestionsCount = submissionAnswers.filter(a => a.scoreAwarded === null).length;
        await db_1.prisma.submission.update({
            where: { id: answer.submissionId },
            data: {
                totalScore,
                percentage,
                isPassed,
                grade,
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
const getSubmissions = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const examId = req.query.examId;
    const search = req.query.search;
    try {
        const skip = (page - 1) * limit;
        const where = {};
        if (status && status !== 'ALL') {
            where.status = status;
        }
        if (examId && examId !== 'ALL') {
            where.examId = examId;
        }
        if (search) {
            where.student = {
                OR: [
                    { firstName: { contains: search } },
                    { lastName: { contains: search } },
                    { email: { contains: search } }
                ]
            };
        }
        const [submissions, total] = await Promise.all([
            db_1.prisma.submission.findMany({
                where,
                include: {
                    student: { select: { firstName: true, lastName: true, email: true } },
                    exam: {
                        include: {
                            examQuestions: {
                                include: {
                                    question: {
                                        select: { score: true }
                                    }
                                }
                            }
                        }
                    },
                    answers: true
                },
                orderBy: { submitTime: 'desc' },
                skip,
                take: limit
            }),
            db_1.prisma.submission.count({ where })
        ]);
        return res.status(200).json({
            success: true,
            data: {
                submissions,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit)
                }
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSubmissions = getSubmissions;
const updateSubmission = async (req, res, next) => {
    const { id } = req.params;
    const { status, totalScore, percentage, grade, isPassed } = req.body;
    try {
        const submission = await db_1.prisma.submission.findUnique({
            where: { id },
            include: {
                exam: {
                    include: {
                        examQuestions: {
                            include: { question: true }
                        }
                    }
                }
            }
        });
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found.' });
        }
        const updateData = {};
        if (status !== undefined)
            updateData.status = status;
        if (totalScore !== undefined) {
            const score = parseFloat(totalScore);
            updateData.totalScore = score;
            const maxPossibleScore = submission.exam.examQuestions.reduce((acc, eq) => acc + eq.question.score, 0);
            const percentage = maxPossibleScore > 0 ? (score / maxPossibleScore) * 100 : 0;
            updateData.percentage = percentage;
            let gradeVal = 'F';
            if (percentage >= 90)
                gradeVal = 'A+';
            else if (percentage >= 80)
                gradeVal = 'A';
            else if (percentage >= 70)
                gradeVal = 'B';
            else if (percentage >= 60)
                gradeVal = 'C';
            else if (percentage >= 40)
                gradeVal = 'D';
            updateData.grade = gradeVal;
            updateData.isPassed = score >= submission.exam.passingMarks;
        }
        else {
            if (percentage !== undefined)
                updateData.percentage = parseFloat(percentage);
            if (grade !== undefined)
                updateData.grade = grade;
            if (isPassed !== undefined)
                updateData.isPassed = isPassed;
        }
        const updated = await db_1.prisma.submission.update({ where: { id }, data: updateData });
        return res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
};
exports.updateSubmission = updateSubmission;
const deleteSubmission = async (req, res, next) => {
    const { id } = req.params;
    try {
        const submission = await db_1.prisma.submission.findUnique({ where: { id } });
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found.' });
        }
        // Reset ExamAssignment
        await db_1.prisma.examAssignment.updateMany({
            where: { examId: submission.examId, studentId: submission.studentId },
            data: {
                status: 'ASSIGNED',
                startTime: null,
                submitTime: null,
                tabSwitchCount: 0,
                exitFullscreenCount: 0
            }
        });
        await db_1.prisma.submission.delete({ where: { id } });
        return res.status(200).json({ success: true, message: 'Submission deleted successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteSubmission = deleteSubmission;
const bulkDeleteSubmissions = async (req, res, next) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
        return res.status(400).json({ success: false, message: 'Provide an array of submission IDs.' });
    try {
        const submissions = await db_1.prisma.submission.findMany({
            where: { id: { in: ids } }
        });
        for (const sub of submissions) {
            await db_1.prisma.examAssignment.updateMany({
                where: { examId: sub.examId, studentId: sub.studentId },
                data: {
                    status: 'ASSIGNED',
                    startTime: null,
                    submitTime: null,
                    tabSwitchCount: 0,
                    exitFullscreenCount: 0
                }
            });
        }
        await db_1.prisma.answer.deleteMany({ where: { submissionId: { in: ids } } });
        const { count } = await db_1.prisma.submission.deleteMany({ where: { id: { in: ids } } });
        return res.status(200).json({ success: true, message: `Deleted ${count} submission(s).` });
    }
    catch (error) {
        next(error);
    }
};
exports.bulkDeleteSubmissions = bulkDeleteSubmissions;
const getMySubmission = async (req, res, next) => {
    const { examId } = req.params;
    const studentId = req.user?.id || '';
    try {
        const submission = await db_1.prisma.submission.findUnique({
            where: { examId_studentId: { examId, studentId } },
            include: {
                exam: {
                    include: {
                        examQuestions: {
                            include: { question: true }
                        }
                    }
                }
            }
        });
        if (!submission) {
            return res.status(404).json({ success: false, message: 'Submission not found.' });
        }
        const maxPossibleScore = submission.exam.examQuestions.reduce((acc, eq) => acc + eq.question.score, 0);
        return res.status(200).json({
            success: true,
            data: {
                id: submission.id,
                status: submission.status,
                totalScore: submission.status === 'PUBLISHED' ? submission.totalScore : null,
                percentage: submission.status === 'PUBLISHED' ? submission.percentage : null,
                grade: submission.status === 'PUBLISHED' ? submission.grade : null,
                isPassed: submission.status === 'PUBLISHED' ? submission.isPassed : null,
                maxPossibleScore
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMySubmission = getMySubmission;
const bulkPublishSubmissions = async (req, res, next) => {
    const { ids } = req.body;
    try {
        const whereClause = {};
        if (Array.isArray(ids) && ids.length > 0) {
            whereClause.id = { in: ids };
        }
        else {
            whereClause.status = { in: ['COMPLETED', 'GRADED', 'PENDING'] };
        }
        const { count } = await db_1.prisma.submission.updateMany({
            where: whereClause,
            data: { status: 'PUBLISHED' }
        });
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'BULK_PUBLISH_SUBMISSIONS',
                target: `Published ${count} submissions`,
                ipAddress: req.ip
            }
        });
        return res.status(200).json({ success: true, message: `Successfully published ${count} result(s).` });
    }
    catch (error) {
        next(error);
    }
};
exports.bulkPublishSubmissions = bulkPublishSubmissions;
