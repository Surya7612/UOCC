/* global acquireVsCodeApi */
(() => {
  const vscode = (typeof acquireVsCodeApi === 'function' ? acquireVsCodeApi() : undefined) as any;
  const codeEl = document.getElementById('code') as HTMLPreElement | null;
  const testsEl = document.getElementById('tests') as HTMLDivElement | null;
  const hint1 = document.getElementById('hint1') as HTMLDivElement | null;
  const hint2 = document.getElementById('hint2') as HTMLDivElement | null;
  const hint3 = document.getElementById('hint3') as HTMLDivElement | null;
  const meter = document.getElementById('meter') as HTMLDivElement | null;

  let source = '';
  let lang = 'plaintext';
  let filename = '';
  let lastFailures: any[] | undefined;
  let lastHints: any | undefined;
  let hintLevelShown = 0;
  let speaking = false;
  let voiceEnabled = true;
  let state: 'idle'|'recording'|'transcribing'|'thinking'|'speaking' = 'idle';

  vscode?.postMessage({ type: 'getInitial' });

  document.getElementById('analyzeBtn')?.addEventListener('click', async () => {
    const body = { source, lang: 'python', context: { platform: 'vscode', filename }, failures: lastFailures };
    const res = await fetch('http://localhost:3000/analyze', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const json = await res.json();
    lastHints = json;
    hintLevelShown = 1;
    renderHints();
  });

  document.getElementById('revealBtn')?.addEventListener('click', () => {
    if (!lastHints) return;
    if (hintLevelShown < 2) hintLevelShown = 2;
    else if (hintLevelShown < 3 && lastFailures && lastFailures.length > 0) hintLevelShown = 3;
    renderHints();
  });

  document.getElementById('evaluateBtn')?.addEventListener('click', async () => {
    const defaultTests = [{ in: [[2,7,11,15], 9], out: [0,1] }];
    const res = await fetch('http://localhost:3000/evaluate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source, lang: 'python', tests: defaultTests }) });
    const json = await res.json();
    lastFailures = json.failures;
    renderTests(json);
    if (json.failCount > 0) {
      // demo: point at first line
      vscode?.postMessage({ type: 'decorate', payload: { startLine: 0, endLine: 0, reason: 'Check logic around here (demo)' } });
    }
  });

  document.getElementById('speakBtn')?.addEventListener('click', async (e) => {
    e.preventDefault();
    if (speaking) { speaking = false; return; }
    const text = (hintLevelShown >= 2 && lastHints?.levels?.[1]?.text) || lastHints?.levels?.[0]?.text || 'Analyzing your code.';
    const res = await fetch('http://localhost:3000/speak', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: String(text).slice(0,200) }) });
    const json = await res.json();
    const audio = new Audio(json.audio);
    speaking = true;
    audio.onended = () => speaking = false;
    audio.play();
  });

  document.getElementById('voiceToggle')?.addEventListener('change', (e: any) => {
    voiceEnabled = !!e?.target?.checked;
  });
  document.getElementById('micBtn')?.addEventListener('click', async () => {
    await onMicClick();
  });

  window.addEventListener('message', (event) => {
    const msg = event.data;
    if (msg?.type === 'initial') {
      source = msg.payload?.source || '';
      lang = msg.payload?.lang || 'plaintext';
      filename = msg.payload?.filename || '';
      if (codeEl) codeEl.textContent = source;
    }
  });

  function renderHints() {
    if (!lastHints) return;
    if (hint1) hint1.textContent = lastHints.levels?.[0]?.text || '';
    if (hint2) hint2.textContent = hintLevelShown >= 2 ? (lastHints.levels?.[1]?.text || '') : '';
    if (hint3) hint3.textContent = hintLevelShown >= 3 ? (lastHints.levels?.[2]?.text || '') : '';
  }

  function renderTests(result: any) {
    if (!testsEl) return;
    testsEl.innerHTML = '';
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = '1fr 1fr 1fr 1fr';
    grid.style.gap = '6px';
    const header = ['#', 'Input', 'Expected', 'Got/Err'];
    header.forEach((h) => { const d = document.createElement('div'); d.style.fontWeight = '600'; d.textContent = h; grid.appendChild(d); });
    (result.failures || []).forEach((f: any) => {
      const cells = [String(f.index), JSON.stringify(f.input), JSON.stringify(f.expected), f.error ? String(f.error) : JSON.stringify(f.got)];
      cells.forEach((c) => { const d = document.createElement('div'); d.textContent = c; grid.appendChild(d); });
    });
    testsEl.appendChild(grid);
  }

  async function onMicClick() {
    await setState('recording');
    const dataUrl = await recordOnceMs(4000);
    await setState('transcribing');
    const { text } = await post('/stt', { audio: dataUrl, mime: 'audio/webm' });
    await setState('thinking');
    const chat = await post('/chat', buildChatPayload(text));
    renderChatReply(chat);
    if (voiceEnabled && chat.speak) {
      await setState('speaking');
      const { audio } = await post('/speak', { text: String(chat.speak).slice(0,200) });
      playAudio(audio);
    }
    await setState('idle');
  }

  function buildChatPayload(userMessage: string) {
    return { mode: 'coach', lang, source, context: { platform: 'vscode', filename }, run_summary: { failures: lastFailures }, userMessage };
  }

  async function setState(s: typeof state) { state = s; if (meter) meter.textContent = `State: ${state}`; }

  function playAudio(dataUrl: string) { const a = new Audio(dataUrl); a.play(); }

  async function post(path: string, body: any) {
    const res = await fetch(`http://localhost:3000${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    return res.json();
  }

  function blobToBase64(b: Blob): Promise<string> { return new Promise((resolve) => { const r = new FileReader(); r.onloadend = () => resolve(String(r.result).split(',')[1] || ''); r.readAsDataURL(b); }); }

  async function recordOnceMs(ms = 4000): Promise<string> {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    const chunks: BlobPart[] = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    const done = new Promise<string>((resolve) => {
      rec.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const b64 = await blobToBase64(blob);
        resolve(`data:audio/webm;base64,${b64}`);
      };
    });
    rec.start();
    setTimeout(() => rec.stop(), Math.min(6000, ms));
    return done;
  }
})();


