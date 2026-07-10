const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const subs = await p.submission.findMany({
    include: {
      student: true,
      exam: {
        include: {
          examQuestions: {
            include: { question: true }
          }
        }
      }
    }
  });
  
  subs.forEach(s => {
    const qScores = s.exam.examQuestions.map(eq => eq.question.score);
    const maxScore = qScores.reduce((a, b) => a + b, 0);
    console.log({
      id: s.id,
      student: `${s.student.firstName} ${s.student.lastName}`,
      examTitle: s.exam.title,
      totalScore: s.totalScore,
      percentage: s.percentage,
      grade: s.grade,
      isPassed: s.isPassed,
      passingMarks: s.exam.passingMarks,
      examQuestionsCount: s.exam.examQuestions.length,
      derivedMaxPossibleScore: maxScore
    });
  });
  
  await p.$disconnect();
}
main().catch(console.error);
