import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { mentorRouter } from './routes/mentor.js';
import { safeErrorDiagnostic, safeErrorMessage } from './utils/safeErrorDiagnostic.js';
import { isAllowedLocalOrigin } from './utils/localOrigin.js';

const serverDirectory = dirname(fileURLToPath(import.meta.url));
const projectDirectory = resolve(serverDirectory, '..');
dotenv.config({ path: resolve(projectDirectory, '.env.local') });
dotenv.config({ path: resolve(projectDirectory, '.env') });

const app = express();
const origins = (process.env.API_ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map(s => s.trim());
app.disable('x-powered-by');
app.use(cors({ origin(origin, callback) { if (isAllowedLocalOrigin(origin, origins)) return callback(null, true); callback(new Error('This origin is not allowed.')); } }));
app.use(express.json({ limit: '24kb' }));
app.use('/api/mentor/chat', (req, res, next) => {
  const startedAt = Date.now();
  res.on('finish', () => console.info('Mentor request', JSON.stringify({ method: req.method, status: res.statusCode, durationMs: Date.now() - startedAt })));
  res.on('close', () => {
    if (!res.writableFinished) console.warn('Mentor request closed before completion', JSON.stringify({ method: req.method, durationMs: Date.now() - startedAt }));
  });
  next();
});
app.use('/api/mentor', rateLimit({ windowMs: 60_000, limit: 20, standardHeaders: 'draft-8', legacyHeaders: false, handler: (_req, res) => res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' }) }));
app.get('/api/health', (_req, res) => res.json({ ok: true, geminiConfigured: Boolean(process.env.GEMINI_API_KEY) }));
app.use('/api/mentor', mentorRouter);
app.use((error, _req, res, _next) => {
  const { status, code } = safeErrorDiagnostic(error);
  console.error('Mentor API failure', JSON.stringify({ status, code }));
  res.status(status).json({ error: safeErrorMessage(error, { status, code }), code });
});
const port = Number(process.env.API_PORT || 8788);
app.listen(port, '127.0.0.1', () => console.log(`Smart Engineer AI API listening on http://127.0.0.1:${port}`));
