const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const sub = await p.submission.findUnique({
    where: { id: '6edccbb5-04e9-4ed6-9b1c-8a8b470c4d99' },
    include: {
      answers: {
        include: { question: true }
      }
    }
  });
  console.log(`Submission ID: ${sub.id}`);
  console.log(`Total Score: ${sub.totalScore}`);
  console.log(`Percentage: ${sub.percentage}`);
  console.log(`Answers count: ${sub.answers.length}`);
  sub.answers.forEach(a => {
    console.log(`Ans-ID: ${a.id.substring(0,8)} | Q-ID: ${a.questionId.substring(0,8)} | Q-Score: ${a.question.score} | Awarded: ${a.scoreAwarded} | Correct: ${a.isCorrect}`);
  });
  await p.$disconnect();
}
main().catch(console.error);
