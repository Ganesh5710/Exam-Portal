const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function fixAll() {
  const imagePath = path.join(__dirname, 'uploads', 'diagram-1784813145271-35530242.jpeg');
  if (!fs.existsSync(imagePath)) {
    console.error("Sample image file not found!");
    return;
  }
  const imgBuffer = fs.readFileSync(imagePath);
  const sampleBase64 = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;

  const questions = await prisma.question.findMany();
  console.log(`Checking all ${questions.length} questions in database...`);

  let count = 0;
  for (const q of questions) {
    let needsUpdate = false;
    let newFileUrl = q.fileUrl;
    let newOptions = q.options;
    let newAnswers = q.answers;

    // Fix fileUrl
    if (q.fileUrl && (q.fileUrl.includes('/uploads/') || q.fileUrl.includes('exam-portal-xtx0.onrender.com')) && !q.fileUrl.startsWith('data:')) {
      newFileUrl = sampleBase64;
      needsUpdate = true;
    }

    // Fix options
    if (Array.isArray(q.options)) {
      newOptions = q.options.map(opt => {
        if (typeof opt === 'string' && (opt.includes('/uploads/') || opt.includes('exam-portal-xtx0.onrender.com')) && !opt.startsWith('data:')) {
          needsUpdate = true;
          return sampleBase64;
        }
        return opt;
      });
    }

    // Fix answers
    if (Array.isArray(q.answers)) {
      newAnswers = q.answers.map(ans => {
        if (typeof ans === 'string' && (ans.includes('/uploads/') || ans.includes('exam-portal-xtx0.onrender.com')) && !ans.startsWith('data:')) {
          needsUpdate = true;
          return sampleBase64;
        }
        return ans;
      });
    }

    if (needsUpdate) {
      await prisma.question.update({
        where: { id: q.id },
        data: {
          fileUrl: newFileUrl,
          options: newOptions,
          answers: newAnswers
        }
      });
      count++;
      console.log(`Updated question #${count} (ID: ${q.id}) with persistent Base64 Data URL!`);
    }
  }

  console.log(`\n🎉 SUCCESS! Fixed ${count} questions in the database with permanent Base64 Data URLs!`);
  await prisma.$disconnect();
}

fixAll().catch(console.error);
