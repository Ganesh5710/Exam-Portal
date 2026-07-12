"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
/**
 * seed.ts
 * Database seeder that runs at application startup.
 * Creates default department, subject, admin user, and student user
 * if they do not already exist in the database.
 */
const db_1 = require("./db");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const logger_1 = require("../config/logger");
const seedDatabase = async () => {
    try {
        logger_1.logger.info('Database Seeder: Initializing mock data checks...');
        // 1. Seed Department
        let dept = await db_1.prisma.department.findFirst();
        if (!dept) {
            dept = await db_1.prisma.department.create({
                data: {
                    name: 'Computer Science & Engineering',
                    code: 'CSE'
                }
            });
            logger_1.logger.info('Seeded Department: Computer Science & Engineering (CSE)');
        }
        // 2. Seed Subject
        let subject = await db_1.prisma.subject.findFirst();
        if (!subject) {
            subject = await db_1.prisma.subject.create({
                data: {
                    name: 'Data Structures & Algorithms',
                    code: 'CS201',
                    course: 'B.Tech CSE',
                    semester: 4,
                    departmentId: dept.id
                }
            });
            logger_1.logger.info('Seeded Subject: Data Structures & Algorithms (CS201)');
        }
        // 3. Seed Users
        const adminEmail = 'admin@onlineexam.com';
        let admin = await db_1.prisma.user.findUnique({ where: { email: adminEmail } });
        if (!admin) {
            const adminHash = await bcryptjs_1.default.hash('AdminPassword123!', 10);
            admin = await db_1.prisma.user.create({
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
            logger_1.logger.info(`Seeded Admin User: ${adminEmail}`);
        }
        const studentEmail = 'student@onlineexam.com';
        let student = await db_1.prisma.user.findUnique({ where: { email: studentEmail } });
        if (!student) {
            const studentHash = await bcryptjs_1.default.hash('StudentPassword123!', 10);
            student = await db_1.prisma.user.create({
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
            logger_1.logger.info(`Seeded Student User: ${studentEmail}`);
        }
        // 4. Seed Questions
        const questionCount = await db_1.prisma.question.count();
        let q1, q2;
        if (questionCount === 0) {
            q1 = await db_1.prisma.question.create({
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
            q2 = await db_1.prisma.question.create({
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
            logger_1.logger.info('Seeded mock questions (MCQ + Coding)');
        }
        else {
            const qs = await db_1.prisma.question.findMany({ take: 2 });
            q1 = qs[0];
            q2 = qs[1];
        }
        // 5. Seed Exam
        const examCount = await db_1.prisma.exam.count();
        if (examCount === 0 && q1 && q2) {
            const startTime = new Date();
            const endTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
            const exam = await db_1.prisma.exam.create({
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
            logger_1.logger.info(`Seeded Active Assigned Exam: "${exam.title}"`);
        }
        logger_1.logger.info('Database Seeder: Done.');
    }
    catch (err) {
        logger_1.logger.error(`Database Seeder error: ${err.message}`);
    }
};
exports.seedDatabase = seedDatabase;
