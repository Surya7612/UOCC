import { Router } from 'express';
import { voiceConvert } from '../lib/eleven';

const router = Router();

router.post('/', async (req, res) => {
  try {
    const { audio, targetVoiceId } = req.body || {};
    if (!audio) return res.status(400).json({ error: 'audio required' });
    const out = await voiceConvert(String(audio), targetVoiceId ? String(targetVoiceId) : undefined);
    res.json({ audio: out });
  } catch (e: any) {
    res.status(500).json({ error: e?.message || 's2s error' });
  }
});

export default router;


