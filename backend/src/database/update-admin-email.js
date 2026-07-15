const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database to update Admin email...');

  const oldEmail = 'admin@onlineexam.com';
  const newEmail = 'admin@admin.in';
  const adminHash = await bcrypt.hash('Admin@123', 10);

  // Check if admin@onlineexam.com exists
  const existingOldAdmin = await prisma.user.findUnique({
    where: { email: oldEmail }
  });

  if (existingOldAdmin) {
    // Update it to admin@admin.in
    await prisma.user.update({
      where: { email: oldEmail },
      data: {
        email: newEmail,
        passwordHash: adminHash,
        loginAttempts: 0,
        lockUntil: null
      }
    });
    console.log(`Successfully updated existing admin email from ${oldEmail} to ${newEmail}`);
  } else {
    // Make sure admin@admin.in exists
    await prisma.user.upsert({
      where: { email: newEmail },
      update: {
        passwordHash: adminHash,
        role: 'ADMIN',
        status: 'ACTIVE',
        loginAttempts: 0,
        lockUntil: null
      },
      create: {
        email: newEmail,
        passwordHash: adminHash,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        status: 'ACTIVE',
        loginAttempts: 0,
        lockUntil: null
      }
    });
    console.log(`Ensured admin user exists with email: ${newEmail}`);
  }

  // Double check: delete any leftover admin@onlineexam.com just in case
  await prisma.user.deleteMany({
    where: {
      email: oldEmail
    }
  });

  console.log('Done!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
