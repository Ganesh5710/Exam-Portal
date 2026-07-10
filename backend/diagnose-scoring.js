const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const subs = await p.submission.findMany({
    orderBy: { createdAt: 'desc' }, take: 5,
    include: { student: { select: { firstName: true, lastName: true } }, exam: { select: { title: true } } }
  });
  
  console.log('=== Recent Submissions ===');
  subs.forEach(s => {
    console.log(`[${s.id.substring(0,8)}] ${s.student.firstName} ${s.student.lastName} | Score: ${s.totalScore} | Status: ${s.status}`);
  });
  
  if (!subs[0]) { await p.$disconnect(); return; }
  const latest = subs[0];
  
  const answers = await p.answer.findMany({
    where: { submissionId: latest.id },
    include: { question: { select: { type: true, content: true, answers: true, score: true } } }
  });
  
  const mcq = answers.filter(a => a.question.type === 'MCQ');
  console.log(`\nLatest: ${latest.student.firstName} - Total answers: ${answers.length}, MCQ: ${mcq.length}`);
  
  let wouldScore = 0;
  mcq.slice(0, 15).forEach((a, i) => {
    const correctArr = Array.isArray(a.question.answers) ? a.question.answers : [a.question.answers];
    const student = a.studentAnswer || {};
    const selectedOption = student.selectedOption || '';
    
    // NEW correct logic: case-insensitive text match
    const isCorrect = correctArr.some(c => String(c).trim().toLowerCase() === String(selectedOption).trim().toLowerCase());
    if (isCorrect) wouldScore += a.question.score;
    
    console.log(`\nQ${i+1}: ${a.question.content.substring(0, 55)}`);
    console.log(`  DB answer: ${JSON.stringify(correctArr[0])} | Student: "${selectedOption}" | NEW isCorrect: ${isCorrect}`);
    console.log(`  OLD saved isCorrect: ${a.isCorrect} | scoreAwarded: ${a.scoreAwarded}`);
  });
  
  console.log(`\n=== If re-graded with new logic, MCQ score would be: ${wouldScore} ===`);
  await p.$disconnect();
}
main().catch(console.error);
