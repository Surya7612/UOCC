"use strict";
/* -------------------------------------------------------------------------------------------------
   UOCC VS Code Webview Script (panel.ts)
   - Plain browser script (no imports/exports)
   - Runs inside a VS Code webview
   - Talks to backend at API_BASE
--------------------------------------------------------------------------------------------------*/
/* global acquireVsCodeApi */
const API_BASE = 'http://localhost:3000';
// VS Code webview API
const vscode = typeof globalThis.acquireVsCodeApi === 'function'
    ? acquireVsCodeApi()
    : { postMessage: (_) => { } };
// ---- UI elements ----
const codeEl = document.getElementById('code');
const testsEl = document.getElementById('tests');
const hint1 = document.getElementById('hint1');
const hint2 = document.getElementById('hint2');
const hint3 = document.getElementById('hint3');
const chatBox = document.getElementById('uocc-chat');
const meter = document.getElementById('meter');
const voiceToggle = document.getElementById('voiceToggle');
const micBtn = document.getElementById('micBtn');
const analyzeBtn = document.getElementById('analyzeBtn');
const evaluateBtn = document.getElementById('evaluateBtn');
const revealBtn = document.getElementById('revealBtn');
const speakBtn = document.getElementById('speakBtn');
const answerBtn = document.getElementById('getAnswerBtn');
// ---- runtime state ----
let source = '';
let lang = 'plaintext';
let filename = '';
let lastFailures;
let lastHints;
let hintLevelShown = 0;
let voiceEnabled = true;
let state = 'idle';
// Ask for initial doc info ASAP
try {
    vscode.postMessage({ type: 'getInitial' });
}
catch { /* no-op */ }
// ---------- Wire UI ----------
voiceToggle.onchange = (e) => {
    voiceEnabled = e.target.checked;
};
micBtn.onclick = () => onMicClick();
analyzeBtn.onclick = async () => {
    try {
        await setState('thinking');
        const json = await post('/analyze', {
            source,
            lang: 'python',
            context: { platform: 'vscode', filename },
            failures: lastFailures
        });
        lastHints = json;
        hintLevelShown = 1;
        renderHints();
    }
    catch (e) {
        setError('Analyze failed: ' + (e?.message || e));
    }
    finally {
        await setState('idle');
    }
};
revealBtn.onclick = () => {
    if (!lastHints)
        return;
    if (hintLevelShown < 2)
        hintLevelShown = 2;
    else if (hintLevelShown < 3 && lastFailures?.length)
        hintLevelShown = 3;
    renderHints();
};
evaluateBtn.onclick = async () => {
    try {
        await setState('thinking');
        // Demo tests (Two Sum)
        const tests = [
            { in: [[2, 7, 11, 15], 9], out: [0, 1] },
            { in: [[3, 2, 4], 6], out: [1, 2] },
            { in: [[3, 3], 6], out: [0, 1] },
        ];
        const json = await post('/evaluate', { source, lang: 'python', tests });
        lastFailures = json.failures;
        renderTests(json);
        // simple demo decoration: point at solve()/first return
        const point = guessBugLine(source);
        if (point != null) {
            vscode.postMessage({
                type: 'decorate',
                payload: { startLine: point, endLine: point, reason: 'Check logic around here' }
            });
        }
    }
    catch (e) {
        setError('Run checks failed: ' + (e?.message || e));
    }
    finally {
        await setState('idle');
    }
};
speakBtn.onclick = async (e) => {
    e.preventDefault();
    try {
        const text = (hintLevelShown >= 2 && lastHints?.levels?.[1]?.text) ||
            lastHints?.levels?.[0]?.text ||
            'Analyzing your code.';
        const { audio } = await post('/speak', { text: String(text).slice(0, 200) });
        playAudio(audio);
    }
    catch (e) {
        setError('Speak failed: ' + (e?.message || e));
    }
};
answerBtn.onclick = async () => {
    try {
        await setState('thinking');
        const chat = await post('/chat', {
            mode: 'answer',
            lang,
            source,
            context: { platform: 'vscode', filename },
            userMessage: 'Give final correct solution and time/space complexity.'
        });
        renderChatReply(chat);
        if (voiceEnabled && chat?.speak) {
            const { audio } = await post('/speak', { text: String(chat.speak).slice(0, 200) });
            playAudio(audio);
        }
    }
    catch (e) {
        setError('Answer failed: ' + (e?.message || e));
    }
    finally {
        await setState('idle');
    }
};
// ---------- VS Code -> Webview ----------
window.addEventListener('message', (event) => {
    const msg = event.data;
    if (msg?.type === 'initial') {
        source = msg.payload?.source ?? '';
        lang = msg.payload?.lang ?? 'plaintext';
        filename = msg.payload?.filename ?? '';
        codeEl.textContent = source;
    }
});
// ---------- Renderers ----------
function renderHints() {
    if (!lastHints)
        return;
    hint1.textContent = lastHints.levels?.[0]?.text || '';
    hint2.textContent = hintLevelShown >= 2 ? (lastHints.levels?.[1]?.text || '') : '';
    hint3.textContent = hintLevelShown >= 3 ? (lastHints.levels?.[2]?.text || '') : '';
}
function renderTests(result) {
    testsEl.innerHTML = '';
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = 'auto 1fr 1fr 1fr';
    grid.style.gap = '6px';
    ['#', 'Input', 'Expected', 'Got/Err'].forEach(h => {
        const d = document.createElement('div');
        d.style.fontWeight = '600';
        d.textContent = h;
        grid.appendChild(d);
    });
    (result.failures || []).forEach((f) => {
        [String(f.index), JSON.stringify(f.input ?? []), JSON.stringify(f.expected),
            f.error ? String(f.error) : JSON.stringify(f.got)]
            .forEach(c => { const d = document.createElement('div'); d.textContent = c; grid.appendChild(d); });
    });
    testsEl.appendChild(grid);
}
function renderChatReply(chat) {
    const html = markdownToHtml(String(chat?.reply ?? ''));
    const actions = Array.isArray(chat?.nextActions) && chat.nextActions.length
        ? `<ul class="next">${chat.nextActions.map((a) => `<li>${escapeHtml(a)}</li>`).join('')}</ul>`
        : '';
    chatBox.innerHTML = `<div class="reply">${html}</div>${actions}`;
}
/** Tiny MD: ``` blocks + inline `code` + paragraphs */
function markdownToHtml(md) {
    md = md.replace(/```(\w+)?\n([\s\S]*?)```/g, (_m, _lang, code) => `<pre class="code"><code>${escapeHtml(code)}</code></pre>`);
    md = md.replace(/`([^`]+?)`/g, (_m, code) => `<code class="inline">${escapeHtml(code)}</code>`);
    md = md.replace(/\n{2,}/g, '</p><p>').replace(/\n/g, '<br/>');
    return `<p>${md}</p>`;
}
// ---------- Helpers ----------
function guessBugLine(src) {
    const lines = src.split(/\r?\n/);
    const idx00 = lines.findIndex(l => l.replace(/\s+/g, '').startsWith('return[0,0]'));
    if (idx00 >= 0)
        return idx00;
    let inSolve = false;
    for (let i = 0; i < lines.length; i++) {
        const l = lines[i];
        if (/^\s*def\s+solve\s*\(/.test(l))
            inSolve = true;
        if (inSolve && /^\s*return\b/.test(l))
            return i;
    }
    return null;
}
async function onMicClick() {
    try {
        await setState('recording');
        const audioUrl = await recordOnceMs(3500);
        await setState('transcribing');
        const { text } = await post('/stt', { audio: audioUrl, mime: 'audio/webm' });
        await setState('thinking');
        const chat = await post('/chat', {
            mode: 'coach', lang, source, userMessage: text,
            context: { platform: 'vscode', filename }, run_summary: { failures: lastFailures }
        });
        renderChatReply(chat);
        if (voiceEnabled && chat?.speak) {
            const { audio } = await post('/speak', { text: String(chat.speak).slice(0, 200) });
            playAudio(audio);
        }
    }
    catch (e) {
        setError('Mic flow failed: ' + (e?.message || e));
    }
    finally {
        await setState('idle');
    }
}
// ---------- Utils ----------
function setError(msg) { meter.textContent = 'State: ' + msg; }
async function setState(s) { state = s; meter.textContent = 'State: ' + s; }
function escapeHtml(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function playAudio(dataUrl) { new Audio(dataUrl).play().catch(() => { }); }
async function post(path, body, timeoutMs = 15000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
        const res = await fetch(`http://localhost:3000${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: ctrl.signal,
        });
        if (!res.ok) {
            const txt = await res.text().catch(() => '');
            throw new Error(`${path} ${res.status} ${txt}`);
        }
        return res.json();
    }
    catch (e) {
        if (e?.name === 'AbortError')
            throw new Error(`${path} timeout after ${timeoutMs}ms`);
        throw e;
    }
    finally {
        clearTimeout(t);
    }
}
function blobToBase64(b) {
    return new Promise(r => {
        const fr = new FileReader();
        fr.onloadend = () => r(String(fr.result).split(',')[1] || '');
        fr.readAsDataURL(b);
    });
}
async function recordOnceMs(ms = 3500) {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const rec = new window.MediaRecorder(stream, { mimeType: 'audio/webm' });
    const chunks = [];
    rec.ondataavailable = (e) => chunks.push(e.data);
    const done = new Promise(resolve => {
        rec.onstop = async () => {
            stream.getTracks().forEach(t => t.stop());
            const b = new Blob(chunks, { type: 'audio/webm' });
            const b64 = await blobToBase64(b);
            resolve(`data:audio/webm;base64,${b64}`);
        };
    });
    rec.start();
    setTimeout(() => rec.state !== 'inactive' && rec.stop(), Math.min(6000, ms));
    return done;
}
