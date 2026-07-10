const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const examId = 'cff3a62f-68b9-40b3-9a74-2c92fcfafb3b';
  console.log('Querying database for exam:', examId);

  const exam = await prisma.exam.findUnique({
    where: { id: examId },
    include: {
      examQuestions: true
    }
  });

  if (!exam) {
    console.log('Exam not found.');
    return;
  }

  console.log('Exam Title:', exam.title);
  console.log('Current questions count:', exam.examQuestions.length);

  if (exam.examQuestions.length === 0) {
    console.log('No questions linked. Linking all available questions to this exam...');
    const questions = await prisma.question.findMany();
    console.log(`Found ${questions.length} questions in database.`);

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await prisma.examQuestion.create({
        data: {
          examId: exam.id,
          questionId: q.id,
          orderIndex: i
        }
      });
      console.log(`Linked Q: [${q.type}] ${q.content.substring(0, 50)}...`);
    }

    console.log('Finished linking questions.');
  } else {
    console.log('Exam already has questions linked.');
  }

  await prisma.$disconnect();
}

run().catch(console.error);
