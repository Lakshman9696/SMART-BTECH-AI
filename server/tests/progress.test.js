import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStarterRoadmap, calculateProgress, normalizeProgressTasks, recommendNextSteps, roadmapStages, taskPlanSignature } from '../../src/data/progress.js';
import { getProfileQuestionSequence, isAnswered } from '../../src/data/profileQuestions.js';
import { domains } from '../../src/data/domains.js';
import { intentRegistry } from '../intents/registry.js';
import { prepareContext } from '../context/prepareContext.js';

const student = { degree: 'B.Tech', branch: 'Computer Science', year: '2nd year', goalType: 'placements', careerGoals: 'software placements', skills: ['Python'] };

test('profile questions are progressive, skip answered fields and ask sensitive support only after opt-in', () => {
  const first = getProfileQuestionSequence({ degree: 'B.Tech', branch: 'CSE' });
  assert.equal(first[0].key, 'year');
  assert.ok(!first.some(question => question.key === 'degree' || question.key === 'branch'));
  assert.ok(!first.some(question => question.key === 'supportNeeds'));
  const optedIn = getProfileQuestionSequence({ supportConsent: true });
  assert.ok(optedIn.some(question => question.key === 'supportNeeds'));
  assert.equal(isAnswered({ key: 'skills' }, { skills: [] }), false);
});

test('goal-specific task plan uses registered routes and starts with honest pending tasks', () => {
  const tasks = buildStarterRoadmap(student);
  assert.equal(roadmapStages.length, 4);
  assert.equal(tasks.length, 3);
  assert.ok(tasks.every(item => item.status === 'pending'));
  assert.ok(tasks.every(item => item.id && item.domainId && item.route && item.priority && item.stageYear && item.completionCriteria && item.createdAt));
  assert.deepEqual(tasks.map(item => item.domainId), ['skill-job-analysis', 'coding', 'company-conducted-exams']);
  assert.ok(tasks.every(item => domains.some(domain => domain.id === item.domainId && domain.route === item.route)));
  assert.ok(tasks.every(item => item.domainStatus === 'planned'));
});

test('plan adapts for other goals and requires enough profile detail without inventing values', () => {
  assert.deepEqual(buildStarterRoadmap({ branch: 'CSE' }), []);
  const internTasks = buildStarterRoadmap({ ...student, goalType: 'internships' });
  assert.deepEqual(internTasks.map(item => item.domainId), ['internships', 'projects', 'coding']);
  assert.ok(internTasks.every(item => item.reason.includes('software placements')));
});

test('task plan signature changes when personalization inputs change', () => {
  assert.notEqual(taskPlanSignature(student), taskPlanSignature({ ...student, goalType: 'internships' }));
  assert.equal(taskPlanSignature(student), taskPlanSignature({ ...student, email: 'private@example.com' }));
});

test('completion is calculated only from saved tasks in applicable stages', () => {
  const tasks = buildStarterRoadmap(student);
  tasks[0].status = 'completed'; tasks[2].status = 'in_progress';
  assert.deepEqual(calculateProgress(tasks, student), { total: 3, completed: 1, inProgress: 1, pending: 1, percent: 33 });
  assert.equal(calculateProgress([], student).percent, 0);
});

test('recommendations omit completed tasks and prioritize in-progress work', () => {
  const tasks = buildStarterRoadmap(student);
  tasks[0].status = 'completed'; tasks[2].status = 'in_progress';
  const picks = recommendNextSteps(tasks, student);
  assert.equal(picks[0].id, tasks[2].id);
  assert.ok(picks.every(item => item.status !== 'completed'));
});

test('legacy programming task IDs are normalized to the current registry entry', () => {
  const tasks = normalizeProgressTasks([{ id: 'legacy', title: 'Practice code', domainId: 'programming', status: 'pending' }]);
  assert.equal(tasks[0].domainId, 'coding');
  assert.equal(tasks[0].route, '/domains/coding');
});

test('new domains join existing chatbot intents through registry metadata', () => {
  const future = { id: 'future-domain-test', enabled: true, supportedIntents: ['programming-help'] };
  domains.push(future);
  try { assert.ok(intentRegistry.find(intent => intent.id === 'programming-help').domainIds.includes(future.id)); }
  finally { domains.pop(); }
});

test('mentor context is bounded, owner-safe and sends support details only after consent', () => {
  const { profile, progressTasks } = prepareContext({ branch: 'CSE', email: 'private@example.com', supportNeeds: 'public speaking', challenges: 'old text' }, [], [{ id: 'task-1', title: 'Practice Python', description: 'Write loops', status: 'in_progress', priority: 'high', stageYear: 2, domainId: 'programming', route: '/private', userId: 'some-user' }]);
  assert.equal(profile.email, undefined);
  assert.equal(profile.supportNeeds, undefined);
  assert.equal(profile.challenges, undefined);
  assert.equal(progressTasks[0].status, 'in_progress');
  assert.equal(progressTasks[0].domainId, 'coding');
  assert.equal(progressTasks[0].route, undefined);
  assert.equal(progressTasks[0].userId, undefined);
  assert.equal(prepareContext({ supportConsent: true, supportNeeds: 'practice presenting' }).profile.supportNeeds, 'practice presenting');
});
