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
  console.log(JSON.stringify(subs, null, 2));
  await p.$disconnect();
}
main().catch(console.error);
