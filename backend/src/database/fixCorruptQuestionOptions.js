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
        const questions = await prisma.question.findMany();
        let fixedCount = 0;

        for (const q of questions) {
            if (!Array.isArray(q.options) || q.options.length === 0) continue;

            const cleanContent = (q.content || "").toLowerCase().replace(/[^a-z0-9]/g, '');

            // Check if any option is a subject keyword or generic placeholder "Option A/B/C/D"
            const hasCorruptOption = q.options.some(opt => {
                if (typeof opt !== "string") return true;
                const cleanOpt = opt.toLowerCase().trim();
                return SUBJECT_KEYWORDS.includes(cleanOpt) || cleanOpt.startsWith("option ");
            });

            if (hasCorruptOption) {
                let newOptions = [...q.options];
                let newAnswers = q.answers;

                // Check specific lookup map
                const matchedKey = Object.keys(FIXES_MAP).find(k => {
                    const cleanK = k.toLowerCase().replace(/[^a-z0-9]/g, '');
                    return cleanContent.includes(cleanK);
                });

                if (matchedKey) {
                    newOptions = FIXES_MAP[matchedKey].options;
                    newAnswers = FIXES_MAP[matchedKey].answers;
                } else {
                    // Filter out subject keywords and fill with fallback choices
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
    } catch (err) {
        logger.error(`Database Cleaner error: ${err.message}`);
    }
};

module.exports = { fixCorruptQuestionOptions };
