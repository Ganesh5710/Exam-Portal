import { Response, NextFunction } from 'express';
import { prisma } from '../../database/db';
import { AuthenticatedRequest } from '../../middleware/auth';

export const getSubjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        department: { select: { name: true, code: true } },
        _count: { select: { questions: true, exams: true } }
      },
      orderBy: { name: 'asc' }
    });

    return res.status(200).json({ success: true, data: subjects });
  } catch (error) {
    next(error);
  }
};

export const createSubject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { name, code, course, semester, departmentId } = req.body;

  try {
    const existing = await prisma.subject.findUnique({ where: { code } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Subject with this code already exists.' });
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        course,
        semester: parseInt(semester),
        departmentId
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'CREATE_SUBJECT',
        target: `Subject ID: ${subject.id}`,
        ipAddress: req.ip
      }
    });

    return res.status(201).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

export const updateSubject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, code, course, semester, departmentId } = req.body;

  try {
    const sub = await prisma.subject.findUnique({ where: { id } });
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    const existing = await prisma.subject.findFirst({
      where: {
        code,
        NOT: { id }
      }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Subject with this code already exists.' });
    }

    const updated = await prisma.subject.update({
      where: { id },
      data: {
        name,
        code,
        course,
        semester: parseInt(semester),
        departmentId
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'UPDATE_SUBJECT',
        target: `Subject ID: ${id}`,
        ipAddress: req.ip
      }
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteSubject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const sub = await prisma.subject.findUnique({ where: { id } });
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subject not found.' });
    }

    await prisma.subject.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'DELETE_SUBJECT',
        target: `Subject ID: ${id} (${sub.name})`,
        ipAddress: req.ip
      }
    });

    return res.status(200).json({ success: true, message: 'Subject deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
