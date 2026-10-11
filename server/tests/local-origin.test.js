import test from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedLocalOrigin } from '../utils/localOrigin.js';

test('local Vite origin is accepted when its port was auto-incremented', () => {
  assert.equal(isAllowedLocalOrigin('http://localhost:5177'), true);
  assert.equal(isAllowedLocalOrigin('http://127.0.0.1:5174'), true);
});

test('remote and non-HTTP origins remain blocked unless explicitly configured', () => {
  assert.equal(isAllowedLocalOrigin('https://attacker.example:5177'), false);
  assert.equal(isAllowedLocalOrigin('http://localhost:5201'), false);
  assert.equal(isAllowedLocalOrigin('https://app.example.com', ['https://app.example.com']), true);
});
