const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database to clean data...');

  // 1. Delete all student assignments, submissions, answers, questions, exams, subjects, and departments
  console.log('Deleting dependent relation records...');
  await prisma.examQuestion.deleteMany({});
  await prisma.examAssignment.deleteMany({});
  await prisma.answer.deleteMany({});
  await prisma.submission.deleteMany({});
  await prisma.question.deleteMany({});
  await prisma.exam.deleteMany({});
  
  console.log('Deleting users (except admin)...');
  await prisma.refreshToken.deleteMany({});
  await prisma.passwordResetToken.deleteMany({});
  await prisma.emailVerificationToken.deleteMany({});
  await prisma.auditLog.deleteMany({});
  await prisma.user.deleteMany({
    where: {
      email: { notIn: ['admin@onlineexam.com', 'Skillbrix@admin.in'] }
    }
  });

  console.log('Deleting departments...');
  await prisma.department.deleteMany({});

  // 2. Re-create / ensure Admin User exists with departmentId: null and password: Admin@123
  console.log('Resetting Admin User...');
  const adminEmail = 'Skillbrix@admin.in';
  const adminHash = await bcrypt.hash('Admin@123', 10);
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      firstName: 'System',
      lastName: 'Administrator',
      departmentId: null,
      loginAttempts: 0,
      lockUntil: null
    },
    create: {
      email: adminEmail,
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      firstName: 'System',
      lastName: 'Administrator',
      departmentId: null,
      loginAttempts: 0,
      lockUntil: null
    }
  });

  console.log('Database successfully cleaned! Only Admin (Skillbrix@admin.in / Admin@123) is preserved.');
}

main()
  .catch((e) => {
    console.error('Error cleaning database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
