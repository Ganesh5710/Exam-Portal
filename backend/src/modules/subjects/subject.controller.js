const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get all subjects with question & exam counts
 */
const getSubjects = async (req, res) => {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        department: { select: { id: true, name: true, code: true } },
        _count: { select: { questions: true, exams: true } },
      },
      orderBy: { name: 'asc' },
    });

    res.json({
      success: true,
      data: subjects,
    });
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch subjects' });
  }
};

/**
 * Create a new subject
 */
const createSubject = async (req, res) => {
  try {
    const { name, code, description, departmentId } = req.body;

    if (!name || !code) {
      return res.status(400).json({ success: false, message: 'Subject name and code are required' });
    }

    const existingCode = await prisma.subject.findUnique({
      where: { code: code.trim().toUpperCase() },
    });

    if (existingCode) {
      return res.status(400).json({ success: false, message: `Subject code '${code}' already exists` });
    }

    const subject = await prisma.subject.create({
      data: {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description ? description.trim() : null,
        departmentId: departmentId || null,
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
        _count: { select: { questions: true, exams: true } },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Subject created successfully',
      data: subject,
    });
  } catch (error) {
    console.error('Error creating subject:', error);
    res.status(500).json({ success: false, message: 'Failed to create subject' });
  }
};

/**
 * Update an existing subject
 */
const updateSubject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, departmentId } = req.body;

    const existing = await prisma.subject.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    if (code && code.trim().toUpperCase() !== existing.code) {
      const codeCheck = await prisma.subject.findUnique({
        where: { code: code.trim().toUpperCase() },
      });
      if (codeCheck) {
        return res.status(400).json({ success: false, message: `Subject code '${code}' is already used by another subject` });
      }
    }

    const updated = await prisma.subject.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(code && { code: code.trim().toUpperCase() }),
        ...(description !== undefined && { description: description ? description.trim() : null }),
        ...(departmentId !== undefined && { departmentId: departmentId || null }),
      },
      include: {
        department: { select: { id: true, name: true, code: true } },
        _count: { select: { questions: true, exams: true } },
      },
    });

    res.json({
      success: true,
      message: 'Subject updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating subject:', error);
    res.status(500).json({ success: false, message: 'Failed to update subject' });
  }
};

/**
 * Delete a subject
 */
const deleteSubject = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.subject.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Subject not found' });
    }

    await prisma.subject.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Subject deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting subject:', error);
    res.status(500).json({ success: false, message: 'Failed to delete subject' });
  }
};

module.exports = {
  getSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
};
