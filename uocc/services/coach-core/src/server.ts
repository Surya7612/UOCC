import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import analyzeRouter from './routes/analyze';
import evaluateRouter from './routes/evaluate';
import speakRouter from './routes/speak';
import chatRouter from './routes/chat';
import metricsRouter from './routes/metrics';
import sttRouter from './routes/stt';
import s2sRouter from './routes/s2s';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.get('/', (_req, res) => {
  res.json({ ok: true, name: 'uocc-coach-core' });
});
app.use(cors({ origin: '*'}));
app.use('/analyze', analyzeRouter);
app.use('/evaluate', evaluateRouter);
app.use('/speak',express.json({ limit:'5mb', strict:false }), speakRouter);
app.use('/chat', chatRouter);
app.use('/metrics', metricsRouter);
app.use('/stt', sttRouter);
app.use('/s2s', s2sRouter);

const port = Number(process.env.PORT || 3000);

if (require.main === module) {
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`[coach-core] listening on http://localhost:${port}`);
  });
}

export default app;


