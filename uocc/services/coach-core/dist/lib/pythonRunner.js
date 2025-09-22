"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPythonTests = runPythonTests;
const child_process_1 = require("child_process");
const fsp = __importStar(require("fs/promises"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
async function runPythonTests(source, tests, timeoutSec = 2) {
    if (typeof source !== 'string' || source.length === 0) {
        throw new Error('source required');
    }
    if (source.length > 200000) {
        throw new Error('source too large');
    }
    if (!Array.isArray(tests) || tests.length === 0) {
        throw new Error('tests required');
    }
    if (tests.length > 50) {
        throw new Error('too many tests');
    }
    const tmpBase = await fsp.mkdtemp(path.join(os.tmpdir(), 'uocc-'));
    const userPath = path.join(tmpBase, 'user_code.py');
    const harnessPath = path.join(tmpBase, 'harness.py');
    try {
        await fsp.writeFile(userPath, source, 'utf8');
        const harness = buildHarnessPy(tests);
        await fsp.writeFile(harnessPath, harness, 'utf8');
        const perTestMs = Math.max(100, Math.floor(timeoutSec * 1000));
        const overallMs = Math.min(120000, perTestMs * tests.length + 500);
        const { stdout, stderr, code } = await runPython(harnessPath, overallMs, tmpBase);
        if (code !== 0) {
            return oneFailureFromError(tests, stderr || `exit ${code}`);
        }
        try {
            const parsed = JSON.parse(stdout.trim());
            return parsed;
        }
        catch (_) {
            return oneFailureFromError(tests, stderr || 'parse');
        }
    }
    finally {
        // Cleanup temp dir
        try {
            await fsp.rm(tmpBase, { recursive: true, force: true });
        }
        catch { }
    }
}
function oneFailureFromError(tests, error) {
    return {
        passCount: 0,
        failCount: tests.length,
        failures: tests.map((t, i) => ({ index: i, input: t?.in ?? [], expected: t?.out, error }))
    };
}
function buildHarnessPy(tests) {
    const testsJson = JSON.stringify(tests);
    return `import json, sys, traceback\nimport user_code\n\nresults = { 'passCount': 0, 'failCount': 0, 'failures': [] }\n\nif not hasattr(user_code, 'solve'):\n    tests = json.loads('''${testsJson.replace(/'/g, "\\'")}''')\n    for i, t in enumerate(tests):\n        results['failures'].append({ 'index': i, 'input': t.get('in', []), 'expected': t.get('out'), 'error': 'solve not defined' })\n    results['failCount'] = len(results['failures'])\n    print(json.dumps(results))\n    sys.exit(0)\n\nsolve = getattr(user_code, 'solve')\n\ndef run():\n    tests = json.loads('''${testsJson.replace(/'/g, "\\'")}''')\n    for i, t in enumerate(tests):\n        try:\n            got = solve(*t.get('in', []))\n            exp = t.get('out')\n            if got == exp:\n                results['passCount'] += 1\n            else:\n                results['failCount'] += 1\n                results['failures'].append({ 'index': i, 'input': t.get('in', []), 'expected': exp, 'got': got })\n        except Exception as e:\n            results['failCount'] += 1\n            results['failures'].append({ 'index': i, 'input': t.get('in', []), 'expected': t.get('out'), 'error': ''.join(traceback.format_exception_only(type(e), e)).strip() })\n    print(json.dumps(results))\n\nif __name__ == '__main__':\n    run()\n`;
}
function runPython(harnessPath, timeoutMs, cwd) {
    return new Promise((resolve) => {
        let triedFallback = false;
        const run = (useIsolated) => {
            const args = useIsolated ? ['-I', harnessPath] : [harnessPath];
            const proc = (0, child_process_1.spawn)('python3', args, { cwd, env: {}, stdio: ['ignore', 'pipe', 'pipe'] });
            let stdout = '';
            let stderr = '';
            const timer = setTimeout(() => {
                proc.kill('SIGKILL');
                resolve({ stdout: '', stderr: 'timeout', code: 1 });
            }, timeoutMs);
            proc.stdout.on('data', (d) => (stdout += d.toString()));
            proc.stderr.on('data', (d) => (stderr += d.toString()));
            proc.on('exit', (code) => {
                clearTimeout(timer);
                if (useIsolated && code === 2 && /unknown option -I/i.test(stderr) && !triedFallback) {
                    triedFallback = true;
                    return run(false);
                }
                resolve({ stdout, stderr, code });
            });
        };
        run(true);
    });
}
