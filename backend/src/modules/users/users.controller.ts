/**
 * users.controller.ts
 * Handles admin user management: listing students, creating accounts,
 * updating profiles, blocking/unblocking, bulk delete, and password resets.
 */
import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../../database/db';
import { AuthenticatedRequest } from '../../middleware/auth';

export const getStudents = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const search = (req.query.search as string) || '';
  const departmentId = (req.query.departmentId as string) || '';

  const skip = (page - 1) * limit;

  try {
    const where: any = {
      role: 'STUDENT',
      OR: [
        { email: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
      ]
    };

    if (departmentId) {
      where.departmentId = departmentId;
    }

    const [students, total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          status: true,
          departmentId: true,
          department: {
            select: { name: true, code: true }
          },
          createdAt: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.user.count({ where })
    ]);

    return res.status(200).json({
      success: true,
      data: {
        students,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createStudent = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { email, password, firstName, lastName, departmentId } = req.body;

  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password || 'Student123!', 10);

    const student = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        departmentId: departmentId || null,
        role: 'STUDENT',
        status: 'ACTIVE'
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        departmentId: true,
        createdAt: true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'CREATE_STUDENT',
        target: `Student ID: ${student.id} (${student.email})`,
        ipAddress: req.ip
      }
    });

    return res.status(201).json({ success: true, data: student });
  } catch (error) {
    next(error);
  }
};

export const updateStudent = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { firstName, lastName, departmentId, status } = req.body;

  try {
    const student = await prisma.user.findFirst({ where: { id, role: 'STUDENT' } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        departmentId: departmentId || null,
        status: status || student.status
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        status: true,
        departmentId: true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'UPDATE_STUDENT',
        target: `Student ID: ${id}`,
        ipAddress: req.ip
      }
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteStudent = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const student = await prisma.user.findFirst({ where: { id, role: 'STUDENT' } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    await prisma.user.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'DELETE_STUDENT',
        target: `Student ID: ${id} (${student.email})`,
        ipAddress: req.ip
      }
    });

    return res.status(200).json({ success: true, message: 'Student deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const toggleBlockStudent = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { id } = req.params;

  try {
    const student = await prisma.user.findFirst({ where: { id, role: 'STUDENT' } });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found.' });
    }

    const newStatus = student.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';

    await prisma.user.update({
      where: { id },
      data: { status: newStatus }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: newStatus === 'BLOCKED' ? 'BLOCK_STUDENT' : 'UNBLOCK_STUDENT',
        target: `Student ID: ${id}`,
        ipAddress: req.ip
      }
    });

    return res.status(200).json({ success: true, message: `Student status updated to ${newStatus}.` });
  } catch (error) {
    next(error);
  }
};

export const bulkImportStudents = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { students } = req.body; // Array of {email, firstName, lastName, departmentCode, password}

  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ success: false, message: 'List of students is required.' });
  }

  try {
    let imported = 0;
    let skipped = 0;

    for (const record of students) {
      const { email, firstName, lastName, departmentCode, password } = record;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) {
        skipped++;
        continue;
      }

      let deptId: string | null = null;
      if (departmentCode) {
        const dept = await prisma.department.findUnique({ where: { code: departmentCode } });
        if (dept) deptId = dept.id;
      }

      const passwordHash = await bcrypt.hash(password || 'Student123!', 10);

      await prisma.user.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          departmentId: deptId,
          role: 'STUDENT',
          status: 'ACTIVE'
        }
      });
      imported++;
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user?.id,
        action: 'BULK_IMPORT_STUDENTS',
        target: `Imported: ${imported}, Skipped: ${skipped}`,
        ipAddress: req.ip
      }
    });

    return res.status(200).json({
      success: true,
      message: `Bulk import complete. Imported: ${imported}, Skipped: ${skipped}`
    });
  } catch (error) {
    next(error);
  }
};

export const bulkDeleteStudents = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0)
    return res.status(400).json({ success: false, message: 'Provide an array of student IDs.' });
  try {
    const { count } = await prisma.user.deleteMany({ where: { id: { in: ids }, role: 'STUDENT' } });
    return res.status(200).json({ success: true, message: `Deleted ${count} student(s).` });
  } catch (error) { next(error); }
};
