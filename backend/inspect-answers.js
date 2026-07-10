const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const qs = await p.question.findMany({ where: { type: 'MCQ' }, take: 8, select: { content: true, options: true, answers: true } });
  qs.forEach(q => {
    console.log('Q:', q.content.substring(0, 70));
    console.log('options:', JSON.stringify(q.options));
    console.log('answers:', JSON.stringify(q.answers));
    console.log('typeof answers:', typeof q.answers);
    console.log('---');
  });
  await p.$disconnect();
}
main().catch(console.error);
