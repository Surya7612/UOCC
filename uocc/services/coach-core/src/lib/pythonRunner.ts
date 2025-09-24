// import { mkdtempSync, writeFileSync } from "fs";
// import { tmpdir } from "os";
// import { join } from "path";
// import { spawn } from "child_process";

// export async function runPythonTests(source: string, tests: any[], timeoutSec = 2) {
//   if (!Array.isArray(tests) || tests.length === 0) throw new Error("tests required");
//   if (source.length > 200_000) throw new Error("source too large");
//   if (tests.length > 50) throw new Error("too many tests");

//   const dir = mkdtempSync(join(tmpdir(), "uocc-"));
//   const userPath = join(dir, "user_code.py");
//   const harnessPath = join(dir, "harness.py");

//   writeFileSync(userPath, source, "utf8");

//   const harness = `
// import json, traceback, importlib.util, sys
// from types import ModuleType

// def load_user_module(path):
//     spec = importlib.util.spec_from_file_location("user_code", path)
//     mod = importlib.util.module_from_spec(spec)  # type: ModuleType
//     spec.loader.exec_module(mod)  # type: ignore
//     return mod

// def main():
//     try:
//         u = load_user_module("${userPath.replace(/\\/g, "\\\\")}")
//     except Exception as e:
//         out = {"passCount":0,"failCount":1,"failures":[{"index":0,"error":"import error: "+str(e)}]}
//         print(json.dumps(out))
//         return
//     failures = []
//     passCount = 0
//     tests = ${JSON.stringify(tests)}
//     for i, t in enumerate(tests):
//         try:
//             args = t.get("in", [])
//             exp = t.get("out", None)
//             if not hasattr(u, "solve") or not callable(getattr(u, "solve")):
//                 raise Exception("solve() not found")
//             got = u.solve(*args) if isinstance(args, list) else u.solve(args)
//             ok = (got == exp)
//             if ok: passCount += 1
//             else: failures.append({"index": i, "input": args, "expected": exp, "got": got})
//         except Exception as e:
//             failures.append({"index": i, "input": t.get("in", []), "expected": t.get("out", None), "error": str(e)})
//     out = {"passCount": passCount, "failCount": len(failures), "failures": failures}
//     print(json.dumps(out))

// if __name__ == "__main__":
//     main()
// `;
//   writeFileSync(harnessPath, harness, "utf8");

//   const py = process.env.PYTHON || "python3";
//   const child = spawn(py, [harnessPath], {
//     cwd: dir, stdio: ["ignore", "pipe", "pipe"]
//   });

//   const maxMs = tests.length * timeoutSec * 1000 + 1000;
//   const stdout: Buffer[] = [];
//   const stderr: Buffer[] = [];
//   child.stdout.on("data", (d) => stdout.push(d));
//   child.stderr.on("data", (d) => stderr.push(d));

//   const result = await new Promise<{ code: number | null }>((resolve) => {
//     const t = setTimeout(() => { child.kill("SIGKILL"); resolve({ code: null }); }, maxMs);
//     child.on("exit", (code) => { clearTimeout(t); resolve({ code }); });
//   });

//   if (result.code === null) {
//     return { passCount: 0, failCount: tests.length, failures: [{ index: -1, error: "timeout" }] };
//   }

//   try {
//     const json = JSON.parse(Buffer.concat(stdout).toString("utf8") || "{}");
//     if (typeof json.passCount === "number" && Array.isArray(json.failures)) return json;
//   } catch (_) {}
//   return { passCount: 0, failCount: tests.length, failures: [{ index: -1, error: (Buffer.concat(stderr).toString("utf8") || "unknown") }] };
// }
import { mkdtempSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { spawn } from "child_process";

export async function runPythonTests(
  source: string,
  tests: any[],
  timeoutSec = 2
) {
  if (!Array.isArray(tests) || tests.length === 0) throw new Error("tests required");
  if (source.length > 200_000) throw new Error("source too large");
  if (tests.length > 50) throw new Error("too many tests");

  const dir = mkdtempSync(join(tmpdir(), "uocc-"));
  const userPath = join(dir, "user_code.py");
  const harnessPath = join(dir, "harness.py");

  writeFileSync(userPath, source, "utf8");

  // NOTE: we pass userPath & JSON tests via argv/stdin instead of string interpolation
  const harness = `
import json, traceback, importlib.util, sys, signal, types, time, os

def load_user_module(path: str):
    spec = importlib.util.spec_from_file_location("user_code", path)
    if spec is None or spec.loader is None:
        raise ImportError("cannot build module spec")
    mod = importlib.util.module_from_spec(spec)  # type: types.ModuleType
    spec.loader.exec_module(mod)  # type: ignore
    return mod

def run_with_timeout(fn, args, seconds):
    class Timeout(Exception): ...
    def _raise_timeout(signum, frame):
        raise Timeout()
    old = signal.signal(signal.SIGALRM, _raise_timeout)
    try:
        signal.alarm(max(1, int(seconds)))
        return fn(*args)
    finally:
        signal.alarm(0)
        signal.signal(signal.SIGALRM, old)

def main():
    # argv[1] = user code path
    if len(sys.argv) < 2:
        print(json.dumps({"passCount":0,"failCount":1,"failures":[{"index":0,"error":"no user code path"}]}), flush=True)
        return
    user_code_path = sys.argv[1]

    try:
        u = load_user_module(user_code_path)
    except Exception as e:
        out = {"passCount":0,"failCount":1,"failures":[{"index":0,"error":"import error: "+repr(e)}]}
        print(json.dumps(out, ensure_ascii=False), flush=True)
        return

    try:
        raw = sys.stdin.read()
        tests = json.loads(raw) if raw else []
    except Exception as e:
        out = {"passCount":0,"failCount":1,"failures":[{"index":0,"error":"tests parse error: "+repr(e)}]}
        print(json.dumps(out, ensure_ascii=False), flush=True)
        return

    failures = []
    passCount = 0

    has_solve = hasattr(u, "solve") and callable(getattr(u, "solve"))
    if not has_solve:
        out = {"passCount":0,"failCount":len(tests) or 1,
               "failures":[{"index":0,"error":"solve() not found"}]}
        print(json.dumps(out, ensure_ascii=False), flush=True)
        return

    for i, t in enumerate(tests):
        try:
            args = t.get("in", [])
            exp = t.get("out", None)
            if not isinstance(args, list):
                args = [args]
            got = run_with_timeout(u.solve, args, float(os.environ.get("UOCC_TEST_TIMEOUT","2")))
            ok = (got == exp)
            if ok:
                passCount += 1
            else:
                failures.append({"index": i, "input": args, "expected": exp, "got": got})
        except Exception as e:
            failures.append({"index": i, "input": t.get("in", []), "expected": t.get("out", None), "error": repr(e)})

    out = {"passCount": passCount, "failCount": len(failures), "failures": failures}
    print(json.dumps(out, ensure_ascii=False), flush=True)

if __name__ == "__main__":
    # make sure stdout is utf-8 and unbuffered
    try:
        sys.stdout.reconfigure(encoding="utf-8")  # type: ignore[attr-defined]
    except Exception:
        pass
    main()
`;

  writeFileSync(harnessPath, harness, "utf8");

  const py = process.env.PYTHON || "python3";
  // -I = isolated, -B = no .pyc, -u = unbuffered stdio
  const child = spawn(py, ["-I", "-B", "-u", harnessPath, userPath], {
    cwd: dir,
    stdio: ["pipe", "pipe", "pipe"],
    env: {
      ...process.env,
      UOCC_TEST_TIMEOUT: String(Math.max(1, Math.floor(timeoutSec))),
    },
  });

  const maxMs = tests.length * timeoutSec * 1000 + 1000;
  const stdout: Buffer[] = [];
  const stderr: Buffer[] = [];

  child.stdout.on("data", d => stdout.push(d));
  child.stderr.on("data", d => stderr.push(d));

  // send tests JSON via stdin (avoids giant command lines)
  try {
    child.stdin.write(JSON.stringify(tests));
  } catch {}
  try {
    child.stdin.end();
  } catch {}

  const result = await new Promise<{ code: number | null }>((resolve) => {
    const t = setTimeout(() => { try { child.kill("SIGKILL"); } catch {} resolve({ code: null }); }, maxMs);
    child.on("exit", (code) => { clearTimeout(t); resolve({ code }); });
    child.on("error", () => { clearTimeout(t); resolve({ code: null }); });
  });

  if (result.code === null) {
    return { passCount: 0, failCount: tests.length, failures: [{ index: -1, error: "timeout" }] };
  }

  try {
    const text = Buffer.concat(stdout).toString("utf8") || "{}";
    const json = JSON.parse(text);
    if (typeof json.passCount === "number" && Array.isArray(json.failures)) return json;
  } catch (_) {}

  return {
    passCount: 0,
    failCount: tests.length,
    failures: [{ index: -1, error: Buffer.concat(stderr).toString("utf8") || "unknown" }],
  };
}
