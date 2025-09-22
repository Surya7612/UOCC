"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.speak = speak;
exports.transcribe = transcribe;
exports.voiceConvert = voiceConvert;
const node_fetch_1 = __importDefault(require("node-fetch"));
async function speak(text) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    const clamped = (text || '').slice(0, 200);
    if (!apiKey || !clamped) {
        return { audio: 'data:audio/mpeg;base64,' };
    }
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
    const resp = await (0, node_fetch_1.default)(url, {
        method: 'POST',
        headers: {
            'xi-api-key': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: clamped, model_id: 'eleven_tts_v1' })
    });
    if (!resp.ok)
        throw new Error(`ElevenLabs error ${resp.status}`);
    const buf = Buffer.from(await resp.arrayBuffer());
    const b64 = buf.toString('base64');
    return { audio: `data:audio/mpeg;base64,${b64}` };
}
async function transcribe(dataUrl, mime = 'audio/webm') {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const base = process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io/v1';
    if (!apiKey)
        return '';
    const { buffer } = dataUrlToBuffer(dataUrl);
    if (buffer.length > 5 * 1024 * 1024)
        throw new Error('audio too large');
    const url = `${base}/speech-to-text`;
    const resp = await (0, node_fetch_1.default)(url, {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'Content-Type': mime },
        body: buffer
    });
    if (!resp.ok)
        throw new Error(`STT error ${resp.status}`);
    const json = (await resp.json());
    return String(json?.text || json?.transcript || '');
}
async function voiceConvert(dataUrl, targetVoiceId) {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = targetVoiceId || process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    const base = process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io/v1';
    if (!apiKey)
        return 'data:audio/mpeg;base64,';
    const { buffer } = dataUrlToBuffer(dataUrl);
    const url = `${base}/speech-to-speech/${voiceId}`;
    const resp = await (0, node_fetch_1.default)(url, {
        method: 'POST',
        headers: { 'xi-api-key': apiKey, 'Content-Type': 'audio/webm' },
        body: buffer
    });
    if (!resp.ok)
        throw new Error(`S2S error ${resp.status}`);
    const buf = Buffer.from(await resp.arrayBuffer());
    return `data:audio/mpeg;base64,${buf.toString('base64')}`;
}
function dataUrlToBuffer(dataUrl) {
    const match = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl || '');
    if (!match)
        throw new Error('invalid data url');
    const mime = match[1];
    const b64 = match[2];
    return { buffer: Buffer.from(b64, 'base64'), mime };
}
