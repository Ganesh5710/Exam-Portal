const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function fixOptionImages() {
  const imagePath = path.join(__dirname, 'uploads', 'diagram-1784813145271-35530242.jpeg');
  if (!fs.existsSync(imagePath)) {
    console.error("Local sample image not found at:", imagePath);
    return;
  }
  const imgBuffer = fs.readFileSync(imagePath);
  const dataUrl = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;

  const allQuestions = await prisma.question.findMany();
  console.log(`Checking ${allQuestions.length} questions for broken option image URLs...`);

  let count = 0;
  for (const q of allQuestions) {
    if (!q.options || !Array.isArray(q.options)) continue;

    let updated = false;
    const newOptions = q.options.map(opt => {
      if (typeof opt === 'string' && (opt.includes('/uploads/diagram-') || opt.includes('exam-portal-xtx0.onrender.com'))) {
        updated = true;
        return dataUrl;
      }
      return opt;
    });

    let newAnswers = q.answers;
    if (Array.isArray(q.answers)) {
      newAnswers = q.answers.map(ans => {
        if (typeof ans === 'string' && (ans.includes('/uploads/diagram-') || ans.includes('exam-portal-xtx0.onrender.com'))) {
          updated = true;
          return dataUrl;
        }
        return ans;
      });
    }

    if (updated) {
      await prisma.question.update({
        where: { id: q.id },
        data: { options: newOptions, answers: newAnswers }
      });
      count++;
      console.log(`Updated question ID ${q.id} options/answers with Base64 Data URL!`);
    }
  }

  console.log(`Finished updating ${count} questions with persistent option Base64 image URLs!`);
  await prisma.$disconnect();
}

fixOptionImages().catch(console.error);
