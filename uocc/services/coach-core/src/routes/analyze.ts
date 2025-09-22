import { Router } from 'express';
import { AnalyzeInSchema, AnalyzeOutSchema } from '../lib/schema';
import { getHintsJSON } from '../lib/llm';

const router = Router();

router.post('/', async (req, res) => {
  const parsed = AnalyzeInSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }
  try {
    const result = await getHintsJSON(parsed.data);
    const out = AnalyzeOutSchema.parse(result);
    return res.json(out);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Analyze error' });
  }
});

export default router;


