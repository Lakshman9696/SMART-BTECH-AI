import test from 'node:test';
import assert from 'node:assert/strict';
import { getMentorStatus } from '../../src/services/mentorApi.js';

test('mentor status maps the health API geminiConfigured field for the dashboard', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ ok: true, geminiConfigured: true }), { status: 200 });
  try {
    assert.deepEqual(await getMentorStatus(), { available: true, configured: true });
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('mentor status remains unconfigured when health has no Gemini key', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ ok: true, geminiConfigured: false }), { status: 200 });
  try {
    assert.deepEqual(await getMentorStatus(), { available: true, configured: false });
  } finally {
    globalThis.fetch = originalFetch;
  }
});
