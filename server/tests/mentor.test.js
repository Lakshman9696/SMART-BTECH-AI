import test from 'node:test';
import assert from 'node:assert/strict';
import { mentorService } from '../services/mentorService.js';

const generated = async input => `Answer for ${input.intent.id}: ${input.text}`;
test('A: software job asks for year, then uses year and asks skills progressively', async () => {
  let result = await mentorService({ text: 'I want a software job' }, generated);
  assert.equal(result.awaitingField, 'year');
  result = await mentorService({ text: "I'm in second year", history: [{ role: 'assistant', text: result.reply, pendingIntent: result.pendingIntent, awaitingField: result.awaitingField }] }, generated);
  assert.equal(result.awaitingField, 'skills');
  result = await mentorService({ text: 'I know Python basics', history: [{ role: 'assistant', text: 'Which year?', pendingIntent: 'career-guidance' }, { role: 'user', text: "I'm in second year" }, { role: 'assistant', text: 'What skills?', pendingIntent: 'career-guidance' }] }, generated);
  assert.match(result.reply, /second year|Python|career-guidance/i);
});
test('B: SQL learning gets an immediate roadmap response with resources', async () => {
  let received;
  const result = await mentorService({ text: 'How can I learn SQL?' }, async input => { received = input; return 'Start with SELECT, then filtering, joins, and projects. PostgreSQL tutorial: https://www.postgresql.org/docs/current/tutorial.html'; });
  assert.equal(result.followUpQuestion, null);
  assert.equal(received.knowledge.resources.length, 2);
});
test('C: SQL joins is answered directly', async () => {
  let called = false;
  const result = await mentorService({ text: 'Explain SQL joins' }, async () => { called = true; return 'A JOIN combines rows. Example: SELECT * FROM students JOIN courses ON students.course_id = courses.id;'; });
  assert.equal(called, true); assert.match(result.reply, /JOIN combines/);
});
test('D: project recommendation asks for branch when unknown', async () => {
  const result = await mentorService({ text: 'Suggest a project' }, generated);
  assert.equal(result.awaitingField, 'branch');
});
test('E: profile and earlier conversation context are retained in the request', async () => {
  let received;
  await mentorService({ text: 'What should I learn next?', profile: { year: '2nd year', skills: ['Python'] }, history: [{ role: 'user', text: "I'm in second year and know Python" }] }, async input => { received = input; return 'Learn data structures next.'; });
  assert.equal(received.profile.year, '2nd year'); assert.deepEqual(received.profile.skills, ['Python']); assert.equal(received.history.length, 1);
});
test('F: a new programming topic overrides pending career follow-up', async () => {
  let called = false;
  const result = await mentorService({ text: 'Explain SQL joins', history: [{ role: 'assistant', text: 'Which year?', pendingIntent: 'career-guidance', awaitingField: 'year' }] }, async () => { called = true; return 'A SQL JOIN combines rows that match a condition.'; });
  assert.equal(called, true); assert.equal(result.awaitingField, '');
});
test('profile allowlist excludes email and history stays bounded', async () => {
  let received;
  await mentorService({ text: 'Hello, can you help?', profile: { year: '2nd year', email: 'private@example.com' }, history: Array.from({ length: 20 }, (_, i) => ({ role: 'user', text: String(i) })) }, async input => { received = input; return 'Yes.'; });
  assert.equal(received.profile.email, undefined); assert.equal(received.history.length, 12);
});
test('mentor receives student roadmap statuses for personalized answers', async () => {
  let received;
  await mentorService({ text: 'Why is this my next step?', profile: { year: '2nd year' }, progressTasks: [{ id: 'x', title: 'Practise Python', status: 'in_progress', stageYear: 2 }] }, async input => { received = input; return 'Continue your Python practice.'; });
  assert.equal(received.progressTasks[0].status, 'in_progress');
});
