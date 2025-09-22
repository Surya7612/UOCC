import { Router } from 'express';
import { EvaluateInSchema, EvaluateOutSchema } from '../lib/schema';
import { runPythonTests } from '../lib/pythonRunner';

const router = Router();

router.post('/', async (req, res) => {
  const parsed = EvaluateInSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
  }
  const { source, lang, tests, timeoutSec } = parsed.data;
  try {
    const result = await runPythonTests(source, tests, timeoutSec);
    const out = EvaluateOutSchema.parse(result);
    return res.json(out);
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Evaluation error' });
  }
});

export default router;


