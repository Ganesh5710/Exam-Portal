"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callGeminiWithFallback = callGeminiWithFallback;
const logger_1 = require("./logger");
// All available Gemini model candidates, ordered by priority
const GEMINI_MODELS = [
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-2.5-pro',
    'gemini-3.5-flash',
];
const MAX_RETRIES_PER_MODEL = 2;
const BASE_RETRY_DELAY_MS = 3000; // 3 seconds
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Call Gemini API with automatic model fallback and exponential backoff retry.
 * Tries each model up to MAX_RETRIES_PER_MODEL times for 429/503 errors.
 * Returns the successful response text.
 */
async function callGeminiWithFallback(apiKey, options) {
    const { prompt, mediaData, jsonMode = true } = options;
    // Build content parts
    const contentsParts = [{ text: prompt }];
    if (mediaData) {
        contentsParts.push({
            inlineData: {
                mimeType: mediaData.mimeType,
                data: mediaData.data
            }
        });
    }
    const requestBody = {
        contents: [{ parts: contentsParts }],
    };
    if (jsonMode) {
        requestBody.generationConfig = { responseMimeType: 'application/json' };
    }
    const bodyStr = JSON.stringify(requestBody);
    let lastError = '';
    for (const model of GEMINI_MODELS) {
        for (let attempt = 0; attempt < MAX_RETRIES_PER_MODEL; attempt++) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
                logger_1.logger.info(`Gemini: Trying ${model} (attempt ${attempt + 1}/${MAX_RETRIES_PER_MODEL})...`);
                const res = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: bodyStr,
                    signal: AbortSignal.timeout(120000), // 2 minute timeout
                });
                if (res.ok) {
                    const json = (await res.json());
                    const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (!text) {
                        lastError = `Model ${model}: returned empty content`;
                        logger_1.logger.warn(lastError);
                        break; // Try next model
                    }
                    logger_1.logger.info(`Gemini: Success with ${model}!`);
                    return { text: text.trim(), model };
                }
                const status = res.status;
                const errBody = await res.text();
                // Rate limit or overloaded - retry with backoff
                if (status === 429 || status === 503) {
                    const delayMs = BASE_RETRY_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000;
                    lastError = `Model ${model}: HTTP ${status} (retrying in ${Math.round(delayMs / 1000)}s)`;
                    logger_1.logger.warn(lastError);
                    if (attempt < MAX_RETRIES_PER_MODEL - 1) {
                        await sleep(delayMs);
                        continue; // Retry same model
                    }
                    break; // Move to next model
                }
                // 400 = bad request, 404 = model not found, 403 = forbidden
                // These won't improve with retries, move to next model immediately
                if (status === 400 || status === 403 || status === 404) {
                    lastError = `Model ${model}: HTTP ${status}`;
                    logger_1.logger.warn(`${lastError}: ${errBody.substring(0, 200)}`);
                    break; // Try next model
                }
                // Other errors
                lastError = `Model ${model}: HTTP ${status}`;
                logger_1.logger.warn(`${lastError}: ${errBody.substring(0, 200)}`);
                break;
            }
            catch (err) {
                lastError = `Model ${model}: ${err.message}`;
                logger_1.logger.warn(lastError);
                break; // Network error, try next model
            }
        }
    }
    // All models exhausted
    throw new Error(`AI generation failed after trying all available models. ` +
        `This usually means your Gemini API key's daily quota is exhausted. ` +
        `Please wait a few minutes and try again, or upgrade your API key at https://ai.google.dev. ` +
        `Last error: ${lastError}`);
}
