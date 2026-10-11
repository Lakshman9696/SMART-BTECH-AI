import test from 'node:test';
import assert from 'node:assert/strict';
import { generateWithFallback } from '../services/geminiClient.js';

test('retries a model capacity response using the fallback model', async () => {
  const calls = [];
  const reply = await generateWithFallback(['primary', 'fallback'], async model => {
    calls.push(model);
    if (model === 'primary') return JSON.stringify({ error: { code: 503, status: 'UNAVAILABLE', message: 'high demand' } });
    return 'Try one small practice project.';
  });
  assert.deepEqual(calls, ['primary', 'fallback']);
  assert.equal(reply, 'Try one small practice project.');
});

test('does not retry non-transient provider errors', async () => {
  const calls = [];
  await assert.rejects(
    generateWithFallback(['primary', 'fallback'], async model => {
      calls.push(model);
      throw Object.assign(new Error('invalid API key'), { status: 400, code: 'INVALID_ARGUMENT' });
    }),
    /invalid API key/,
  );
  assert.deepEqual(calls, ['primary']);
});

test('returns a clear temporary-unavailable message after both models are busy', async () => {
  await assert.rejects(
    generateWithFallback(['primary', 'fallback'], async () => {
      throw Object.assign(new Error('model unavailable'), { status: 503, code: 'UNAVAILABLE' });
    }),
    error => error.status === 503 && error.code === 'GEMINI_TEMPORARILY_UNAVAILABLE' && /try again in a minute/i.test(error.message),
  );
});
