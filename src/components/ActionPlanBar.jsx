import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildStarterRoadmap, normalizeProgressTasks, recommendNextSteps, taskPlanSignature } from '../data/progress';
import { Icon } from './Icon';

const mentorUrl = text => `/?mentorPrompt=${encodeURIComponent(text)}#assistant`;

export default function ActionPlanBar({ profile, saveProfile, profileLoading = false, user, secureStorage }) {
  const [tasks, setTasks] = useState(() => normalizeProgressTasks(profile?.progressTasks || []));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const lastPlanAttempt = useRef('');
  useEffect(() => { setTasks(normalizeProgressTasks(profile?.progressTasks || [])); }, [profile?.progressTasks]);
  const nextSteps = useMemo(() => recommendNextSteps(tasks, profile || {}, 3), [tasks, profile]);
  const canPlan = Boolean(profile?.branch?.trim() && profile?.year);

  async function persist(next, updates = {}) {
    const previous = tasks;
    setTasks(next); setSaving(true); setError('');
    try { await saveProfile({ ...(profile || {}), ...updates, progressTasks: next }); }
    catch (issue) { setTasks(previous); setError(issue.message || 'Your action plan could not be saved. Please try again.'); }
    finally { setSaving(false); }
  }

  function createPlan() {
    const next = buildStarterRoadmap(profile || {}, tasks);
    persist(next, { progressPlanSignature: taskPlanSignature(profile || {}) });
  }

  useEffect(() => {
    if (!canPlan || !tasks.length || saving) return;
    const signature = taskPlanSignature(profile);
    if (profile.progressPlanSignature === signature || lastPlanAttempt.current === signature) return;
    lastPlanAttempt.current = signature;
    const next = buildStarterRoadmap(profile, tasks);
    if (next.length) persist(next, { progressPlanSignature: signature });
  }, [canPlan, profile?.branch, profile?.year, profile?.goalType, profile?.careerGoals, profile?.interests, profile?.skills, profile?.programmingExperience, profile?.projectsExperience, profile?.availableTime, profile?.learningPreference, profile?.progressPlanSignature, tasks, saving]);

  function updateStatus(task, status) {
    const now = new Date().toISOString();
    persist(tasks.map(item => item.id === task.id ? { ...item, status, updatedAt: now, completedAt: status === 'completed' ? now : null } : item));
  }

  return <section className="panel action-plan-bar" aria-labelledby="action-plan-title">
    <div className="action-plan-heading"><div><span className="section-kicker">PERSONALIZED NEXT STEPS</span><h2 id="action-plan-title">My Action Plan</h2><p>Small actions based on your profile and current goal.</p></div><Link className="text-link" to="/progress">Full progress <Icon name="arrow" size={14}/></Link></div>
    {!tasks.length ? <div className="action-plan-empty"><p>{canPlan ? 'Create a short, goal-aware plan. Nothing is marked complete until you update it.' : 'Add your branch and year to create practical actions for your current goal.'}</p>{!canPlan ? <Link className="button-primary" to="/profile">Set up your profile <Icon name="arrow" size={14}/></Link> : secureStorage && !user ? <Link className="button-primary" to="/account">Sign in to save <Icon name="arrow" size={14}/></Link> : <button className="button-primary" disabled={saving || profileLoading} onClick={createPlan}>{saving ? 'Creating…' : 'Create my action plan'} <Icon name="arrow" size={14}/></button>}</div> : nextSteps.length ? <div className="action-plan-list">{nextSteps.map((task, index) => <article className="action-plan-task" key={task.id}>
      <span className={`task-state-mark ${task.status}`}>{task.status === 'in_progress' ? '↗' : '○'}</span><div className="action-plan-copy"><b>{index === 0 ? 'Next up · ' : ''}{task.title}</b><p>{task.reason}</p><small>{task.domainName} · {task.estimatedMinutes} min · {task.priority} priority{task.domainStatus !== 'ready' ? ' · planned preview' : ''}</small></div>
      <div className="action-plan-controls"><Link to={task.route || '/domains'} className="text-link">{task.status === 'in_progress' ? 'Resume' : 'Open'} <Icon name="arrow" size={13}/></Link><button disabled={saving} onClick={() => updateStatus(task, task.status === 'in_progress' ? 'completed' : 'in_progress')}>{task.status === 'in_progress' ? 'Mark complete' : 'Start'}</button><Link className="action-mentor-link" to={mentorUrl(`Why is “${task.title}” my next step? Use my profile and roadmap progress to explain.`)}>Ask mentor</Link></div>
    </article>)}</div> : <div className="action-plan-empty"><p>Your current actions are complete. Visit progress to review your roadmap or ask your mentor to set a new direction.</p><Link className="button-primary" to="/progress">Review progress <Icon name="arrow" size={14}/></Link></div>}
    {error && <p role="alert" className="form-error">{error}</p>}
    <div className="action-plan-footnote">Progress updates when you change a task status. Domains marked “planned preview” are not connected features yet.</div>
  </section>;
}
