const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database...');
  
  // 1. Get or create CSE department
  let dept = await prisma.department.findFirst({
    where: { code: 'CSE' }
  });
  if (!dept) {
    dept = await prisma.department.create({
      data: {
        name: 'Computer Science & Engineering',
        code: 'CSE'
      }
    });
    console.log('Created department CSE');
  }

  // 2. Reset Admin User
  const adminEmail = 'admin@onlineexam.com';
  const adminHash = await bcrypt.hash('Admin@123', 10);
  
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      passwordHash: adminHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      firstName: 'System',
      lastName: 'Administrator',
      departmentId: dept.id,
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
      departmentId: dept.id,
      loginAttempts: 0,
      lockUntil: null
    }
  });
  console.log(`Successfully reset and unlocked admin user: ${adminEmail}`);

  // 3. Reset Student User
  const studentEmail = 'student@onlineexam.com';
  const studentHash = await bcrypt.hash('Student@123', 10);

  await prisma.user.upsert({
    where: { email: studentEmail },
    update: {
      passwordHash: studentHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      firstName: 'Ganesh',
      lastName: 'Bathula',
      departmentId: dept.id,
      loginAttempts: 0,
      lockUntil: null
    },
    create: {
      email: studentEmail,
      passwordHash: studentHash,
      role: 'STUDENT',
      status: 'ACTIVE',
      firstName: 'Ganesh',
      lastName: 'Bathula',
      departmentId: dept.id,
      loginAttempts: 0,
      lockUntil: null
    }
  });
  console.log(`Successfully reset and unlocked student user: ${studentEmail}`);
  
  console.log('Done resetting and unlocking credentials!');
}

main()
  .catch((e) => {
    console.error('Error running reset script:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
