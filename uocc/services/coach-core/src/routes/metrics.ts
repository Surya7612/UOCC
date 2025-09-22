import { Router } from 'express';
import fs from 'fs';

const router = Router();

router.post('/event', async (req, res) => {
  const line = JSON.stringify({ ts: Date.now(), ...req.body }) + '\n';
  fs.appendFileSync('events.ndjson', line);
  res.json({ ok: true });
});

export default router;


