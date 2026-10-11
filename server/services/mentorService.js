import { classifyIntent } from '../intents/classifyIntent.js';
import { chooseFollowUp } from '../intents/followUps.js';
import { prepareContext } from '../context/prepareContext.js';
import { retrieveDomainKnowledge } from '../knowledge/domainKnowledge.js';
import { generateMentorAnswer } from './geminiClient.js';
import { validateResponse } from './validateResponse.js';

export async function mentorService({ text, profile = {}, progressTasks = [], history = [] }, generate = generateMentorAnswer) {
  const { profile: safeProfile, history: safeHistory, progressTasks: safeProgress } = prepareContext(profile, history, progressTasks);
  const prior = history.at(-1);
  const pending = prior?.role === 'assistant' ? prior.pendingIntent : '';
  const intent = classifyIntent(text);
  const followUp = chooseFollowUp({ text, intent, history: safeHistory, profile: safeProfile, pendingIntent: pending });
  if (followUp) return { intent: intent.id, reply: followUp.question, followUpQuestion: followUp.question, pendingIntent: followUp.pendingIntent, awaitingField: followUp.field, recommendedDomainIds: [] };
  const knowledge = retrieveDomainKnowledge(intent, text);
  const answer = await generate({ text, intent, profile: safeProfile, history: safeHistory, progressTasks: safeProgress, knowledge });
  const valid = validateResponse({ reply: answer, recommendedDomainIds: intent.domainIds });
  return { intent: intent.id, ...valid, followUpQuestion: null, pendingIntent: '', awaitingField: '' };
}
