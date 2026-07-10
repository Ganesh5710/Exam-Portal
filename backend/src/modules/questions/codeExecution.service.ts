import { exec, spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { logger } from '../../config/logger';

export interface TestCase {
  input: string;
  expectedOutput: string;
  isHidden: boolean;
}

export interface AuxiliaryFile {
  name: string;
  content: string;
}

export interface ExecutionResult {
  passed: boolean;
  input: string;
  expected: string;
  actual: string;
  error?: string;
  timeTakenMs: number;
}

export interface SandboxReport {
  success: boolean;
  status: 'COMPILATION_ERROR' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'SUCCESS';
  logs: string;
  results: ExecutionResult[];
}

export const executeCode = async (
  language: 'c' | 'cpp' | 'java' | 'python' | 'javascript',
  code: string,
  testCases: TestCase[],
  timeLimitMs: number = 2000,
  auxiliaryFiles: AuxiliaryFile[] = []
): Promise<SandboxReport> => {
  const sessionHash = Math.random().toString(36).substring(2, 9);
  const tempDir = path.join(__dirname, '../../../temp_exec');
  const sessionDir = path.join(tempDir, sessionHash);

  // Create isolated session directory
  if (!fs.existsSync(sessionDir)) {
    fs.mkdirSync(sessionDir, { recursive: true });
  }

  const isWin = process.platform === 'win32';
  let fileName = '';
  let compileCmd = '';
  let runCmd: string[] = [];

  // Setup compilers and runners depending on language selection
  switch (language) {
    case 'javascript':
      fileName = 'index.js';
      runCmd = ['node', path.join(sessionDir, fileName)];
      break;
    case 'python':
      fileName = 'index.py';
      runCmd = ['python', path.join(sessionDir, fileName)];
      break;
    case 'c':
      fileName = 'main.c';
      const binaryC = path.join(sessionDir, isWin ? 'main.exe' : 'main.out');
      compileCmd = `gcc "${path.join(sessionDir, fileName)}" -o "${binaryC}"`;
      runCmd = [binaryC];
      break;
    case 'cpp':
      fileName = 'main.cpp';
      const binaryCpp = path.join(sessionDir, isWin ? 'main.exe' : 'main.out');
      compileCmd = `g++ "${path.join(sessionDir, fileName)}" -o "${binaryCpp}"`;
      runCmd = [binaryCpp];
      break;
    case 'java':
      fileName = 'Main.java';
      // Normalize class name to Main in its isolated directory
      const adjustedCode = code.replace(/public\s+class\s+\w+/, 'public class Main');
      fs.writeFileSync(path.join(sessionDir, fileName), adjustedCode, 'utf8');
      compileCmd = `javac "${path.join(sessionDir, fileName)}"`;
      runCmd = ['java', '-cp', sessionDir, 'Main'];
      break;
  }

  // Save source file for languages other than Java (already handled)
  if (language !== 'java') {
    fs.writeFileSync(path.join(sessionDir, fileName), code, 'utf8');
  }

  // Write auxiliary files (if any)
  if (Array.isArray(auxiliaryFiles)) {
    for (const aux of auxiliaryFiles) {
      if (aux && aux.name && aux.content) {
        fs.writeFileSync(path.join(sessionDir, aux.name), aux.content, 'utf8');
      }
    }
  }

  // 1. Run Compilation if needed
  if (compileCmd) {
    try {
      await new Promise<void>((resolve, reject) => {
        exec(compileCmd, { cwd: sessionDir }, (err, stdout, stderr) => {
          if (err) {
            reject(new Error(stderr || stdout || err.message));
          } else {
            resolve();
          }
        });
      });
    } catch (e) {
      cleanupFiles(sessionDir);
      return {
        success: false,
        status: 'COMPILATION_ERROR',
        logs: (e as Error).message,
        results: []
      };
    }
  }

  // 2. Run Test Cases
  const results: ExecutionResult[] = [];
  let isTimeout = false;
  let hasRuntimeErr = false;
  let logs = '';

  for (const tc of testCases) {
    const startTime = Date.now();
    try {
      const actualOutput = await new Promise<string>((resolve, reject) => {
        const child = spawn(runCmd[0], runCmd.slice(1), { cwd: sessionDir });
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
          } else {
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
    } catch (e) {
      const errMsg = (e as Error).message;
      if (errMsg === 'TIME_LIMIT_EXCEEDED') {
        isTimeout = true;
      } else {
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

  let status: SandboxReport['status'] = 'SUCCESS';
  if (isTimeout) status = 'TIME_LIMIT_EXCEEDED';
  else if (hasRuntimeErr) status = 'RUNTIME_ERROR';

  return {
    success: status === 'SUCCESS' && results.every(r => r.passed),
    status,
    logs,
    results
  };
};

const cleanupFiles = (sessionDir: string) => {
  try {
    if (fs.existsSync(sessionDir)) {
      // Recursively delete the session directory
      fs.rmSync(sessionDir, { recursive: true, force: true });
    }
  } catch (err) {
    logger.warn(`Could not clear isolated workspace temp files: ${(err as Error).message}`);
  }
};
