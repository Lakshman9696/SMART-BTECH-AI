import { getDomain } from './domains.js';

export const roadmapStages = [
  { id: 'foundations', year: 1, title: 'Build your foundations', description: 'Study habits, core subjects and confidence with engineering basics.' },
  { id: 'core-skills', year: 2, title: 'Grow core technical skills', description: 'Develop practical technical skills and apply them in small builds.' },
  { id: 'advanced-internships', year: 3, title: 'Explore advanced skills & internships', description: 'Choose a focus, build portfolio evidence and explore internships.' },
  { id: 'placements-launch', year: 4, title: 'Prepare for placements & launch', description: 'Strengthen your resume, practise interviews and plan your career launch.' },
];

function branchLabel(profile) { return profile?.branch?.trim() || 'your branch'; }
function goalLabel(profile) { return profile?.careerGoals?.trim() || profile?.interests?.trim() || 'your career direction'; }
function task(id, title, description, domainId, stageYear, priority, tags = []) {
  const domain = getDomain(domainId);
  return { id, title, description, domainId, route: domain?.route || '/domains', status: 'pending', priority, stageYear, stageId: roadmapStages[stageYear - 1].id, tags, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
}

/** Creates a starter roadmap with no implied activity; every task begins pending. */
export function buildStarterRoadmap(profile = {}) {
  const branch = branchLabel(profile), goal = goalLabel(profile);
  return [
    task('year-1-study-rhythm', 'Create a weekly study rhythm', `Choose consistent study blocks for your ${branch} coursework.`, 'academic-learning', 1, 'high', [branch]),
    task('year-1-core-map', `Map the foundations of ${branch}`, 'List the core subjects you want to strengthen and choose one topic to practise this week.', 'academic-learning', 1, 'normal', [branch]),
    task('year-2-technical-skill', 'Choose one core technical skill to practise', `Pick a skill that supports ${goal} and practise it in short, regular sessions.`, 'programming', 2, 'high', [goal, ...(profile.skills || [])]),
    task('year-2-applied-build', 'Build a small applied project', `Use one current skill to make a small project connected to ${branch}.`, 'projects', 2, 'normal', [branch, ...(profile.interests ? [profile.interests] : [])]),
    task('year-3-specialization', 'Choose an advanced skill to explore', `Compare advanced skills that fit ${goal}, then choose one to explore.`, 'skill-job-analysis', 3, 'high', [goal]),
    task('year-3-internship', 'Prepare for internship opportunities', 'Review role requirements and make a short list of experience or project gaps to work on.', 'internships', 3, 'high', ['internship', goal]),
    task('year-4-resume', 'Prepare a role-focused resume', `Organize your projects and skills for roles related to ${goal}.`, 'job-skills-interview-soft-skills', 4, 'high', [goal]),
    task('year-4-interview-practice', 'Set a placement practice routine', 'Choose a weekly slot for aptitude, technical questions and interview practice.', 'company-conducted-exams', 4, 'normal', ['placements', goal]),
  ];
}

export function currentStudyYear(profile = {}) {
  const match = String(profile.year || '').match(/[1-4]/);
  return match ? Number(match[0]) : null;
}

export function calculateProgress(tasks = [], profile = {}) {
  const year = currentStudyYear(profile);
  const applicable = tasks.filter(item => !year || item.stageYear <= year);
  const completed = applicable.filter(item => item.status === 'completed').length;
  return { total: applicable.length, completed, inProgress: applicable.filter(item => item.status === 'in_progress').length, pending: applicable.filter(item => item.status === 'pending').length, percent: applicable.length ? Math.round(completed / applicable.length * 100) : 0 };
}

function relevance(taskItem, profile = {}) {
  const text = [profile.branch, profile.careerGoals, profile.interests, ...(profile.skills || [])].filter(Boolean).join(' ').toLowerCase();
  const hits = (taskItem.tags || []).filter(tag => tag && text.includes(String(tag).toLowerCase())).length;
  return hits;
}

export function recommendNextSteps(tasks = [], profile = {}, limit = 3) {
  const year = currentStudyYear(profile);
  const candidates = tasks.filter(item => item.status !== 'completed' && (!year || item.stageYear <= Math.min(4, year + 1)));
  return candidates.sort((a, b) => {
    const aStatus = a.status === 'in_progress' ? 0 : 1, bStatus = b.status === 'in_progress' ? 0 : 1;
    const priority = { high: 0, normal: 1, low: 2 };
    return aStatus - bStatus || (priority[a.priority] ?? 1) - (priority[b.priority] ?? 1) || relevance(b, profile) - relevance(a, profile) || a.stageYear - b.stageYear;
  }).slice(0, limit).map((item, index) => ({ ...item, reason: item.status === 'in_progress' ? 'Pick up the task you already started.' : relevance(item, profile) ? 'This connects to the branch, skills or direction you shared.' : index === 0 ? 'This is a high-priority task for your current roadmap stage.' : 'A useful next milestone in your B.Tech roadmap.' }));
}

export function stageStatus(stage, tasks = [], profile = {}) {
  const year = currentStudyYear(profile);
  const stageTasks = tasks.filter(item => item.stageYear === stage.year);
  if (stageTasks.length && stageTasks.every(item => item.status === 'completed')) return 'completed';
  if (stageTasks.some(item => item.status === 'in_progress')) return 'in_progress';
  return year === stage.year ? 'current' : year && stage.year < year ? 'past' : 'upcoming';
}
