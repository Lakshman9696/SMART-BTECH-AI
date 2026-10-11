const fields = {
  year: { question: 'Which year of your B.Tech are you in?', patterns: [/\b(first|1st|second|2nd|third|3rd|fourth|4th) year\b/i, /\b[1-4](st|nd|rd|th) year\b/i] },
  skills: { question: 'Which technical skills or programming languages have you tried so far? A beginner answer is fine.', patterns: [/\b(python|java|javascript|c\+\+|sql|html|react|beginner|basic|intermediate|advanced|no experience|none yet)\b/i] },
  branch: { question: 'What is your engineering branch?', patterns: [/\b(computer science|cse|it|information technology|mechanical|civil|electrical|electronics|ece|eee|chemical)\b/i] },
};

function answered(key, history = [], profile = {}) {
  const value = profile[key];
  if (Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && String(value).trim() !== '') return true;
  const pattern = fields[key]?.patterns;
  return Boolean(pattern && history.some(message => message.role === 'user' && pattern.some(regex => regex.test(message.text || ''))));
}

export function chooseFollowUp({ text, intent, history = [], profile = {}, pendingIntent = '' }) {
  const question = String(text || '');
  // A concrete topic request should be answered directly, even during onboarding.
  if (/\b(explain|what is|what are|how do|how can i learn|define|show me|give me an example)\b/i.test(question)) return null;
  const turns = [...history, { role: 'user', text: question }];
  if (intent.id === 'career-guidance' && /software job|software engineer|developer job|career path|job role|placement/i.test(question) && !answered('year', turns, profile))
    return { field: 'year', question: fields.year.question, pendingIntent: intent.id };
  if (intent.id === 'project-recommendations') {
    if (!answered('branch', turns, profile)) return { field: 'branch', question: fields.branch.question, pendingIntent: intent.id };
    if (!answered('skills', turns, profile)) return { field: 'skills', question: fields.skills.question, pendingIntent: intent.id };
  }
  if (pendingIntent === 'career-guidance' && !answered('skills', turns, profile))
    return { field: 'skills', question: fields.skills.question, pendingIntent };
  return null;
}

