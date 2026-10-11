import { handleMentorChat } from '../../server/routes/mentorHandler.js';
import { safeErrorDiagnostic, safeErrorMessage } from '../../server/utils/safeErrorDiagnostic.js';

const windowMs = 60_000;
const requestLimit = 15;
const requestsByIp = new Map();

function isAllowedOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return true;
  const allowed = (process.env.API_ALLOWED_ORIGINS || '').split(',').map(value => value.trim()).filter(Boolean);
  if (allowed.includes(origin)) return true;
  try {
    return new URL(origin).host === req.headers.host;
  } catch {
    return false;
  }
}

function allowRequest(req) {
  const now = Date.now();
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  const recent = (requestsByIp.get(ip) || []).filter(timestamp => now - timestamp < windowMs);
  if (recent.length >= requestLimit) {
    requestsByIp.set(ip, recent);
    return false;
  }
  recent.push(now);
  requestsByIp.set(ip, recent);
  if (requestsByIp.size > 1000) {
    for (const [key, timestamps] of requestsByIp) {
      if (!timestamps.some(timestamp => now - timestamp < windowMs)) requestsByIp.delete(key);
    }
  }
  return true;
}

export const config = { maxDuration: 60 };

export default async function chat(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed.' });
  }
  if (!isAllowedOrigin(req)) return res.status(403).json({ error: 'This origin is not allowed.' });
  if (!allowRequest(req)) return res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });

  try {
    const result = await handleMentorChat(req.body || {});
    return res.status(result.status).json(result.body);
  } catch (error) {
    const { status, code } = safeErrorDiagnostic(error);
    if (status === 401 || status === 403 || status >= 500) console.error('Mentor API failure', JSON.stringify({ status, code }));
    return res.status(status).json({ error: safeErrorMessage(error, { status, code }), code });
  }
}
