const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Find most recent submission
  const sub = await p.submission.findFirst({
    orderBy: { createdAt: 'desc' },
    include: {
      answers: {
        take: 6,
        include: { question: { select: { type: true, content: true, answers: true } } }
      }
    }
  });
  
  if (!sub) { console.log('No submissions found'); return; }
  
  console.log('Submission ID:', sub.id);
  console.log('TotalScore:', sub.totalScore, '| Status:', sub.status);
  console.log('=====');
  
  sub.answers.forEach((a, i) => {
    console.log(`[${i+1}] Type: ${a.question.type}`);
    console.log('     Question:', a.question.content.substring(0, 60));
    console.log('     DB correct answers:', JSON.stringify(a.question.answers));
    console.log('     Student answer:', JSON.stringify(a.studentAnswer));
    console.log('     isCorrect:', a.isCorrect, '| scoreAwarded:', a.scoreAwarded);
    console.log('---');
  });
  
  await p.$disconnect();
}
main().catch(console.error);
