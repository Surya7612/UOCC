import { Router } from 'express';
import { ChatInSchema, ChatOutSchema } from '../lib/schema';
import { chatTutorJSON } from '../lib/llm';

const router = Router();

router.post('/', async (req, res) => {
  const parsed = ChatInSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }
  try {
    const result = await chatTutorJSON(parsed.data);
    const out = ChatOutSchema.parse(result);
    return res.json(out);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Chat error' });
  }
});

export default router;


