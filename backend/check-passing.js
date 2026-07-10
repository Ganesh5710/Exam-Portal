const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const exams = await p.exam.findMany({ select: { id: true, title: true, passingMarks: true, duration: true } });
  exams.forEach(e => console.log(`[${e.id.substring(0,8)}] ${e.title.substring(0,60)} | passingMarks: ${e.passingMarks}`));
  await p.$disconnect();
}
main().catch(console.error);
