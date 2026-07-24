const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const questions = await prisma.question.findMany({
    where: { fileUrl: { not: null } },
    select: { id: true, content: true, fileUrl: true }
  });
  console.log(`Found ${questions.length} questions with fileUrl:`);
  questions.forEach(q => {
    console.log(`ID: ${q.id} | fileUrl length: ${q.fileUrl?.length} | Value prefix: ${q.fileUrl?.substring(0, 100)}`);
  });
  await prisma.$disconnect();
}

check().catch(console.error);
