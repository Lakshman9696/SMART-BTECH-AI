import test from 'node:test';
import assert from 'node:assert/strict';
import { buildStarterRoadmap, calculateProgress, recommendNextSteps, roadmapStages } from '../../src/data/progress.js';
import { prepareContext } from '../context/prepareContext.js';

test('starter roadmap is a four-stage task list with no invented completion', () => {
  const tasks = buildStarterRoadmap({ branch: 'Computer Science', year: '2nd year', careerGoals: 'software placements', skills: ['Python'] });
  assert.equal(roadmapStages.length, 4);
  assert.equal(tasks.length, 8);
  assert.ok(tasks.every(item => item.status === 'pending'));
  assert.ok(tasks.some(item => item.description.includes('Computer Science')));
  assert.ok(tasks.every(item => item.id && item.domainId && item.route && item.priority && item.stageYear));
});

test('completion is calculated only from tasks applicable through the student year', () => {
  const tasks = buildStarterRoadmap({ year: '2nd year' }).map(item => ({ ...item }));
  tasks[0].status = 'completed'; tasks[2].status = 'in_progress';
  assert.deepEqual(calculateProgress(tasks, { year: '2nd year' }), { total: 4, completed: 1, inProgress: 1, pending: 2, percent: 25 });
  assert.equal(calculateProgress([], { year: '2nd year' }).percent, 0);
});

test('recommendations skip completed tasks and put in-progress tasks first', () => {
  const tasks = buildStarterRoadmap({ year: '2nd year' });
  tasks[0].status = 'completed'; tasks[2].status = 'in_progress';
  const picks = recommendNextSteps(tasks, { year: '2nd year', branch: 'Computer Science', skills: ['Python'] });
  assert.equal(picks[0].id, tasks[2].id);
  assert.ok(picks.every(item => item.status !== 'completed'));
  assert.ok(picks.every(item => item.stageYear <= 3));
});

test('mentor context includes bounded real progress fields and excludes identity or route data', () => {
  const { profile, progressTasks } = prepareContext({ branch: 'CSE', email: 'private@example.com' }, [], [{ id: 'task-1', title: 'Practise Python', description: 'Write loops', status: 'in_progress', priority: 'high', stageYear: 2, domainId: 'programming', route: '/private', userId: 'some-user' }]);
  assert.equal(profile.email, undefined);
  assert.equal(progressTasks[0].status, 'in_progress');
  assert.equal(progressTasks[0].route, undefined);
  assert.equal(progressTasks[0].userId, undefined);
});
