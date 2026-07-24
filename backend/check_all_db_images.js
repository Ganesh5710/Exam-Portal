const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const questions = await prisma.question.findMany({
    select: { id: true, content: true, fileUrl: true, options: true }
  });
  console.log(`=== Total Questions: ${questions.length} ===`);
  questions.forEach((q, idx) => {
    const hasDiagram = Boolean(q.fileUrl);
    const optionsStr = JSON.stringify(q.options);
    const hasOptImg = optionsStr.includes('http') || optionsStr.includes('/uploads/') || optionsStr.includes('data:');
    if (hasDiagram || hasOptImg) {
      console.log(`\nQuestion #${idx + 1} (ID: ${q.id})`);
      console.log(`Content: ${q.content.substring(0, 60)}...`);
      console.log(`fileUrl (${q.fileUrl?.length} chars): ${q.fileUrl?.substring(0, 80)}`);
      console.log(`options: ${optionsStr.substring(0, 100)}...`);
    }
  });
  await prisma.$disconnect();
}

check().catch(console.error);
