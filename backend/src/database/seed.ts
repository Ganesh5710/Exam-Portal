import { prisma } from './db';
import bcrypt from 'bcryptjs';
import { logger } from '../config/logger';

export const seedDatabase = async () => {
  try {
    logger.info('Database Seeder: Initializing mock data checks...');

    // 1. Seed Department
    let dept = await prisma.department.findFirst();
    if (!dept) {
      dept = await prisma.department.create({
        data: {
          name: 'Computer Science & Engineering',
          code: 'CSE'
        }
      });
      logger.info('Seeded Department: Computer Science & Engineering (CSE)');
    }

    // 2. Seed Subject
    let subject = await prisma.subject.findFirst();
    if (!subject) {
      subject = await prisma.subject.create({
        data: {
          name: 'Data Structures & Algorithms',
          code: 'CS201',
          course: 'B.Tech CSE',
          semester: 4,
          departmentId: dept.id
        }
      });
      logger.info('Seeded Subject: Data Structures & Algorithms (CS201)');
    }

    // 3. Seed Users
    const adminEmail = 'admin@onlineexam.com';
    let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!admin) {
      const adminHash = await bcrypt.hash('AdminPassword123!', 10);
      admin = await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash: adminHash,
          firstName: 'System',
          lastName: 'Administrator',
          role: 'ADMIN',
          status: 'ACTIVE',
          departmentId: dept.id
        }
      });
      logger.info(`Seeded Admin User: ${adminEmail}`);
    }

    const studentEmail = 'student@onlineexam.com';
    let student = await prisma.user.findUnique({ where: { email: studentEmail } });
    if (!student) {
      const studentHash = await bcrypt.hash('StudentPassword123!', 10);
      student = await prisma.user.create({
        data: {
          email: studentEmail,
          passwordHash: studentHash,
          firstName: 'Ganesh',
          lastName: 'Bathula',
          role: 'STUDENT',
          status: 'ACTIVE',
          departmentId: dept.id
        }
      });
      logger.info(`Seeded Student User: ${studentEmail}`);
    }

    // 4. Seed Questions
    const questionCount = await prisma.question.count();
    let q1, q2;
    if (questionCount === 0) {
      q1 = await prisma.question.create({
        data: {
          type: 'MCQ',
          content: 'Which of the following data structures operates on a Last In First Out (LIFO) basis?',
          options: ['Queue', 'Stack', 'Linked List', 'Binary Tree'],
          answers: ['Stack'],
          score: 5.0,
          difficulty: 'EASY',
          subjectId: subject.id
        }
      });

      q2 = await prisma.question.create({
        data: {
          type: 'CODING',
          content: 'Write a program in Python or JavaScript that receives an integer as input on stdin, and outputs its square (integer multiplied by itself) on stdout.',
          options: [],
          answers: { testCases: [{ input: '5', expectedOutput: '25' }] },
          score: 15.0,
          difficulty: 'MEDIUM',
          subjectId: subject.id
        }
      });
      logger.info('Seeded mock questions (MCQ + Coding)');
    } else {
      const qs = await prisma.question.findMany({ take: 2 });
      q1 = qs[0];
      q2 = qs[1];
    }

    // 5. Seed Exam
    const examCount = await prisma.exam.count();
    if (examCount === 0 && q1 && q2) {
      const startTime = new Date();
      const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

      const exam = await prisma.exam.create({
        data: {
          title: 'CSE Semester Midterm Assessment',
          description: 'Midterm test checking basic knowledge of stack and array algorithms.',
          duration: 30, // 30 mins
          startTime,
          endTime,
          passingMarks: 10.0,
          fullscreenRequired: true,
          status: 'PUBLISHED',
          subjectId: subject.id,
          examQuestions: {
            create: [
              { questionId: q1.id, orderIndex: 0 },
              { questionId: q2.id, orderIndex: 1 }
            ]
          },
          assignments: {
            create: [
              { studentId: student.id }
            ]
          }
        }
      });
      logger.info(`Seeded Active Assigned Exam: "${exam.title}"`);
    }

    logger.info('Database Seeder: Done.');
  } catch (err) {
    logger.error(`Database Seeder error: ${(err as Error).message}`);
  }
};
