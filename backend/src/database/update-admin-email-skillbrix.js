const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database to update Admin email to Skillbrix...');

  const oldEmail1 = 'admin@onlineexam.com';
  const oldEmail2 = 'admin@admin.in';
  const newEmail = 'Skillbrix@admin.in';
  const adminHash = await bcrypt.hash('Admin@123', 10);

  // Check if any old admin exists
  const existingOldAdmin = await prisma.user.findFirst({
    where: {
      email: { in: [oldEmail1, oldEmail2] }
    }
  });

  if (existingOldAdmin) {
    // Update it to Skillbrix@admin.in
    await prisma.user.update({
      where: { id: existingOldAdmin.id },
      data: {
        email: newEmail,
        passwordHash: adminHash,
        loginAttempts: 0,
        lockUntil: null
      }
    });
    console.log(`Successfully updated existing admin email to ${newEmail}`);
  } else {
    // Make sure Skillbrix@admin.in exists
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

  // Delete any leftover old admins
  await prisma.user.deleteMany({
    where: {
      email: { in: [oldEmail1, oldEmail2] }
    }
  });

  console.log('Done!');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
