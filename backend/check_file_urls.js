const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const qs = await prisma.question.findMany({
    where: { fileUrl: { not: null } }
  });
  console.log('Found:', qs.length, 'questions with fileUrl');
  qs.forEach(q => {
    console.log(q.id, ':', q.content.slice(0, 50), '->', q.fileUrl);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
