import { classifyIntent } from '../intents/classifyIntent.js';
import { chooseFollowUp } from '../intents/followUps.js';
import { prepareContext } from '../context/prepareContext.js';
import { retrieveDomainKnowledge } from '../knowledge/domainKnowledge.js';
import { generateMentorAnswer } from './geminiClient.js';
import { validateResponse } from './validateResponse.js';
import { recommendNextSteps } from '../../src/data/progress.js';
import { getDomain } from '../../src/data/domains.js';

function nextActionFromPlan(intent, text, profile, progressTasks) {
  const completedSomething = /\b(finished|completed|done with|marked .* complete)\b/i.test(text);
  const recommendedDomainIds = intent.domainIds || [];
  if (!completedSomething && !recommendedDomainIds.length) return null;
  const task = recommendNextSteps(progressTasks, profile, Math.min(progressTasks.length, 20))
    .find(item => completedSomething || recommendedDomainIds.includes(item.domainId));
  if (!task) return null;
  const domain = getDomain(task.domainId);
  if (!domain?.enabled) return null;
  return {
    taskId: task.id,
    title: task.title,
    reason: task.reason,
    status: task.status,
    domainId: domain.id,
    domainName: domain.name,
    domainStatus: domain.status,
    route: domain.route,
    estimatedMinutes: task.estimatedMinutes,
  };
}

export async function mentorService({ text, profile = {}, progressTasks = [], history = [] }, generate = generateMentorAnswer) {
  const { profile: safeProfile, history: safeHistory, progressTasks: safeProgress } = prepareContext(profile, history, progressTasks);
  const prior = history.at(-1);
  const pending = prior?.role === 'assistant' ? prior.pendingIntent : '';
  const awaitingField = prior?.role === 'assistant' ? prior.awaitingField : '';
  const intent = classifyIntent(text);
  const followUp = chooseFollowUp({ text, intent, history: safeHistory, profile: safeProfile, pendingIntent: pending, awaitingField });
  if (followUp) return { intent: intent.id, reply: followUp.question, followUpQuestion: followUp.question, pendingIntent: followUp.pendingIntent, awaitingField: followUp.field, recommendedDomainIds: [] };
  const knowledge = retrieveDomainKnowledge(intent, text);
  const answer = await generate({ text, intent, profile: safeProfile, history: safeHistory, progressTasks: safeProgress, knowledge });
  const valid = validateResponse({ reply: answer, recommendedDomainIds: intent.id === 'general-student-question' ? [] : intent.domainIds });
  return {
    intent: intent.id,
    ...valid,
    actionPlanTask: nextActionFromPlan(intent, text, safeProfile, safeProgress),
    followUpQuestion: null,
    pendingIntent: '',
    awaitingField: '',
  };
}
