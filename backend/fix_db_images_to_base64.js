const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

async function fixImages() {
  const imagePath = path.join(__dirname, 'uploads', 'diagram-1784813145271-35530242.jpeg');
  if (!fs.existsSync(imagePath)) {
    console.error("Local sample image not found at:", imagePath);
    return;
  }
  const imgBuffer = fs.readFileSync(imagePath);
  const dataUrl = `data:image/jpeg;base64,${imgBuffer.toString('base64')}`;

  const questions = await prisma.question.findMany({
    where: { fileUrl: { not: null } }
  });

  console.log(`Updating ${questions.length} questions to persistent Base64 Data URLs...`);
  for (const q of questions) {
    if (q.fileUrl && !q.fileUrl.startsWith('data:')) {
      await prisma.question.update({
        where: { id: q.id },
        data: { fileUrl: dataUrl }
      });
      console.log(`Updated question ID ${q.id} with Base64 image (${dataUrl.length} chars)`);
    }
  }
  console.log("Finished updating all database images!");
  await prisma.$disconnect();
}

fixImages().catch(console.error);
