const fields = {
  year: { question: 'Which year of your B.Tech are you in?', patterns: [/\b(first|1st|second|2nd|third|3rd|fourth|4th) year\b/i, /\b[1-4](st|nd|rd|th) year\b/i] },
  skills: { question: 'Which technical skills or programming languages have you tried so far? A beginner answer is fine.', patterns: [/\b(python|java|javascript|c\+\+|sql|html|react|beginner|basic|intermediate|advanced|no experience|none yet)\b/i] },
  branch: { question: 'What is your engineering branch?', patterns: [/\b(computer science|cse|it|information technology|mechanical|civil|electrical|electronics|ece|eee|chemical)\b/i] },
  resumeRole: { profileKey: 'careerGoals', question: 'What role or internship do you want this resume to target?', patterns: [/\b(software|developer|engineer|internship|data analyst|designer|research|placement|[a-z]+\s+(engineer|developer|analyst|intern))\b/i] },
  degree: { question: 'What degree should I list in your education section?', patterns: [/\b(b\.?\s?tech|b\.?\s?e\.?|bachelor|degree|diploma)\b/i] },
  projects: { profileKey: 'projectsExperience', question: 'What project or practical experience should the resume highlight? You can say “none yet.”', patterns: [/\b(project|built|created|developed|experience|none yet|no projects)\b/i] },
};

function answered(key, history = [], profile = {}) {
  const value = profile[fields[key]?.profileKey || key];
  if (Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && String(value).trim() !== '') return true;
  const pattern = fields[key]?.patterns;
  return Boolean(pattern && history.some(message => message.role === 'user' && pattern.some(regex => regex.test(message.text || ''))));
}

export function chooseFollowUp({ text, intent, history = [], profile = {}, pendingIntent = '', awaitingField = '' }) {
  const question = String(text || '');
  const asksForResume = intent.id === 'resume-building' && /\b(create|make|build|write|prepare|need|want|help|draft)\b/i.test(question);
  const asksForTemplate = /\b(template|blank format|copyable format|sample format)\b/i.test(question);
  // Keep ordinary factual and technical questions direct; resume creation is the exception.
  if (/\b(explain|what is|what are|how do|how can i learn|define|show me|give me an example)\b/i.test(question) && !asksForResume) return null;
  // A pending follow-up should only consume a reply that fits the field we asked for.
  // If the student switches topics, handle that new request instead of repeating the follow-up.
  const pendingFieldPattern = fields[awaitingField]?.patterns;
  const answersPendingField = Boolean(pendingFieldPattern?.some(regex => regex.test(question)));
  if (pendingIntent && pendingIntent !== intent.id && !answersPendingField && !asksForResume && !asksForTemplate) return null;
  const turns = [...history, { role: 'user', text: question }];
  if ((asksForResume || pendingIntent === 'resume-building') && !asksForTemplate) {
    for (const field of ['resumeRole', 'degree', 'branch', 'year', 'skills', 'projects']) {
      if (!answered(field, turns, profile)) return { field, question: fields[field].question, pendingIntent: 'resume-building' };
    }
  }
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
