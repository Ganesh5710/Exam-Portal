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

        // 3. Link unlinked questions (subjectId = null) to appropriate Subject
        const unlinkedQuestions = await prisma.question.findMany({ where: { subjectId: null } });
        if (unlinkedQuestions.length > 0) {
            const allSubjs = await prisma.subject.findMany();
            const mathSubj = allSubjs.find(s => s.code.toUpperCase() === 'MATH' || s.name.toLowerCase().includes('math'));
            const physSubj = allSubjs.find(s => s.code.toUpperCase() === 'PHYS' || s.name.toLowerCase().includes('phys'));
            const chemSubj = allSubjs.find(s => s.code.toUpperCase() === 'CHEM' || s.name.toLowerCase().includes('chem'));

            let linkedCount = 0;
            for (const q of unlinkedQuestions) {
                const c = (q.content || "").toLowerCase();
                let targetSubjId = null;

                if (c.includes("sin") || c.includes("cos") || c.includes("tan") || c.includes("log") || c.includes("derivative") || c.includes("determinant") || c.includes("integral") || c.includes("centroid") || c.includes("matrix") || c.includes("function") || c.includes("equation") || c.includes("subset")) {
                    targetSubjId = mathSubj?.id;
                } else if (c.includes("gravity") || c.includes("velocity") || c.includes("acceleration") || c.includes("current") || c.includes("force") || c.includes("mass") || c.includes("energy") || c.includes("wave")) {
                    targetSubjId = physSubj?.id;
                } else if (c.includes("noble gas") || c.includes("atom") || c.includes("element") || c.includes("compound") || c.includes("acid") || c.includes("base") || c.includes("reaction") || c.includes("ph")) {
                    targetSubjId = chemSubj?.id;
                } else {
                    targetSubjId = mathSubj?.id || allSubjs[0]?.id;
                }

                if (targetSubjId) {
                    await prisma.question.update({
                        where: { id: q.id },
                        data: { subjectId: targetSubjId }
                    });
                    linkedCount++;
                }
            }
            if (linkedCount > 0) {
                logger.info(`Database Cleaner: Auto-linked ${linkedCount} unlinked questions to Subjects.`);
            }
        }
    } catch (err) {
        logger.error(`Database Cleaner error: ${err.message}`);
    }
};

module.exports = { fixCorruptQuestionOptions };
