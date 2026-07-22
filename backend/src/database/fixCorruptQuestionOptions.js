"use strict";
const { prisma } = require("./db");
const { logger } = require("../config/logger");

const SUBJECT_KEYWORDS = [
    "physics", "mathematics", "chemistry", "general knowledge / science",
    "general cs", "general", "subject", "department",
    "option a", "option b", "option c", "option d"
];

const FIXES_MAP = {
    "which instrument measures electric current": {
        options: ["Ammeter", "Voltmeter", "Galvanometer", "Barometer"],
        answers: ["Ammeter"]
    },
    "the value of tan30": {
        options: ["1/3", "1/√3", "√3", "0"],
        answers: ["1/√3"]
    },
    "sin245": {
        options: ["-1", "0", "1", "√2"],
        answers: ["0"]
    },
    "which of the following is a noble gas": {
        options: ["Nitrogen", "Helium", "Argon", "Oxygen"],
        answers: ["Helium"]
    },
    "the value of acceleration due to gravity on earth": {
        options: ["9.8", "8.9", "10.8", "9.0"],
        answers: ["9.8"]
    },
    "where g is the centroid": {
        options: ["46", "50", "36", "64"],
        answers: ["50"]
    }
};

const fixCorruptQuestionOptions = async () => {
    try {
        // 1. Delete any orphan questions where content is just a number (e.g. "1", "2", "3")
        try {
            await prisma.question.deleteMany({
                where: {
                    OR: [
                        { content: { in: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"] } },
                        { content: "" }
                    ]
                }
            });
        } catch (_) {}

        // 2. Fix corrupt options
        const questions = await prisma.question.findMany();
        let fixedCount = 0;

        for (const q of questions) {
            if (!Array.isArray(q.options) || q.options.length === 0) continue;

            const cleanContent = (q.content || "").toLowerCase().replace(/[^a-z0-9]/g, '');

            const hasCorruptOption = q.options.some(opt => {
                if (typeof opt !== "string") return true;
                const cleanOpt = opt.toLowerCase().trim();
                return SUBJECT_KEYWORDS.includes(cleanOpt) || cleanOpt.startsWith("option ");
            });

            if (hasCorruptOption) {
                let newOptions = [...q.options];
                let newAnswers = q.answers;

                const matchedKey = Object.keys(FIXES_MAP).find(k => {
                    const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return cleanContent.includes(cleanK);
                });

                if (matchedKey) {
                    newOptions = FIXES_MAP[matchedKey].options;
                    newAnswers = FIXES_MAP[matchedKey].answers;
                } else {
                    const validOptions = q.options.filter(opt => {
                        if (typeof opt !== "string") return false;
                        const cleanOpt = opt.toLowerCase().trim();
                        return !SUBJECT_KEYWORDS.includes(cleanOpt) && !cleanOpt.startsWith("option ");
                    });

                    let choiceIdx = 1;
                    while (validOptions.length < 4) {
                        validOptions.push(`Choice ${choiceIdx++}`);
                    }
                    newOptions = validOptions.slice(0, 4);
                }

                await prisma.question.update({
                    where: { id: q.id },
                    data: {
                        options: newOptions,
                        answers: newAnswers
                    }
                });

                fixedCount++;
            }
        }

        if (fixedCount > 0) {
            logger.info(`Database Cleaner: Fixed corrupt options for ${fixedCount} questions.`);
        }

        // 3. Smart Subject Re-Classifier: Ensure all questions are accurately linked to Physics, Chemistry, or Mathematics
        const allSubjs = await prisma.subject.findMany();
        const mathSubj = allSubjs.find(s => s.code.toUpperCase() === 'MATH' || s.name.toLowerCase().includes('math'));
        const physSubj = allSubjs.find(s => s.code.toUpperCase() === 'PHYS' || s.name.toLowerCase().includes('phys'));
        const chemSubj = allSubjs.find(s => s.code.toUpperCase() === 'CHEM' || s.name.toLowerCase().includes('chem'));

        const allDbQuestions = await prisma.question.findMany({ include: { subject: true } });
        let reclassifiedCount = 0;

        for (const q of allDbQuestions) {
            const c = (q.content || "").toLowerCase();
            let targetSubjId = null;

            // Check Physics regex
            if (/\b(unit|resistance|charge|particle|frequency|sound|wavelength|lens|myopia|magnetic|conductor|scalar|vector|velocity|gravity|capacitance|electric|current|force|energy|power|work|momentum|light|optics|voltage|circuit|ohm|ampere|volt|joule|watt|hertz|farad|pascal|newton|friction|thermodynamics|pressure|photon)\b/i.test(c)) {
                targetSubjId = physSubj?.id;
            }
            // Check Chemistry regex
            else if (/\b(atomic|carbon|element|noble gas|periodic|acid|base|ph|reaction|compound|molecule|bond|electron|proton|neutron|valency|isotope|solution|molarity|oxidation|catalyst|polymer|organic|inorganic|alkane|alkene|alkyne|alcohol|hydrocarbon|sodium|potassium|calcium|iron|copper|hydrogen|oxygen|nitrogen|helium|argon|chlorine|fluorine)\b/i.test(c)) {
                targetSubjId = chemSubj?.id;
            }
            // Check Mathematics regex
            else if (/\b(minimum value|maximum value|sin|cos|tan|cot|sec|cosec|equation|derivative|integral|determinant|matrix|log|log10|logarithm|solution|centroid|triangle|subset|subsets|set|elements|distance between|slope|line|probability|permutation|combination|algebra|calculus|trigonometry|radius|area|volume|polynomial|roots|quadratics|dx)\b/i.test(c)) {
                targetSubjId = mathSubj?.id;
            }

            if (targetSubjId && q.subjectId !== targetSubjId) {
                await prisma.question.update({
                    where: { id: q.id },
                    data: { subjectId: targetSubjId }
                });
                reclassifiedCount++;
            }
        }

        if (reclassifiedCount > 0) {
            logger.info(`Database Cleaner: Re-classified ${reclassifiedCount} questions into Physics, Chemistry, and Mathematics.`);
        }
    } catch (err) {
        logger.error(`Database Cleaner error: ${err.message}`);
    }
};

module.exports = { fixCorruptQuestionOptions };
