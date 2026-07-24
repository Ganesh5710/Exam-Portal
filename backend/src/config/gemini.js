"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.callGeminiWithFallback = callGeminiWithFallback;
const logger_1 = require("./logger");
// All valid active Gemini model candidates, ordered by priority
const GEMINI_MODELS = [
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
];
const MAX_RETRIES_PER_MODEL = 3;
const BASE_RETRY_DELAY_MS = 4000; // 4 seconds
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
    const cleanKey = (apiKey || '').trim();
    // Build content parts
    const contentsParts = [{ text: prompt }];
    if (mediaData) {
        let cleanMime = mediaData.mimeType || 'image/jpeg';
        if (cleanMime === 'image/jpg') cleanMime = 'image/jpeg';
        contentsParts.push({
            inlineData: {
                mimeType: cleanMime,
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
    let hitQuota429 = false;
    let hit401Invalid = false;

    for (const model of GEMINI_MODELS) {
        for (let attempt = 0; attempt < MAX_RETRIES_PER_MODEL; attempt++) {
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${cleanKey}`;
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
                if (status === 401) {
                    hit401Invalid = true;
                    logger_1.logger.warn(`Model ${model}: HTTP 401 Invalid Key: ${errBody.substring(0, 200)}`);
                    break;
                }
                // Rate limit or overloaded - retry with backoff
                if (status === 429 || status === 503) {
                    hitQuota429 = true;
                    const delayMs = BASE_RETRY_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000;
                    lastError = `Gemini API Rate Limit / Quota Exceeded (HTTP 429). Model ${model} rate-limited.`;
                    logger_1.logger.warn(lastError);
                    if (attempt < MAX_RETRIES_PER_MODEL - 1) {
                        await sleep(delayMs);
                        continue; // Retry same model
                    }
                    break; // Move to next model
                }
                // 400 = bad request, 404 = model not found, 403 = forbidden
                if (status === 400 || status === 403 || status === 404) {
                    if (!hitQuota429) {
                        lastError = `Model ${model}: HTTP ${status}`;
                    }
                    logger_1.logger.warn(`Model ${model}: HTTP ${status}: ${errBody.substring(0, 200)}`);
                    break; // Try next model
                }
                // Other errors
                if (!hitQuota429) {
                    lastError = `Model ${model}: HTTP ${status}`;
                }
                logger_1.logger.warn(`Model ${model}: HTTP ${status}: ${errBody.substring(0, 200)}`);
                break;
            }
            catch (err) {
                if (!hitQuota429) {
                    lastError = `Model ${model}: ${err.message}`;
                }
                logger_1.logger.warn(`Model ${model} error: ${err.message}`);
                break; // Network error, try next model
            }
        }
    }

    if (hit401Invalid) {
        throw new Error(`Gemini API Key Invalid (HTTP 401): The API Key provided is invalid or incomplete. Please copy your entire API Key from https://aistudio.google.com/app/apikey (starts with AIzaSy... or AQ.Ab...) and paste it cleanly into the API Key box.`);
    }

    if (hitQuota429) {
        throw new Error(`Gemini API Quota Exceeded (HTTP 429): Your Gemini API key's rate limit or daily free quota has been exhausted. Please wait 1 minute or generate a fresh API key at https://aistudio.google.com/app/apikey and save it in Admin → Settings.`);
    }

    // All models exhausted
    throw new Error(`AI generation failed. Last error: ${lastError}`);
}
