import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { mentorRouter } from './routes/mentor.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const origins = (process.env.API_ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(s => s.trim());
app.disable('x-powered-by');
app.use(cors({ origin(origin, callback) { if (!origin || origins.includes(origin)) return callback(null, true); callback(new Error('This origin is not allowed.')); } }));
app.use(express.json({ limit: '24kb' }));
app.use('/api/mentor', rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false, handler: (_req, res) => res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' }) }));
app.get('/api/health', (_req, res) => res.json({ ok: true, geminiConfigured: Boolean(process.env.GEMINI_API_KEY) }));
app.use('/api/mentor', mentorRouter);
app.use((error, _req, res, _next) => {
  const status = error.status || 500;
  if (status >= 500) console.error('Mentor API error:', error.code || error.message);
  res.status(status).json({ error: status === 503 ? error.message : status === 429 ? 'Too many requests. Please wait a moment and try again.' : 'The mentor could not respond right now. Please try again shortly.', code: error.code || undefined });
});
const port = Number(process.env.API_PORT || 8787);
app.listen(port, '127.0.0.1', () => console.log(`Smart Engineer AI API listening on http://127.0.0.1:${port}`));
