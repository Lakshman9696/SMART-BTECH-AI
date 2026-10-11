import test from 'node:test';
import assert from 'node:assert/strict';
import health from '../../api/health.js';
import chat from '../../api/mentor/chat.js';

function response() {
  return {
    headers: {}, statusCode: 200, payload: null,
    setHeader(name, value) { this.headers[name] = value; return this; },
    status(value) { this.statusCode = value; return this; },
    json(value) { this.payload = value; return this; },
  };
}

test('Vercel health route reports API and key setup without revealing the key', () => {
  const res = response();
  health({ method: 'GET' }, res);
  assert.equal(res.statusCode, 200);
  assert.equal(res.payload.ok, true);
  assert.equal(typeof res.payload.geminiConfigured, 'boolean');
  assert.equal(JSON.stringify(res.payload).includes(process.env.GEMINI_API_KEY || 'impossible-key'), false);
});

test('Vercel mentor route validates method and request body', async () => {
  const methodRes = response();
  await chat({ method: 'GET', headers: {} }, methodRes);
  assert.equal(methodRes.statusCode, 405);
  assert.equal(methodRes.headers.Allow, 'POST');

  const bodyRes = response();
  await chat({ method: 'POST', headers: { host: 'app.example.test', origin: 'https://app.example.test', 'x-forwarded-for': '198.51.100.201' }, body: { text: '' } }, bodyRes);
  assert.equal(bodyRes.statusCode, 400);
  assert.match(bodyRes.payload.error, /Enter a message/);
});

test('Vercel mentor route blocks cross-origin calls', async () => {
  const res = response();
  await chat({ method: 'POST', headers: { host: 'app.example.test', origin: 'https://other.example.test', 'x-forwarded-for': '198.51.100.202' }, body: { text: 'hello' } }, res);
  assert.equal(res.statusCode, 403);
});
