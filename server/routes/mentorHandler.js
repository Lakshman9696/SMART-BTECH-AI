import { mentorService } from '../services/mentorService.js';

export async function handleMentorChat(body = {}) {
  const { text, profile = {}, history = [], progressTasks = [] } = body;
  if (typeof text !== 'string' || !text.trim() || text.length > 3000) {
    return { status: 400, body: { error: 'Enter a message under 3,000 characters.' } };
  }
  if (!Array.isArray(history) || history.length > 30) {
    return { status: 400, body: { error: 'This chat history is too long. Start a new conversation.' } };
  }
  if (!Array.isArray(progressTasks) || progressTasks.length > 80) {
    return { status: 400, body: { error: 'Roadmap context is invalid or too large.' } };
  }
  return { status: 200, body: await mentorService({ text: text.trim(), profile, history, progressTasks }) };
}
