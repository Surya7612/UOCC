import { Router } from 'express';
import { SpeakInSchema, SpeakOutSchema } from '../lib/schema';
import { speak } from '../lib/eleven';

const router = Router();

router.post('/', async (req, res) => {
  const parsed = SpeakInSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }
  try {
    const result = await speak(parsed.data.text);
    const out = SpeakOutSchema.parse(result);
    return res.json(out);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Speak error' });
  }
});

export default router;


