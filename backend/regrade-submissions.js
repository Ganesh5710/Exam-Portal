const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// Normalize answer text for comparison
const norm = (v) => String(v ?? '').trim().toLowerCase();

// Extract correct answers as normalized string array
const getCorrectArray = (rawAnswers) => {
  if (Array.isArray(rawAnswers)) return rawAnswers.map(norm);
  if (typeof rawAnswers === 'string') return [norm(rawAnswers)];
  if (rawAnswers && typeof rawAnswers === 'object') {
    const v = rawAnswers.answer ?? rawAnswers.correct ?? rawAnswers.key ?? null;
    return v !== null ? [norm(v)] : [];
  }
  return [];
};

async function regradeSubmission(sub, exam) {
  const answers = await p.answer.findMany({
    where: { submissionId: sub.id },
    include: { question: { select: { type: true, answers: true, score: true, negativeMarks: true } } }
  });

  let totalScore = 0;
  let autoGradingComplete = true;

  for (const ans of answers) {
    const q = ans.question;
    const studentResponse = ans.studentAnswer || {};

    let isCorrect = false;
    let scoreAwarded = 0;

    if (!ans.studentAnswer) {
      // Unanswered
    } else if (q.type === 'MCQ') {
      const correctList = getCorrectArray(q.answers);
      const studentChoice = norm(studentResponse.selectedOption);
      isCorrect = correctList.length > 0 && correctList.includes(studentChoice);
      scoreAwarded = isCorrect ? q.score : (exam.allowNegativeMarking ? -q.negativeMarks : 0);

    } else if (q.type === 'TRUE_FALSE') {
      const correctList = getCorrectArray(q.answers);
      const studentVal = norm(studentResponse.value);
      isCorrect = correctList.includes(studentVal);
      scoreAwarded = isCorrect ? q.score : (exam.allowNegativeMarking ? -q.negativeMarks : 0);

    } else if (q.type === 'FILL_BLANK') {
      const correctList = getCorrectArray(q.answers);
      const studentVal = norm(studentResponse.value);
      isCorrect = correctList.includes(studentVal);
      scoreAwarded = isCorrect ? q.score : (exam.allowNegativeMarking ? -q.negativeMarks : 0);

    } else if (q.type === 'MULTI_CORRECT') {
      const correctSet = new Set(getCorrectArray(q.answers));
      const selectedOpts = Array.isArray(studentResponse.selectedOptions)
        ? studentResponse.selectedOptions.map(norm)
        : [];
      isCorrect = correctSet.size === selectedOpts.length && selectedOpts.every(o => correctSet.has(o));
      if (!isCorrect && correctSet.size > 0) {
        const correctCount = selectedOpts.filter(o => correctSet.has(o)).length;
        const wrongCount = selectedOpts.filter(o => !correctSet.has(o)).length;
        const fraction = Math.max(0, (correctCount - wrongCount)) / correctSet.size;
        scoreAwarded = parseFloat((fraction * q.score).toFixed(2));
      } else {
        scoreAwarded = isCorrect ? q.score : (exam.allowNegativeMarking ? -q.negativeMarks : 0);
      }

    } else if (q.type === 'DESCRIPTIVE') {
      autoGradingComplete = false;
      continue;

    } else if (q.type === 'CODING') {
      // Skip re-evaluation of coding — keep existing result
      totalScore += (ans.scoreAwarded || 0);
      continue;
    }

    await p.answer.update({
      where: { id: ans.id },
      data: { isCorrect, scoreAwarded }
    });
    totalScore += scoreAwarded;
  }

  // Get max possible score from exam questions
  const examQs = await p.examQuestion.findMany({
    where: { examId: sub.examId },
    include: { question: { select: { score: true } } }
  });
  const maxPossibleScore = examQs.reduce((acc, eq) => acc + eq.question.score, 0);
  const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
  const isPassed = totalScore >= exam.passingMarks;

  let grade = 'F';
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B';
  else if (percentage >= 60) grade = 'C';
  else if (percentage >= 40) grade = 'D';

  await p.submission.update({
    where: { id: sub.id },
    data: {
      totalScore,
      percentage: parseFloat(percentage.toFixed(2)),
      isPassed,
      grade,
      status: autoGradingComplete ? 'COMPLETED' : 'PENDING'
    }
  });

  return { totalScore, percentage: parseFloat(percentage.toFixed(2)), isPassed, grade };
}

async function main() {
  console.log('=== Re-grading all existing submissions ===\n');

  const submissions = await p.submission.findMany({
    include: {
      student: { select: { firstName: true, lastName: true } },
      exam: true
    }
  });

  console.log(`Found ${submissions.length} submission(s) to re-grade.\n`);

  for (const sub of submissions) {
    const before = { score: sub.totalScore, pct: sub.percentage, grade: sub.grade };
    const result = await regradeSubmission(sub, sub.exam);
    console.log(`✅ ${sub.student.firstName} ${sub.student.lastName}`);
    console.log(`   Exam: ${sub.exam.title.substring(0, 50)}`);
    console.log(`   Before: Score=${before.score}, Pct=${before.pct}%, Grade=${before.grade}`);
    console.log(`   After:  Score=${result.totalScore}, Pct=${result.percentage}%, Grade=${result.grade}, Pass=${result.isPassed}`);
    console.log('---');
  }

  console.log('\n✅ Re-grading complete!');
  await p.$disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
