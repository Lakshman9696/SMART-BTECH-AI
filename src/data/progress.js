import { getDomain } from './domains.js';

export const roadmapStages = [
  { id: 'foundations', year: 1, title: 'Build your foundations', description: 'Study habits, core subjects and confidence with engineering basics.' },
  { id: 'core-skills', year: 2, title: 'Grow core technical skills', description: 'Develop practical technical skills and apply them in small builds.' },
  { id: 'advanced-internships', year: 3, title: 'Explore advanced skills & internships', description: 'Choose a focus, build portfolio evidence and explore internships.' },
  { id: 'placements-launch', year: 4, title: 'Prepare for placements & launch', description: 'Strengthen your resume, practise interviews and plan your career launch.' },
];

const plans = {
  placements: [
    { id: 'role-requirements', title: 'Compare requirements for one target role', domainId: 'skill-job-analysis', priority: 'high', estimatedMinutes: 25, description: 'Choose one role related to your goal and list the skills and evidence employers ask for.', completionCriteria: 'Save a short list of role requirements and mark which ones you already have.', reason: 'A role-specific skill comparison makes placement preparation more focused.' },
    { id: 'technical-practice', title: 'Practise one technical skill', domainId: 'coding', priority: 'high', estimatedMinutes: 40, description: 'Use a skill you already know or choose one from your profile, then complete a small practice exercise.', completionCriteria: 'Complete one exercise and note what you learned or where you got stuck.', reason: 'Regular practice turns the skills in your profile into demonstrable ability.' },
    { id: 'placement-readiness', title: 'Prepare for one placement assessment', domainId: 'company-conducted-exams', priority: 'normal', estimatedMinutes: 30, description: 'Review the common sections in a company hiring assessment and choose one area to practise.', completionCriteria: 'Record the assessment areas and complete one practice set.', reason: 'A small, repeatable assessment routine supports your placement goal.' },
  ],
  internships: [
    { id: 'internship-role', title: 'Choose an internship role to explore', domainId: 'internships', priority: 'high', estimatedMinutes: 25, description: 'Find one internship role that matches your interests and list its application requirements.', completionCriteria: 'Save one role description and a checklist of its stated requirements.', reason: 'A real role description gives you a concrete target for preparation.' },
    { id: 'portfolio-evidence', title: 'Plan one portfolio project', domainId: 'projects', priority: 'high', estimatedMinutes: 35, description: 'Outline a small project that demonstrates a skill related to your internship goal.', completionCriteria: 'Write the problem, intended user, first feature and a finish line for the project.', reason: 'A focused project can give your internship application practical evidence.' },
    { id: 'internship-skill', title: 'Practise a skill from the internship requirements', domainId: 'coding', priority: 'normal', estimatedMinutes: 40, description: 'Pick one requirement from the role you reviewed and practise it with a short exercise.', completionCriteria: 'Complete one exercise and save a link or note showing the result.', reason: 'This connects learning time directly to the internship requirements you find.' },
  ],
  'higher-studies': [
    { id: 'study-path', title: 'Compare requirements for one study path', domainId: 'abroad-scholarships', priority: 'high', estimatedMinutes: 30, description: 'Choose a program or study destination to explore and list its published entry requirements.', completionCriteria: 'Save one official program page and a checklist of its requirements.', reason: 'Checking actual requirements helps make higher-study planning concrete.' },
    { id: 'academic-focus', title: 'Choose one subject to strengthen', domainId: 'academic-learning', priority: 'high', estimatedMinutes: 35, description: 'Pick a subject that supports your study goal and define a small topic to review this week.', completionCriteria: 'Complete one focused review session and note the topic covered.', reason: 'Steady academic work supports the preparation your study path may require.' },
    { id: 'research-scope', title: 'Outline a small research or build idea', domainId: 'projects', priority: 'normal', estimatedMinutes: 35, description: 'Write a question or problem connected to your interests and identify a first way to explore it.', completionCriteria: 'Record the question, one relevant source and a first experiment or prototype step.', reason: 'A manageable project can help you explore your interests with practical evidence.' },
  ],
  'competitive-exams': [
    { id: 'exam-map', title: 'Map one exam’s official requirements', domainId: 'government-competitive-exams', priority: 'high', estimatedMinutes: 30, description: 'Choose the exam you are considering and review its official eligibility, subjects and dates.', completionCriteria: 'Save the official exam page and list its requirements and sections.', reason: 'Planning from the official exam information avoids relying on assumptions.' },
    { id: 'exam-study-block', title: 'Plan one focused study block', domainId: 'academic-learning', priority: 'high', estimatedMinutes: 35, description: 'Choose one subject from the exam outline and schedule a focused study session.', completionCriteria: 'Complete one study block and note what you covered.', reason: 'A small study routine is easier to start and review than an oversized plan.' },
    { id: 'exam-practice', title: 'Try one practice set', domainId: 'company-conducted-exams', priority: 'normal', estimatedMinutes: 30, description: 'Choose a practice set for a section that appears in the exam you selected.', completionCriteria: 'Complete one set and note which question types need more practice.', reason: 'A short practice set helps identify a useful next study topic.' },
  ],
  projects: [
    { id: 'project-scope', title: 'Turn an idea into a first project scope', domainId: 'projects', priority: 'high', estimatedMinutes: 30, description: 'Choose a problem connected to your interests and outline a small first version.', completionCriteria: 'Write the problem, intended user, first feature and a clear stopping point.', reason: 'A small scope makes it easier to start building and learn from the result.' },
    { id: 'project-skill', title: 'Choose a skill for your first project step', domainId: 'coding', priority: 'high', estimatedMinutes: 40, description: 'Identify one skill needed for the first feature, then try one focused practice exercise.', completionCriteria: 'Complete an exercise connected to the feature and save the result or notes.', reason: 'Learning a skill in the context of your project gives practice a clear purpose.' },
    { id: 'project-feedback', title: 'Get feedback on one project decision', domainId: 'skill-job-analysis', priority: 'normal', estimatedMinutes: 20, description: 'Explain the problem and first feature to a classmate or mentor and ask what is unclear.', completionCriteria: 'Record one piece of feedback and decide whether to use it.', reason: 'Early feedback can help keep a project useful and achievable.' },
  ],
  exploring: [
    { id: 'career-options', title: 'Compare two paths that interest you', domainId: 'career', priority: 'high', estimatedMinutes: 25, description: 'Write down two roles, study paths or opportunities you are curious about and what attracts you to each.', completionCriteria: 'Save two options and one question you want to investigate for each.', reason: 'Comparing a small number of options can make career exploration less overwhelming.' },
    { id: 'skill-inventory', title: 'Connect your current skills to possible roles', domainId: 'skill-job-analysis', priority: 'normal', estimatedMinutes: 25, description: 'Review the skills you shared and pick one strength and one area you want to explore.', completionCriteria: 'Record one existing strength and one skill to investigate next.', reason: 'Your current skills provide a practical starting point for exploration.' },
    { id: 'learning-experiment', title: 'Try one short learning experiment', domainId: 'academic-learning', priority: 'normal', estimatedMinutes: 30, description: 'Choose a topic related to your interests and spend one focused session exploring it.', completionCriteria: 'Complete one session and decide whether you want to continue with the topic.', reason: 'A short experiment helps you explore interests without committing to a long plan.' },
  ],
};

function slug(value = '') { return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 35) || 'exploring'; }
const legacyDomainId = id => id === 'programming' ? 'coding' : id;
const legacyRoute = id => getDomain(legacyDomainId(id))?.route;
function goalType(profile = {}) {
  const declared = profile.goalType;
  if (plans[declared]) return declared;
  const goal = `${profile.careerGoals || ''} ${profile.interests || ''}`.toLowerCase();
  if (/internship/.test(goal)) return 'internships';
  if (/higher stud|master|m\.tech|abroad|scholarship|research degree/.test(goal)) return 'higher-studies';
  if (/exam|gate|banking|government|upsc|competitive/.test(goal)) return 'competitive-exams';
  if (/placement|job|software|career|employ|interview/.test(goal)) return 'placements';
  if (/project|startup|build|research/.test(goal)) return 'projects';
  return 'exploring';
}

export function currentStudyYear(profile = {}) {
  const match = String(profile.year || '').match(/[1-4]/);
  return match ? Number(match[0]) : null;
}

export function taskPlanSignature(profile = {}) {
  return JSON.stringify(['degree', 'branch', 'year', 'semester', 'skills', 'programmingExperience', 'projectsExperience', 'interests', 'goalType', 'careerGoals', 'availableTime', 'learningPreference'].map(key => profile[key] ?? null));
}

function taskFromBlueprint(blueprint, profile, goal, previous) {
  const domain = getDomain(blueprint.domainId);
  if (!domain?.enabled) return null;
  const target = profile.careerGoals?.trim();
  const interest = profile.interests?.trim();
  const firstSkill = Array.isArray(profile.skills) ? profile.skills.find(Boolean) : '';
  const id = `plan-${slug(goal)}-${blueprint.id}`;
  const old = previous.get(id);
  const personalization = [
    target ? `This is tied to your stated goal: ${target}.` : '',
    interest ? `It also connects to your interest in ${interest}.` : '',
    domain.id === 'coding' && firstSkill ? `It builds on the ${firstSkill} skill you shared.` : '',
    domain.id === 'coding' && profile.programmingExperience ? `The starting point reflects your programming experience: ${profile.programmingExperience.toLowerCase()}.` : '',
    domain.id === 'projects' && profile.projectsExperience?.trim() ? 'It can build on the practical work you have already tried.' : '',
    profile.branch ? `Examples can be adapted to your ${profile.branch} branch.` : '',
  ].filter(Boolean).join(' ');
  const reason = [blueprint.reason, personalization].filter(Boolean).join(' ');
  return {
    id, title: blueprint.id === 'technical-practice' && firstSkill ? `Practise ${firstSkill} with a focused exercise` : blueprint.title,
    description: blueprint.description, domainId: domain.id, domainName: domain.name, domainStatus: domain.status, route: domain.route,
    priority: blueprint.priority, reason, estimatedMinutes: blueprint.estimatedMinutes, prerequisites: [], completionCriteria: blueprint.completionCriteria,
    stageYear: currentStudyYear(profile) || 1, stageId: roadmapStages[(currentStudyYear(profile) || 1) - 1].id,
    status: old?.status || 'pending', createdAt: old?.createdAt || new Date().toISOString(), updatedAt: old?.updatedAt || new Date().toISOString(),
    completedAt: old?.completedAt || null, resourceRefs: [],
  };
}

/** Build a small, goal-aware plan from enabled registry entries; retain active and completed history. */
export function buildPersonalizedTaskPlan(profile = {}, existingTasks = []) {
  if (!profile.branch?.trim() || !currentStudyYear(profile)) return [];
  const goal = goalType(profile), previous = new Map(existingTasks.map(item => [item.id, { ...item, domainId: legacyDomainId(item.domainId), route: item.route || legacyRoute(item.domainId) }]));
  const selected = (plans[goal] || plans.exploring).map(item => taskFromBlueprint(item, profile, goal, previous)).filter(Boolean);
  const selectedIds = new Set(selected.map(item => item.id));
  const history = existingTasks.filter(item => item.status !== 'pending' && !selectedIds.has(item.id)).map(item => ({ ...item, domainId: legacyDomainId(item.domainId), route: item.route || legacyRoute(item.domainId) }));
  return [...history, ...selected];
}

export function normalizeProgressTasks(tasks = []) {
  return tasks.map(item => {
    const id = legacyDomainId(item.domainId), domain = getDomain(id);
    return { ...item, domainId: id, domainName: domain?.name || item.domainName, route: domain?.route || item.route };
  });
}

// Backward compatible name retained for existing callers.
export const buildStarterRoadmap = buildPersonalizedTaskPlan;

export function calculateProgress(tasks = [], profile = {}) {
  const year = currentStudyYear(profile);
  const applicable = tasks.filter(item => !year || !item.stageYear || item.stageYear <= year);
  const completed = applicable.filter(item => item.status === 'completed').length;
  return { total: applicable.length, completed, inProgress: applicable.filter(item => item.status === 'in_progress').length, pending: applicable.filter(item => item.status === 'pending').length, percent: applicable.length ? Math.round(completed / applicable.length * 100) : 0 };
}

function relevance(item, profile = {}) {
  const text = [profile.branch, profile.careerGoals, profile.interests, ...(profile.skills || [])].filter(Boolean).join(' ').toLowerCase();
  const candidate = `${item.title} ${item.description} ${item.domainName || ''}`.toLowerCase();
  return text.split(/[^a-z0-9+#]+/).filter(token => token.length > 2 && candidate.includes(token)).length;
}

export function recommendNextSteps(tasks = [], profile = {}, limit = 3) {
  const year = currentStudyYear(profile);
  const candidates = tasks.filter(item => item.status !== 'completed' && (!year || !item.stageYear || item.stageYear <= Math.min(4, year + 1)) && getDomain(legacyDomainId(item.domainId))?.enabled);
  return candidates.sort((a, b) => {
    const status = { in_progress: 0, pending: 1 }, priority = { high: 0, normal: 1, low: 2 };
    const lastUpdate = task => Date.parse(task.updatedAt || task.createdAt || '') || 0;
    return (status[a.status] ?? 2) - (status[b.status] ?? 2) || (priority[a.priority] ?? 1) - (priority[b.priority] ?? 1) || relevance(b, profile) - relevance(a, profile) || lastUpdate(b) - lastUpdate(a) || a.stageYear - b.stageYear;
  }).slice(0, limit).map((item, index) => ({ ...item, reason: item.reason || (item.status === 'in_progress' ? 'Resume the work you already started.' : index === 0 ? 'This is a high-priority action for your current goal.' : 'A practical next milestone for your current plan.') }));
}

export function stageStatus(stage, tasks = [], profile = {}) {
  const year = currentStudyYear(profile), stageTasks = tasks.filter(item => item.stageYear === stage.year);
  if (stageTasks.length && stageTasks.every(item => item.status === 'completed')) return 'completed';
  if (stageTasks.some(item => item.status === 'in_progress')) return 'in_progress';
  return year === stage.year ? 'current' : year && stage.year < year ? 'past' : 'upcoming';
}

