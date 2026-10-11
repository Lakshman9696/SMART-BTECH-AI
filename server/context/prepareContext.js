import { enabledDomainIds } from '../intents/registry.js';

const allowed = ['degree', 'branch', 'year', 'semester', 'skills', 'programmingExperience', 'projectsExperience', 'interests', 'goalType', 'careerGoals', 'availableTime', 'learningPreference'];
export function prepareContext(profile = {}, history = [], progressTasks = []) {
  const safeProfile = Object.fromEntries(allowed.filter(key => profile[key] != null && profile[key] !== '').flatMap(key => {
    const value = profile[key];
    if (key === 'skills') return Array.isArray(value) ? [[key, value.filter(skill => typeof skill === 'string').slice(0, 30).map(skill => skill.slice(0, 100))]] : [];
    return typeof value === 'string' ? [[key, value.slice(0, 500)]] : [];
  }));
  // Challenges and learning-support details are sent only after explicit profile opt-in.
  if (profile.supportConsent === true) {
    safeProfile.supportConsent = true;
    for (const key of ['supportNeeds', 'challenges', 'helpNeeded']) if (typeof profile[key] === 'string' && profile[key].trim()) safeProfile[key] = profile[key].slice(0, 500);
  }
  const safeHistory = history.slice(-12).filter(m => ['user', 'assistant'].includes(m.role) && typeof m.text === 'string').map(({ role, text, pendingIntent, awaitingField }) => ({ role, text: text.slice(0, 3000), pendingIntent, awaitingField }));
  const safeProgress = (Array.isArray(progressTasks) ? progressTasks : []).slice(0, 40).filter(task => task && typeof task.title === 'string' && ['pending', 'in_progress', 'completed'].includes(task.status)).map(task => ({
    id: String(task.id || '').slice(0, 100), title: task.title.slice(0, 180), description: String(task.description || '').slice(0, 500), reason: String(task.reason || '').slice(0, 300), completionCriteria: String(task.completionCriteria || '').slice(0, 300), estimatedMinutes: Math.max(0, Math.min(1000, Number(task.estimatedMinutes) || 0)), domainId: (task.domainId === 'programming' ? 'coding' : String(task.domainId || '')).slice(0, 100), status: task.status, priority: ['high', 'normal', 'low'].includes(task.priority) ? task.priority : 'normal', stageYear: Math.max(1, Math.min(4, Number(task.stageYear) || 1)), stageId: String(task.stageId || '').slice(0, 100),
  })).filter(task => !task.domainId || enabledDomainIds.has(task.domainId));
  return { profile: safeProfile, history: safeHistory, progressTasks: safeProgress };
}
