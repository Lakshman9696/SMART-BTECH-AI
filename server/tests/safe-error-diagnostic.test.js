import test from 'node:test';
import assert from 'node:assert/strict';
import { safeErrorDiagnostic, safeErrorMessage } from '../utils/safeErrorDiagnostic.js';

test('diagnostics contain only a validated status and code, never the provider message', () => {
  const error = Object.assign(new Error('contains prompt or secret text'), { status: 503, code: 'GEMINI_TEMPORARILY_UNAVAILABLE' });
  assert.deepEqual(safeErrorDiagnostic(error), { status: 503, code: 'GEMINI_TEMPORARILY_UNAVAILABLE' });
  assert.equal(JSON.stringify(safeErrorDiagnostic(error)).includes(error.message), false);
});

test('diagnostics replace untrusted codes and invalid statuses', () => {
  assert.deepEqual(safeErrorDiagnostic({ status: 'oops', code: 'secret-with-spaces' }), { status: 500, code: 'UNCLASSIFIED' });
});

test('unauthorized provider failures expose a useful, key-safe setup hint', () => {
  const error = Object.assign(new Error('sensitive provider response'), { status: 401 });
  const diagnostic = safeErrorDiagnostic(error);
  assert.deepEqual(diagnostic, { status: 401, code: 'GEMINI_AUTH_REJECTED' });
  assert.match(safeErrorMessage(error, diagnostic), /server credentials|API restrictions/i);
  assert.equal(safeErrorMessage(error, diagnostic).includes(error.message), false);
});
