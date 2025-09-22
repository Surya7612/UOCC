// Use global fetch (Node 18+)

export async function speak(text: string): Promise<{ audio: string }> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
  const clamped = (text || '').slice(0, 200);
  if (!apiKey || !clamped) {
    return { audio: 'data:audio/mpeg;base64,' };
  }
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`;
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'accept': 'audio/mpeg',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: clamped,
      model_id: 'eleven_turbo_v2',
      optimize_streaming_latency: 0
    })
  });
  if (!resp.ok) {
    const errTxt = await resp.text().catch(() => "");
    throw new Error(`ElevenLabs TTS ${resp.status}: ${errTxt}`);
  }
  const buf = Buffer.from(await resp.arrayBuffer());
  const b64 = buf.toString('base64');
  return { audio: `data:audio/mpeg;base64,${b64}` };
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


