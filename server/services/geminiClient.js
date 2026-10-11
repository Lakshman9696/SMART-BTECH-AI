import { GoogleGenAI } from '@google/genai';
let client;

function providerErrorFromResponse(text) {
  if (typeof text !== 'string') return null;
  try {
    const parsed = JSON.parse(text);
    if (!parsed?.error) return null;
    const status = Number(parsed.error.status || parsed.error.code);
    const code = String(parsed.error.status || parsed.error.code || '').toUpperCase();
    if (status === 429 || status === 503 || code === 'UNAVAILABLE' || code === 'RESOURCE_EXHAUSTED') {
      return Object.assign(new Error('The AI provider is temporarily busy.'), { status: status || 503, code: code || 'GEMINI_TEMPORARILY_UNAVAILABLE' });
    }
    return Object.assign(new Error('The AI provider could not complete the request.'), { status: status || 502, code: code || 'GEMINI_PROVIDER_ERROR' });
  } catch {
    return null;
  }
}

function isTransientProviderError(error) {
  const status = Number(error?.status || error?.statusCode || error?.code);
  const code = String(error?.code || '').toUpperCase();
  return status === 429 || status === 503 || code === 'UNAVAILABLE' || code === 'RESOURCE_EXHAUSTED'
    || /temporar|overload|high demand|rate.?limit|try again later/i.test(error?.message || '');
}

export async function generateWithFallback(models, request) {
  let lastError;
  for (const model of models) {
    try {
      const text = await request(model);
      const responseError = providerErrorFromResponse(text);
      if (responseError) throw responseError;
      if (typeof text !== 'string' || !text.trim()) throw Object.assign(new Error('The AI provider returned an empty reply.'), { status: 502, code: 'GEMINI_EMPTY_RESPONSE' });
      return text;
    } catch (error) {
      lastError = error;
      if (!isTransientProviderError(error) || model === models.at(-1)) break;
      console.warn(`Gemini model ${model} is temporarily unavailable; trying the configured fallback model.`);
    }
  }
  if (isTransientProviderError(lastError)) {
    throw Object.assign(new Error('Gemini is temporarily busy. Please try again in a minute.'), { status: 503, code: 'GEMINI_TEMPORARILY_UNAVAILABLE' });
  }
  throw lastError;
}

export async function generateMentorAnswer({ text, intent, profile, progressTasks = [], history, knowledge }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw Object.assign(new Error('Gemini is not connected yet. Add GEMINI_API_KEY to the server environment, then restart the API.'), { status: 503, code: 'GEMINI_NOT_CONFIGURED' });
  client ||= new GoogleGenAI({ apiKey });
  const contents = [...history, { role: 'user', text }].map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.text }] }));
  const systemInstruction = `You are Smart Engineer AI, a practical, concise personal mentor for B.Tech students. Detected intent: ${intent.id}. Authorized student profile (may be incomplete): ${JSON.stringify(profile)}. Current roadmap tasks with their real student-reported statuses: ${JSON.stringify(progressTasks)}. Use branch, year, career goal, interests, skills and task statuses to personalize recommendations. Never invent a student's education, grades, skills, projects, experience, or achievements. Never recommend tasks marked completed; prioritize a relevant in-progress task, then a relevant pending task. Retrieved domain information/resources: ${JSON.stringify(knowledge)}. Answer the latest message, using conversation context only when relevant. Start with a direct answer. For greeting-only messages such as "Hi", reply briefly and invite the student to ask a question; do not request profile details or add action/domain recommendations. For a useful longer answer, use concise Markdown headings, short paragraphs, numbered steps or bullets, then an example only when it helps. When useful, finish with one short, specific, realistic action labelled **Your next step 🎯**. For short factual questions, answer directly and omit an unrelated action. For resume requests, briefly confirm you can help; ask one essential missing question at a time when needed, using known profile and conversation facts. If asked for a template, provide a copyable resume template with clear headings and bracketed placeholders; never fill unknown facts with guesses. Do not promise jobs/salaries or claim unfinished domains are connected. For roadmap requests: give ordered learning steps, practice/project, provided relevant verified links, and one realistic next action. For direct technical questions, explain clearly and include a small example when useful. If a detail is essential, ask one specific follow-up question instead of guessing. Cite only URLs supplied in retrieved resources; never invent sources.`;
  const primaryModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const fallbackModel = process.env.GEMINI_FALLBACK_MODEL || 'gemini-3.6-flash';
  const models = primaryModel === fallbackModel ? [primaryModel] : [primaryModel, fallbackModel];
  return generateWithFallback(models, async model => {
    const result = await client.models.generateContent({ model, contents, config: { systemInstruction } });
    return result.text;
  });
}
