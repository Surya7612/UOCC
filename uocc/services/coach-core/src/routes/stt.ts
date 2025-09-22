import { Router } from 'express';
import { transcribe } from '../lib/eleven';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { audio, mime } = req.body || {};
    if (!audio) return res.status(400).json({ error: 'audio required' });
    const text = await transcribe(String(audio), String(mime || 'audio/webm'));
    res.json({ text });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 'stt error' });
  }
});

export default router;


