import { GoogleGenAI } from '@google/genai';
let client;
export async function generateMentorAnswer({ text, intent, profile, progressTasks = [], history, knowledge }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw Object.assign(new Error('Gemini is not connected yet. Add GEMINI_API_KEY to the server environment, then restart the API.'), { status: 503, code: 'GEMINI_NOT_CONFIGURED' });
  client ||= new GoogleGenAI({ apiKey });
  const contents = [...history, { role: 'user', text }].map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text }] }));
  const result = await client.models.generateContent({
    model: process.env.GEMINI_MODEL || 'gemini-3.8-flash', contents,
      config: { systemInstruction: `You are Smart Engineer AI, a practical, concise personal mentor for B.Tech students. Detected intent: ${intent.id}. Authorized student profile (may be incomplete): ${JSON.stringify(profile)}. Current roadmap tasks with their real student-reported statuses: ${JSON.stringify(progressTasks)}. Use the branch, year, career goal, interests, skills and task statuses to personalize recommendations. Never recommend tasks marked completed; prioritize suitable in-progress work before new tasks. Retrieved domain information/resources: ${JSON.stringify(knowledge)}. Answer the latest message, using conversation context only when relevant. Do not assume missing profile facts, repeat questions already answered, promise jobs/salaries, or claim unfinished domains are connected. For roadmap requests: give ordered learning steps, practice/project, provided relevant verified links, and one realistic next action. For direct technical questions, explain clearly and include a small example when useful. If a detail is essential, ask one specific follow-up question instead of guessing. Cite only URLs supplied in retrieved resources; never invent sources.` },
  });
  return result.text;
}
