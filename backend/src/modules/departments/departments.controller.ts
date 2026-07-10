import { Response, NextFunction } from 'express';
import { prisma } from '../../database/db';
import { AuthenticatedRequest } from '../../middleware/auth';

export const getDepartments = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { users: { where: { role: 'STUDENT' } }, subjects: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    return res.status(200).json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { name, code, description } = req.body;

  try {
    const existing = await prisma.department.findFirst({
      where: {
        OR: [{ name }, { code }]
      }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Department with this name or code already exists.' });
    }

    const dept = await prisma.department.create({
      data: { name, code, description }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'CREATE_DEPARTMENT',
        target: `Department ID: ${dept.id}`,
        ipAddress: req.ip
      }
    });

    return res.status(201).json({ success: true, data: dept });
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { name, code, description } = req.body;

  try {
    const dept = await prisma.department.findUnique({ where: { id } });
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    const existing = await prisma.department.findFirst({
      where: {
        OR: [{ name }, { code }],
        NOT: { id }
      }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Department with this name or code already exists.' });
    }

    const updated = await prisma.department.update({
      where: { id },
      data: { name, code, description }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'UPDATE_DEPARTMENT',
        target: `Department ID: ${id}`,
        ipAddress: req.ip
      }
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const dept = await prisma.department.findUnique({ where: { id } });
    if (!dept) {
      return res.status(404).json({ success: false, message: 'Department not found.' });
    }

    await prisma.department.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'DELETE_DEPARTMENT',
        target: `Department ID: ${id} (${dept.name})`,
        ipAddress: req.ip
      }
    });

    return res.status(200).json({ success: true, message: 'Department deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
