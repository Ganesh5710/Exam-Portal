"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeCode = void 0;
const child_process_1 = require("child_process");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = require("../../config/logger");
const executeCode = async (language, code, testCases, timeLimitMs = 2000, auxiliaryFiles = []) => {
    const sessionHash = Math.random().toString(36).substring(2, 9);
    const tempDir = path_1.default.join(__dirname, '../../../temp_exec');
    const sessionDir = path_1.default.join(tempDir, sessionHash);
    // Create isolated session directory
    if (!fs_1.default.existsSync(sessionDir)) {
        fs_1.default.mkdirSync(sessionDir, { recursive: true });
    }
    const isWin = process.platform === 'win32';
    let fileName = '';
    let compileCmd = '';
    let runCmd = [];
    // Setup compilers and runners depending on language selection
    switch (language) {
        case 'javascript':
            fileName = 'index.js';
            runCmd = ['node', path_1.default.join(sessionDir, fileName)];
            break;
        case 'python':
            fileName = 'index.py';
            runCmd = ['python', path_1.default.join(sessionDir, fileName)];
            break;
        case 'c':
            fileName = 'main.c';
            const binaryC = path_1.default.join(sessionDir, isWin ? 'main.exe' : 'main.out');
            compileCmd = `gcc "${path_1.default.join(sessionDir, fileName)}" -o "${binaryC}"`;
            runCmd = [binaryC];
            break;
        case 'cpp':
            fileName = 'main.cpp';
            const binaryCpp = path_1.default.join(sessionDir, isWin ? 'main.exe' : 'main.out');
            compileCmd = `g++ "${path_1.default.join(sessionDir, fileName)}" -o "${binaryCpp}"`;
            runCmd = [binaryCpp];
            break;
        case 'java':
            fileName = 'Main.java';
            // Normalize class name to Main in its isolated directory
            const adjustedCode = code.replace(/public\s+class\s+\w+/, 'public class Main');
            fs_1.default.writeFileSync(path_1.default.join(sessionDir, fileName), adjustedCode, 'utf8');
            compileCmd = `javac "${path_1.default.join(sessionDir, fileName)}"`;
            runCmd = ['java', '-cp', sessionDir, 'Main'];
            break;
    }
    // Save source file for languages other than Java (already handled)
    if (language !== 'java') {
        fs_1.default.writeFileSync(path_1.default.join(sessionDir, fileName), code, 'utf8');
    }
    // Write auxiliary files (if any)
    if (Array.isArray(auxiliaryFiles)) {
        for (const aux of auxiliaryFiles) {
            if (aux && aux.name && aux.content) {
                fs_1.default.writeFileSync(path_1.default.join(sessionDir, aux.name), aux.content, 'utf8');
            }
        }
    }
    // 1. Run Compilation if needed
    if (compileCmd) {
        try {
            await new Promise((resolve, reject) => {
                (0, child_process_1.exec)(compileCmd, { cwd: sessionDir }, (err, stdout, stderr) => {
                    if (err) {
                        reject(new Error(stderr || stdout || err.message));
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        catch (e) {
            cleanupFiles(sessionDir);
            return {
                success: false,
                status: 'COMPILATION_ERROR',
                logs: e.message,
                results: []
            };
        }
    }
    // 2. Run Test Cases
    const results = [];
    let isTimeout = false;
    let hasRuntimeErr = false;
    let logs = '';
    for (const tc of testCases) {
        const startTime = Date.now();
        try {
            const actualOutput = await new Promise((resolve, reject) => {
                const child = (0, child_process_1.spawn)(runCmd[0], runCmd.slice(1), { cwd: sessionDir });
                let output = '';
                let errOutput = '';
                // Write input stream to stdin
                if (tc.input) {
                    child.stdin.write(tc.input + '\n');
                }
                child.stdin.end();
                child.stdout.on('data', (data) => {
                    output += data.toString();
                });
                child.stderr.on('data', (data) => {
                    errOutput += data.toString();
                });
                // Strict timeout limit handler
                const timeoutTimer = setTimeout(() => {
                    isTimeout = true;
                    child.kill('SIGKILL');
                    reject(new Error('TIME_LIMIT_EXCEEDED'));
                }, timeLimitMs);
                child.on('close', (code) => {
                    clearTimeout(timeoutTimer);
                    if (code !== 0 && !isTimeout) {
                        reject(new Error(errOutput || `Exit code: ${code}`));
                    }
                    else {
                        resolve(output);
                    }
                });
            });
            const cleanActual = actualOutput.trim();
            const cleanExpected = tc.expectedOutput.trim();
            const passed = cleanActual === cleanExpected;
            results.push({
                passed,
                input: tc.input,
                expected: tc.expectedOutput,
                actual: cleanActual,
                timeTakenMs: Date.now() - startTime
            });
        }
        catch (e) {
            const errMsg = e.message;
            if (errMsg === 'TIME_LIMIT_EXCEEDED') {
                isTimeout = true;
            }
            else {
                hasRuntimeErr = true;
            }
            logs += `Test case failed: ${errMsg}\n`;
            results.push({
                passed: false,
                input: tc.input,
                expected: tc.expectedOutput,
                actual: '',
                error: errMsg,
                timeTakenMs: Date.now() - startTime
            });
        }
    }
    // Clean the entire isolated session workspace directory
    cleanupFiles(sessionDir);
    let status = 'SUCCESS';
    if (isTimeout)
        status = 'TIME_LIMIT_EXCEEDED';
    else if (hasRuntimeErr)
        status = 'RUNTIME_ERROR';
    return {
        success: status === 'SUCCESS' && results.every(r => r.passed),
        status,
        logs,
        results
    };
};
exports.executeCode = executeCode;
const cleanupFiles = (sessionDir) => {
    try {
        if (fs_1.default.existsSync(sessionDir)) {
            // Recursively delete the session directory
            fs_1.default.rmSync(sessionDir, { recursive: true, force: true });
        }
    }
    catch (err) {
        logger_1.logger.warn(`Could not clear isolated workspace temp files: ${err.message}`);
    }
};
