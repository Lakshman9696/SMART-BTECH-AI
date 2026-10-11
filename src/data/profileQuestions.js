/** Ordered, one-at-a-time profile questions. Sensitive details require an explicit opt-in. */
export const profileQuestions = [
  { key: 'degree', title: 'What degree are you studying?', subtitle: 'This helps us keep recommendations relevant to your course.', type: 'select', required: true, options: ['B.Tech', 'B.E.', 'Other undergraduate degree'] },
  { key: 'branch', title: 'What is your branch?', subtitle: 'We use this to shape examples and roadmap tasks.', type: 'text', required: true, placeholder: 'For example, Computer Science or Mechanical Engineering' },
  { key: 'year', title: 'Which year are you in?', subtitle: 'Your current year helps set a useful pace.', type: 'select', required: true, options: ['1st year', '2nd year', '3rd year', '4th year'] },
  { key: 'semester', title: 'Which semester are you in?', subtitle: 'Optional; skip if you are unsure.', type: 'select', optional: true, options: ['1', '2', '3', '4', '5', '6', '7', '8'] },
  { key: 'skills', title: 'What skills have you tried so far?', subtitle: 'Choose any skills you have used, even at a beginner level.', type: 'multi', optional: true, options: ['Programming', 'Problem solving', 'Communication', 'Design', 'Research', 'Teamwork', 'Mathematics', 'Hands-on building'] },
  { key: 'programmingExperience', title: 'How much programming experience do you have?', subtitle: 'This helps us choose a realistic starting point.', type: 'select', optional: true, options: ['I am just starting', 'I have tried a few basics', 'I can build small programs', 'I have built larger projects'] },
  { key: 'projectsExperience', title: 'What practical work have you tried?', subtitle: 'Share projects, labs, clubs or other hands-on experience. Optional.', type: 'textarea', optional: true, placeholder: 'A short project or activity is enough.' },
  { key: 'interests', title: 'What subjects or areas interest you?', subtitle: 'A few topics help us find useful domains and examples.', type: 'textarea', optional: true, placeholder: 'For example, robotics, software, energy or design.' },
  { key: 'goalType', title: 'What would you like help with most?', subtitle: 'Choose the goal that best fits right now. You can change it later.', type: 'select', optional: true, options: ['Exploring options', 'Preparing for placements', 'Finding an internship', 'Higher studies or scholarships', 'Competitive exams', 'Building a project'], values: ['exploring', 'placements', 'internships', 'higher-studies', 'competitive-exams', 'projects'] },
  { key: 'careerGoals', title: 'Do you have a role or goal in mind?', subtitle: 'Optional. A specific role makes your action plan more focused.', type: 'textarea', optional: true, placeholder: 'For example, software developer or a master’s program.' },
  { key: 'availableTime', title: 'How much time can you set aside each week?', subtitle: 'This is used to keep task estimates manageable.', type: 'select', optional: true, options: ['Under 2 hours', '2–4 hours', '5–7 hours', '8 or more hours'] },
  { key: 'learningPreference', title: 'How do you prefer to learn?', subtitle: 'Optional; choose what usually works for you.', type: 'select', optional: true, options: ['Short explanations', 'Guided practice', 'Projects and examples', 'Videos and reading', 'A mix of these'] },
  { key: 'supportConsent', title: 'Would you like to share anything about communication or learning support?', subtitle: 'This is optional. We will not ask unless you choose to share.', type: 'consent', optional: true },
  { key: 'supportNeeds', title: 'What kind of support would be useful?', subtitle: 'Share only what you are comfortable sharing. This stays in your student profile.', type: 'textarea', optional: true, sensitive: true, placeholder: 'For example, practice presenting or breaking study tasks into smaller steps.' },
];

export function isAnswered(question, profile = {}) {
  const value = profile[question.key];
  return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== null && String(value).trim() !== '';
}

export function getProfileQuestionSequence(profile = {}, { editing = false } = {}) {
  const skipped = new Set(profile.skippedQuestions || []);
  return profileQuestions.filter(question => {
    if (!editing && (isAnswered(question, profile) || skipped.has(question.key))) return false;
    if (question.sensitive && profile.supportConsent !== true) return false;
    return true;
  });
}

export function profileQuestionProgress(profile = {}, sequence = getProfileQuestionSequence(profile)) {
  const required = profileQuestions.filter(question => question.required);
  const answeredRequired = required.filter(question => isAnswered(question, profile)).length;
  const answeredOptional = profileQuestions.filter(question => question.optional && isAnswered(question, profile)).length;
  const skipped = new Set(profile.skippedQuestions || []);
  return { completed: answeredRequired + answeredOptional + skipped.size, total: profileQuestions.length, requiredComplete: answeredRequired === required.length, remaining: sequence.length };
}
