const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Connecting to database...');
  const settings = await prisma.systemSettings.findMany();
  console.log('Current settings in DB:', settings);

  if (settings.length === 0) {
    console.log('No settings found. Seeding defaults...');
    const defaults = [
      { key: 'INSTITUTION_NAME', value: 'SecureExam Tech University', description: 'Institution title branding' },
      { key: 'INSTITUTION_LOGO', value: '', description: 'Branding logo asset path' },
      { key: 'THEME', value: 'dark', description: 'Portal base theme' },
      { key: 'SMTP_HOST', value: 'smtp.mailtrap.io', description: 'Email server address' },
      { key: 'SMTP_PORT', value: '2525', description: 'Email server port' },
      { key: 'EXAM_PASS_PERCENT', value: '40', description: 'Global default passing threshold percentage' },
      { key: 'SESSION_TIMEOUT', value: '60', description: 'Session timeout in minutes' },
      { key: 'MAINTENANCE_MODE', value: 'false', description: 'Block student access if true' }
    ];
    for (const item of defaults) {
      await prisma.systemSettings.create({ data: item });
    }
    console.log('Seeded defaults successfully!');
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
