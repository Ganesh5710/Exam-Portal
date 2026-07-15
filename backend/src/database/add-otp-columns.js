const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database to run raw SQL schema migration...');
  
  // 1. Add "otp" column
  console.log('Adding "otp" column if not exists...');
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "otp" TEXT;'
  );
  
  // 2. Add "otpExpiresAt" column
  console.log('Adding "otpExpiresAt" column if not exists...');
  await prisma.$executeRawUnsafe(
    'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "otpExpiresAt" TIMESTAMP WITH TIME ZONE;'
  );

  console.log('Database columns updated successfully!');
}

main()
  .catch((e) => {
    console.error('Error running raw migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
