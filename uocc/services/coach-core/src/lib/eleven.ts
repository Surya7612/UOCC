// Use global fetch (Node 18+)

export async function speak(text: string): Promise<string> {
  const api = process.env.ELEVENLABS_API_KEY!;
  const voice = process.env.ELEVENLABS_VOICE_ID!;
  const base = process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io/v1';
  if (!api || !voice) throw new Error('ElevenLabs not configured');

  // pre-format: short sentences read better
  const toSay = text
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/([a-zA-Z0-9])\s*[-–]\s*/g, '$1 — ') // nicer dash pause
    .slice(0, 240);

  const body = {
    text: toSay,
    model_id: 'eleven_turbo_v2',       // smoother prosody
    voice_settings: {
      stability: 0.4,                  // a bit expressive
      similarity_boost: 0.8,
      style: 0.4,
      use_speaker_boost: true
    },
    optimize_streaming_latency: 2      // okay for short clips
  };

  const res = await fetch(`${base}/text-to-speech/${voice}`, {
    method: 'POST',
    headers: {
      'xi-api-key': api,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) throw new Error(`TTS failed ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return `data:audio/mpeg;base64,${buf.toString('base64')}`;
}


export async function transcribe(dataUrl: string, mime: string = 'audio/webm'): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const base = process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io/v1';
  if (!apiKey) return '';
  const { buffer } = dataUrlToBuffer(dataUrl);
  if (buffer.length > 5 * 1024 * 1024) throw new Error('audio too large');
  const url = `${base}/speech-to-text`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': mime },
    body: new Uint8Array(buffer)
  });
  if (!resp.ok) throw new Error(`STT error ${resp.status}`);
  const json = (await resp.json()) as any;
  return String(json?.text || json?.transcript || '');
}

export async function voiceConvert(dataUrl: string, targetVoiceId?: string): Promise<string> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = targetVoiceId || process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
  const base = process.env.ELEVENLABS_BASE_URL || 'https://api.elevenlabs.io/v1';
  if (!apiKey) return 'data:audio/mpeg;base64,';
  const { buffer } = dataUrlToBuffer(dataUrl);
  const url = `${base}/speech-to-speech/${voiceId}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: { 'xi-api-key': apiKey, 'Content-Type': 'audio/webm' },
    body: new Uint8Array(buffer)
  });
  if (!resp.ok) throw new Error(`S2S error ${resp.status}`);
  const buf = Buffer.from(await resp.arrayBuffer());
  return `data:audio/mpeg;base64,${buf.toString('base64')}`;
}

function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; mime: string } {
  const match = /^data:([^;]+);base64,(.*)$/s.exec(dataUrl || '');
  if (!match) throw new Error('invalid data url');
  const mime = match[1];
  const b64 = match[2];
  return { buffer: Buffer.from(b64, 'base64'), mime };
}


