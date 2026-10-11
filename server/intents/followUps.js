const fields = {
  year: { question: 'Which year of your degree are you studying?', patterns: [/\b(first|1st|second|2nd|third|3rd|fourth|4th) year\b/i, /\b[1-4](st|nd|rd|th) year\b/i] },
  skills: { question: 'What programming languages or technical skills have you used so far?', patterns: [/\b(python|java|javascript|c\+\+|sql|html|react|beginner|basic|intermediate|advanced)\b/i] },
  branch: { question: 'What is your engineering branch?', patterns: [/\b(computer science|cse|it|information technology|mechanical|civil|electrical|electronics|ece|eee|chemical)\b/i] },
};
const present = (history, profile = {}) => Object.entries(fields).filter(([key, spec]) => {
  if (profile[key] || (key === 'year' && profile.year)) return true;
  return history.some(m => m.role === 'user' && spec.patterns.some(pattern => pattern.test(m.text || '')));
}).map(([key]) => key);

export function chooseFollowUp({ text, intent, history = [], profile = {}, pendingIntent = '' }) {
  const current = [...history, { role: 'user', text }];
  const has = present(current, profile);
  // Explicit topic changes take precedence over an earlier unresolved question.
  if (/\b(explain|what is|how do|how can i learn)\b/i.test(text)) return null;
  if (intent.id === 'career-guidance' && /software job|software engineer|developer job|career path|job/i.test(text) && !has.includes('year'))
    return { field: 'year', question: fields.year.question, pendingIntent: intent.id };
  if (intent.id === 'project-recommendations') {
    if (!has.includes('branch')) return { field: 'branch', question: fields.branch.question, pendingIntent: intent.id };
    if (!has.includes('skills')) return { field: 'skills', question: fields.skills.question, pendingIntent: intent.id };
  }
  if (pendingIntent === 'career-guidance' && !has.includes('skills'))
    return { field: 'skills', question: fields.skills.question, pendingIntent };
  return null;
}
