"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkDeleteExams = exports.getExamQuestionsForStudent = exports.assignExam = exports.deleteExam = exports.updateExam = exports.createExam = exports.getExams = void 0;
const db_1 = require("../../database/db");
const getExams = async (req, res, next) => {
    const role = req.user?.role;
    const userId = req.user?.id;
    try {
        if (role === 'ADMIN') {
            const exams = await db_1.prisma.exam.findMany({
                include: {
                    department: { select: { name: true, code: true } },
                    _count: { select: { examQuestions: true, assignments: true } }
                },
                orderBy: { createdAt: 'desc' }
            });
            return res.status(200).json({ success: true, data: exams });
        }
        else {
            // Students see only exams assigned to them that are currently published
            const assignments = await db_1.prisma.examAssignment.findMany({
                where: {
                    studentId: userId,
                    exam: {
                        status: 'PUBLISHED'
                    }
                },
                include: {
                    exam: {
                        include: {
                            department: { select: { name: true, code: true } }
                        }
                    }
                },
                orderBy: { exam: { startTime: 'asc' } }
            });
            const exams = await Promise.all(assignments.map(async (a) => {
                const submission = await db_1.prisma.submission.findUnique({
                    where: { examId_studentId: { examId: a.examId, studentId: userId } },
                    include: {
                        exam: {
                            include: {
                                examQuestions: {
                                    include: { question: { select: { score: true } } }
                                }
                            }
                        }
                    }
                });
                const maxScore = submission
                    ? submission.exam.examQuestions.reduce((sum, eq) => sum + eq.question.score, 0)
                    : 0;
                return {
                    ...a.exam,
                    assignmentId: a.id,
                    status: a.status,
                    startTime: a.startTime || a.exam.startTime,
                    submitTime: a.submitTime,
                    submission: submission ? {
                        id: submission.id,
                        status: submission.status,
                        totalScore: submission.status === 'PUBLISHED' ? submission.totalScore : null,
                        percentage: submission.status === 'PUBLISHED' ? submission.percentage : null,
                        grade: submission.status === 'PUBLISHED' ? submission.grade : null,
                        isPassed: submission.status === 'PUBLISHED' ? submission.isPassed : null,
                        maxPossibleScore: maxScore
                    } : null
                };
            }));
            return res.status(200).json({ success: true, data: exams });
        }
    }
    catch (error) {
        next(error);
    }
};
exports.getExams = getExams;
const createExam = async (req, res, next) => {
    const { title, description, instructions, duration, passingMarks, allowNegativeMarking, shuffleQuestions, shuffleOptions, fullscreenRequired, startTime, endTime, departmentId, questionIds } = req.body;
    try {
        // Create exam
        const exam = await db_1.prisma.exam.create({
            data: {
                title,
                description,
                instructions,
                duration: parseInt(duration),
                passingMarks: parseFloat(passingMarks),
                allowNegativeMarking: !!allowNegativeMarking,
                shuffleQuestions: !!shuffleQuestions,
                shuffleOptions: !!shuffleOptions,
                fullscreenRequired: !!fullscreenRequired,
                startTime: new Date(startTime),
                endTime: new Date(endTime),
                departmentId,
                status: 'DRAFT'
            }
        });
        // Map questions to the exam
        if (Array.isArray(questionIds) && questionIds.length > 0) {
            const examQuestionsData = questionIds.map((qId, idx) => ({
                examId: exam.id,
                questionId: qId,
                orderIndex: idx
            }));
            await db_1.prisma.examQuestion.createMany({
                data: examQuestionsData
            });
        }
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'CREATE_EXAM',
                target: `Exam ID: ${exam.id}`,
                ipAddress: req.ip
            }
        });
        return res.status(201).json({ success: true, data: exam });
    }
    catch (error) {
        next(error);
    }
};
exports.createExam = createExam;
const updateExam = async (req, res, next) => {
    const { id } = req.params;
    const { title, description, instructions, duration, passingMarks, allowNegativeMarking, shuffleQuestions, shuffleOptions, fullscreenRequired, startTime, endTime, status, departmentId, questionIds } = req.body;
    try {
        const existing = await db_1.prisma.exam.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Exam not found.' });
        }
        const updated = await db_1.prisma.exam.update({
            where: { id },
            data: {
                title: title || existing.title,
                description: description !== undefined ? description : existing.description,
                instructions: instructions !== undefined ? instructions : existing.instructions,
                duration: duration !== undefined ? parseInt(duration) : existing.duration,
                passingMarks: passingMarks !== undefined ? parseFloat(passingMarks) : existing.passingMarks,
                allowNegativeMarking: allowNegativeMarking !== undefined ? !!allowNegativeMarking : existing.allowNegativeMarking,
                shuffleQuestions: shuffleQuestions !== undefined ? !!shuffleQuestions : existing.shuffleQuestions,
                shuffleOptions: shuffleOptions !== undefined ? !!shuffleOptions : existing.shuffleOptions,
                fullscreenRequired: fullscreenRequired !== undefined ? !!fullscreenRequired : existing.fullscreenRequired,
                startTime: startTime ? new Date(startTime) : existing.startTime,
                endTime: endTime ? new Date(endTime) : existing.endTime,
                status: status || existing.status,
                departmentId: departmentId || existing.departmentId
            }
        });
        // Re-map questions if questionIds list was provided
        if (Array.isArray(questionIds)) {
            // Clear old questions
            await db_1.prisma.examQuestion.deleteMany({ where: { examId: id } });
            if (questionIds.length > 0) {
                const examQuestionsData = questionIds.map((qId, idx) => ({
                    examId: id,
                    questionId: qId,
                    orderIndex: idx
                }));
                await db_1.prisma.examQuestion.createMany({ data: examQuestionsData });
            }
        }
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'UPDATE_EXAM',
                target: `Exam ID: ${id}`,
                ipAddress: req.ip
            }
        });
        return res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        next(error);
    }
};
exports.updateExam = updateExam;
const deleteExam = async (req, res, next) => {
    const { id } = req.params;
    try {
        const exam = await db_1.prisma.exam.findUnique({ where: { id } });
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found.' });
        }
        await db_1.prisma.exam.delete({ where: { id } });
        await db_1.prisma.auditLog.create({
            data: {
                userId: req.user?.id,
                action: 'DELETE_EXAM',
                target: `Exam ID: ${id} (${exam.title})`,
                ipAddress: req.ip
            }
        });
        return res.status(200).json({ success: true, message: 'Exam deleted successfully.' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteExam = deleteExam;
const assignExam = async (req, res, next) => {
    const { examId, studentIds, emails } = req.body;
    try {
        const exam = await db_1.prisma.exam.findUnique({ where: { id: examId } });
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found.' });
        }
        let targetStudentIds = [];
        if (Array.isArray(studentIds)) {
            targetStudentIds = [...studentIds];
        }
        // Parse email list
        let emailList = [];
        if (typeof emails === 'string') {
            emailList = emails.split(/[\n,;]+/).map(e => e.trim()).filter(e => e.length > 0 && e.includes('@'));
        }
        else if (Array.isArray(emails)) {
            emailList = emails.map(e => e.trim()).filter(e => e.length > 0 && e.includes('@'));
        }
        // Find or create students on the fly for each email
        for (const email of emailList) {
            let student = await db_1.prisma.user.findUnique({ where: { email } });
            if (!student) {
                student = await db_1.prisma.user.create({
                    data: {
                        email,
                        passwordHash: '',
                        firstName: email.split('@')[0],
                        lastName: '',
                        role: 'STUDENT',
                        status: 'ACTIVE'
                    }
                });
            }
            if (student.role === 'STUDENT') {
                targetStudentIds.push(student.id);
            }
        }
        // Deduplicate target student IDs
        targetStudentIds = Array.from(new Set(targetStudentIds));
        if (targetStudentIds.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid students or email addresses provided.' });
        }
        let assigned = 0;
        for (const sId of targetStudentIds) {
            const exist = await db_1.prisma.examAssignment.findUnique({
                where: { examId_studentId: { examId, studentId: sId } }
            });
            if (exist)
                continue;
            await db_1.prisma.examAssignment.create({
                data: {
                    examId,
                    studentId: sId,
                    status: 'ASSIGNED'
                }
            });
            assigned++;
        }
        return res.status(201).json({
            success: true,
            message: `Exam assigned successfully. Assigned ${assigned} new students.`
        });
    }
    catch (error) {
        next(error);
    }
};
exports.assignExam = assignExam;
/**
 * Validates candidate assignment permissions, verifies the active schedule window,
 * updates student STARTED timestamp, and delivers sanitized exam questions with optional shuffling.
 */
const getExamQuestionsForStudent = async (req, res, next) => {
    const { id } = req.params;
    const userId = req.user?.id || '';
    try {
        // Verify user is assigned to this exam
        const assignment = await db_1.prisma.examAssignment.findUnique({
            where: { examId_studentId: { examId: id, studentId: userId } }
        });
        if (!assignment) {
            return res.status(403).json({ success: false, message: 'You are not assigned to this exam.' });
        }
        if (assignment.status === 'SUBMITTED' || assignment.status === 'BLOCKED') {
            return res.status(403).json({ success: false, message: `Exam status: ${assignment.status}. Access blocked.` });
        }
        const exam = await db_1.prisma.exam.findUnique({
            where: { id },
            include: {
                examQuestions: {
                    include: {
                        question: {
                            select: {
                                id: true,
                                type: true,
                                content: true,
                                options: true,
                                score: true,
                                difficulty: true,
                                fileUrl: true
                            }
                        }
                    }
                }
            }
        });
        if (!exam) {
            return res.status(404).json({ success: false, message: 'Exam not found.' });
        }
        // Check scheduling window
        const now = new Date();
        if (now < exam.startTime) {
            return res.status(403).json({ success: false, message: 'This exam has not started yet.' });
        }
        if (now > exam.endTime) {
            return res.status(403).json({ success: false, message: 'The exam schedule window has closed.' });
        }
        // Track when the student starts the exam
        if (assignment.status === 'ASSIGNED') {
            await db_1.prisma.examAssignment.update({
                where: { id: assignment.id },
                data: {
                    status: 'STARTED',
                    startTime: now
                }
            });
        }
        let questions = exam.examQuestions.map(eq => eq.question);
        // Shuffle questions if toggled
        if (exam.shuffleQuestions) {
            questions = questions.sort(() => Math.random() - 0.5);
        }
        // Shuffle options of MCQs if options shuffle is active
        if (exam.shuffleOptions) {
            questions = questions.map(q => {
                if ((q.type === 'MCQ' || q.type === 'MULTI_CORRECT') && Array.isArray(q.options)) {
                    return {
                        ...q,
                        options: [...q.options].sort(() => Math.random() - 0.5)
                    };
                }
                return q;
            });
        }
        return res.status(200).json({
            success: true,
            data: {
                exam: {
                    id: exam.id,
                    title: exam.title,
                    instructions: exam.instructions,
                    duration: exam.duration,
                    fullscreenRequired: exam.fullscreenRequired,
                    endTime: exam.endTime,
                    assignmentStartTime: assignment.startTime || now
                },
                questions
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getExamQuestionsForStudent = getExamQuestionsForStudent;
const bulkDeleteExams = async (req, res, next) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
        return res.status(400).json({ success: false, message: 'Provide an array of exam IDs.' });
    try {
        await db_1.prisma.examAssignment.deleteMany({ where: { examId: { in: ids } } });
        await db_1.prisma.examQuestion.deleteMany({ where: { examId: { in: ids } } });
        await db_1.prisma.submission.deleteMany({ where: { examId: { in: ids } } });
        const { count } = await db_1.prisma.exam.deleteMany({ where: { id: { in: ids } } });
        return res.status(200).json({ success: true, message: `Deleted ${count} exam(s).` });
    }
    catch (error) {
        next(error);
    }
};
exports.bulkDeleteExams = bulkDeleteExams;
