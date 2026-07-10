import { Response, NextFunction } from 'express';
import { prisma } from '../../database/db';
import { AuthenticatedRequest } from '../../middleware/auth';
import { ExamStatus } from '@prisma/client';

export const getExams = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const role = req.user?.role;
  const userId = req.user?.id;

  try {
    if (role === 'ADMIN') {
      const exams = await prisma.exam.findMany({
        include: {
          subject: { select: { name: true, code: true } },
          _count: { select: { examQuestions: true, assignments: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      return res.status(200).json({ success: true, data: exams });
    } else {
      // Students see only exams assigned to them that are currently published
      const assignments = await prisma.examAssignment.findMany({
        where: {
          studentId: userId,
          exam: {
            status: 'PUBLISHED'
          }
        },
        include: {
          exam: {
            include: {
              subject: { select: { name: true, code: true } }
            }
          }
        },
        orderBy: { exam: { startTime: 'asc' } }
      });

      const exams = assignments.map(a => ({
        ...a.exam,
        assignmentId: a.id,
        status: a.status,
        startTime: a.startTime || a.exam.startTime,
        submitTime: a.submitTime
      }));

      return res.status(200).json({ success: true, data: exams });
    }
  } catch (error) {
    next(error);
  }
};

export const createExam = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { title, description, instructions, duration, passingMarks, allowNegativeMarking, shuffleQuestions, shuffleOptions, fullscreenRequired, startTime, endTime, subjectId, questionIds } = req.body;

  try {
    // Create exam
    const exam = await prisma.exam.create({
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
        subjectId,
        status: 'DRAFT'
      }
    });

    // Map questions to the exam
    if (Array.isArray(questionIds) && questionIds.length > 0) {
      const examQuestionsData = questionIds.map((qId: string, idx: number) => ({
        examId: exam.id,
        questionId: qId,
        orderIndex: idx
      }));

      await prisma.examQuestion.createMany({
        data: examQuestionsData
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'CREATE_EXAM',
        target: `Exam ID: ${exam.id}`,
        ipAddress: req.ip
      }
    });

    return res.status(201).json({ success: true, data: exam });
  } catch (error) {
    next(error);
  }
};

export const updateExam = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { title, description, instructions, duration, passingMarks, allowNegativeMarking, shuffleQuestions, shuffleOptions, fullscreenRequired, startTime, endTime, status, subjectId, questionIds } = req.body;

  try {
    const existing = await prisma.exam.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    const updated = await prisma.exam.update({
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
        subjectId: subjectId || existing.subjectId
      }
    });

    // Re-map questions if questionIds list was provided
    if (Array.isArray(questionIds)) {
      // Clear old questions
      await prisma.examQuestion.deleteMany({ where: { examId: id } });

      if (questionIds.length > 0) {
        const examQuestionsData = questionIds.map((qId: string, idx: number) => ({
          examId: id,
          questionId: qId,
          orderIndex: idx
        }));
        await prisma.examQuestion.createMany({ data: examQuestionsData });
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'UPDATE_EXAM',
        target: `Exam ID: ${id}`,
        ipAddress: req.ip
      }
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteExam = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const exam = await prisma.exam.findUnique({ where: { id } });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    await prisma.exam.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'DELETE_EXAM',
        target: `Exam ID: ${id} (${exam.title})`,
        ipAddress: req.ip
      }
    });

    return res.status(200).json({ success: true, message: 'Exam deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const assignExam = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { examId, studentIds } = req.body; // array of student user ids

  try {
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (!exam) {
      return res.status(404).json({ success: false, message: 'Exam not found.' });
    }

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Student list is required.' });
    }

    let assigned = 0;
    for (const sId of studentIds) {
      const exist = await prisma.examAssignment.findUnique({
        where: { examId_studentId: { examId, studentId: sId } }
      });
      if (exist) continue;

      await prisma.examAssignment.create({
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
  } catch (error) {
    next(error);
  }
};

export const getExamQuestionsForStudent = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const userId = req.user?.id || '';

  try {
    // Verify user is assigned to this exam
    const assignment = await prisma.examAssignment.findUnique({
      where: { examId_studentId: { examId: id, studentId: userId } }
    });

    if (!assignment) {
      return res.status(403).json({ success: false, message: 'You are not assigned to this exam.' });
    }

    if (assignment.status === 'SUBMITTED' || assignment.status === 'BLOCKED') {
      return res.status(403).json({ success: false, message: `Exam status: ${assignment.status}. Access blocked.` });
    }

    const exam = await prisma.exam.findUnique({
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
      await prisma.examAssignment.update({
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
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteExams = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0)
    return res.status(400).json({ success: false, message: 'Provide an array of exam IDs.' });
  try {
    await prisma.examAssignment.deleteMany({ where: { examId: { in: ids } } });
    await prisma.examQuestion.deleteMany({ where: { examId: { in: ids } } });
    await prisma.submission.deleteMany({ where: { examId: { in: ids } } });
    const { count } = await prisma.exam.deleteMany({ where: { id: { in: ids } } });
    return res.status(200).json({ success: true, message: `Deleted ${count} exam(s).` });
  } catch (error) { next(error); }
};
