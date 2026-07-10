const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const exam = await p.exam.findUnique({
    where: { id: 'd832c060-8703-4825-896e-0ee8f34b077c' },
    include: {
      examQuestions: {
        include: { question: true }
      }
    }
  });
  
  exam.examQuestions.forEach(eq => {
    console.log(`Q-ID: ${eq.question.id.substring(0,8)} | Score: ${eq.question.score} | Content: ${eq.question.content.substring(0,40)}`);
  });
  
  await p.$disconnect();
}
main().catch(console.error);
