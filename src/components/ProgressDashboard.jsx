import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { buildStarterRoadmap, calculateProgress, normalizeProgressTasks, recommendNextSteps, roadmapStages, stageStatus, taskPlanSignature } from '../data/progress';
import { Icon } from './Icon';

const statusLabel = { pending: 'To do', in_progress: 'In progress', completed: 'Completed' };
const mentorUrl = prompt => `/?mentorPrompt=${encodeURIComponent(prompt)}#assistant`;

export default function ProgressDashboard({ profile, saveProfile, profileLoading, user, secureStorage }) {
  const [tasks, setTasks] = useState(() => normalizeProgressTasks(profile?.progressTasks || [])), [saving, setSaving] = useState(false), [error, setError] = useState('');
  const lastPlanAttempt = useRef('');
  useEffect(() => { setTasks(normalizeProgressTasks(profile?.progressTasks || [])); }, [profile?.progressTasks]);
  const hasRoadmap = tasks.length > 0;
  const stats = useMemo(() => calculateProgress(tasks, profile || {}), [tasks, profile]);
  const nextSteps = useMemo(() => recommendNextSteps(tasks, profile || {}), [tasks, profile]);

  async function persist(next, profileUpdates = {}) {
    const previous = tasks;
    setTasks(next); setSaving(true); setError('');
    try { await saveProfile({ ...(profile || {}), ...profileUpdates, progressTasks: next }); }
    catch (issue) { setTasks(previous); setError(issue.message || 'Your progress could not be saved. Please try again.'); }
    finally { setSaving(false); }
  }
  function changeStatus(id, status) {
    const now = new Date().toISOString();
    persist(tasks.map(item => item.id === id ? { ...item, status, updatedAt: now, completedAt: status === 'completed' ? now : null } : item));
  }
  function createRoadmap() { persist(buildStarterRoadmap(profile || {}, tasks), { progressPlanSignature: taskPlanSignature(profile || {}) }); }

  // Editing a goal or study year updates pending actions while retaining started/completed work.
  useEffect(() => {
    if (!profile?.branch || !profile?.year || !tasks.length || saving) return;
    const signature = taskPlanSignature(profile);
    if (profile.progressPlanSignature === signature || lastPlanAttempt.current === signature) return;
    lastPlanAttempt.current = signature;
    const next = buildStarterRoadmap(profile, tasks);
    if (next.length) persist(next, { progressPlanSignature: signature });
  }, [profile?.branch, profile?.year, profile?.goalType, profile?.careerGoals, profile?.interests, profile?.skills, profile?.programmingExperience, profile?.projectsExperience, profile?.availableTime, profile?.learningPreference, profile?.progressPlanSignature, tasks, saving]);

  return <>
    <section className="panel student-progress-panel" aria-labelledby="roadmap-progress-title">
      <div className="panel-heading"><div><span className="section-kicker">ROADMAP PROGRESS</span><h2 id="roadmap-progress-title">Progress you can trust</h2></div><span className="panel-icon"><Icon name="layers" size={18}/></span></div>
      {!hasRoadmap ? <div className="progress-empty-state"><div><b>Your roadmap starts with one plan</b><p>{profile?.branch && profile?.year ? `We’ll use your ${profile.branch} profile, ${profile.year} year and stated goal to create three practical starter actions. They begin as to do; completion changes only when you update a status.` : 'Add your branch and current year first. The roadmap will use your own goals and skills to create practical starter actions.'}</p></div>
        {!profile?.branch || !profile?.year ? <Link className="button-primary" to="/profile">Complete your profile <Icon name="arrow" size={14}/></Link> : secureStorage && !user ? <Link className="button-primary" to="/account">Sign in to save progress <Icon name="arrow" size={14}/></Link> : <button className="button-primary" onClick={createRoadmap} disabled={saving || profileLoading}>{saving ? 'Creating…' : 'Create my roadmap'} <Icon name="arrow" size={14}/></button>}
      </div> : <>
        <div className="progress-count-row"><b>{stats.percent}%</b><span>{stats.completed} of {stats.total} applicable tasks completed</span><span className="progress-save-state">{saving ? 'Saving…' : secureStorage && user ? 'Saved to your account' : 'Saved in this browser'}</span></div>
        <div className="task-progress-track" role="progressbar" aria-label="Roadmap completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow={stats.percent}><span style={{ width: `${stats.percent}%` }}/></div>
        <div className="task-status-counts"><span><i className="complete-dot"/>{stats.completed} completed</span><span><i className="active-dot"/>{stats.inProgress} in progress</span><span><i className="pending-dot"/>{stats.pending} to do</span></div>
        <div className="stage-roadmap">{roadmapStages.map(stage => {
          const stageTasks = tasks.filter(item => item.stageYear === stage.year), state = stageStatus(stage, tasks, profile || {});
          return <article className={`roadmap-stage ${state}`} key={stage.id}><div className="stage-index">{state === 'completed' ? '✓' : `0${stage.year}`}</div><div className="stage-details"><span>YEAR {stage.year}</span><h3>{stage.title}</h3><p>{stage.description}</p><small>{stageTasks.length ? `${stageTasks.filter(item => item.status === 'completed').length}/${stageTasks.length} tasks complete` : 'No tasks assigned yet'} · {state === 'current' ? 'Current stage' : state === 'in_progress' ? 'In progress' : state === 'completed' ? 'Completed' : state === 'past' ? 'Earlier stage' : 'Upcoming'}</small></div></article>;
        })}</div>
      </>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </section>

    <div className="progress-feature-grid">
      <section className="panel next-steps-panel"><div className="panel-heading"><div><span className="section-kicker">PRIORITY ACTIONS</span><h2>What should I do next?</h2></div><span className="panel-icon violet"><Icon name="spark" size={18}/></span></div>
        {!hasRoadmap ? <div className="progress-inline-empty">Create your roadmap to see next actions. {profile?.careerGoals ? `Your goal is ${profile.careerGoals}.` : 'Your profile and goals help personalize the plan.'}</div> : nextSteps.length ? <div className="next-task-list">{nextSteps.map((item, index) => <article className="next-task" key={item.id}><span className="next-rank">{String(index + 1).padStart(2, '0')}</span><div className="next-task-copy"><b>{item.title}</b><p>{item.reason}</p><small>{item.domainName} · {roadmapStages[item.stageYear - 1]?.title} · {item.priority} priority{item.domainStatus !== 'ready' ? ' · planned preview' : ''}</small></div><div className="next-task-actions"><Link to={item.route} className="text-link" aria-label={`Open ${item.title}`}>Open <Icon name="arrow" size={13}/></Link><button className="task-status-button" disabled={saving} onClick={() => changeStatus(item.id, item.status === 'in_progress' ? 'completed' : 'in_progress')}>{item.status === 'in_progress' ? 'Mark complete' : 'Start task'}</button></div></article>)}</div> : <div className="progress-inline-empty">Everything in your current roadmap is complete. Ask your mentor to plan your next milestone.</div>}
        <Link className="mentor-next-link" to={mentorUrl(nextSteps[0] ? `Why is “${nextSteps[0].title}” my next step? Use my profile and roadmap progress to explain.` : 'Update my roadmap for my current career goal.')}>Ask the AI mentor about your next step <Icon name="arrow" size={14}/></Link>
      </section>

      <section className="panel current-goals-panel"><div className="panel-heading"><div><span className="section-kicker">YOUR DIRECTION</span><h2>Goals &amp; milestones</h2></div><Link to="/profile" className="profile-edit-link" aria-label="Edit profile"><Icon name="file" size={16}/>Edit <Icon name="arrow" size={13}/></Link></div>
        <div className="goal-row"><span>CAREER GOAL</span><b>{profile?.careerGoals || 'Add a goal to shape your recommendations.'}</b></div>
        <div className="goal-row"><span>INTERESTS &amp; SKILLS</span><b>{[profile?.interests, ...(profile?.skills || [])].filter(Boolean).join(' · ') || 'Add interests or skills to personalize tasks.'}</b></div>
        <div className="milestone-heading">Upcoming milestones</div>
        {!hasRoadmap ? <p className="milestone-placeholder">Your roadmap milestones appear after you create a plan.</p> : <div className="upcoming-milestones">{roadmapStages.map(stage => ({ stage, state: stageStatus(stage, tasks, profile || {}) })).filter(({ stage, state }) => tasks.some(item => item.stageYear === stage.year && item.status !== 'completed') && (!profile?.year || state === 'current' || state === 'upcoming' || state === 'in_progress')).slice(0, 3).map(({ stage, state }) => <div key={stage.id}><i className={state === 'completed' ? 'complete-dot' : 'pending-dot'}/><span><b>{stage.title}</b><small>{state === 'current' || state === 'in_progress' ? 'Current milestone' : 'Upcoming milestone'}</small></span></div>)}</div>}
      </section>
    </div>

    {hasRoadmap && <section className="panel roadmap-task-panel"><div className="panel-heading"><div><span className="section-kicker">ROADMAP TASKS</span><h2>All tasks</h2></div><span className="task-total-label">{tasks.length} planned</span></div>
      <div className="roadmap-task-list">{tasks.map(item => <article className={`roadmap-task ${item.status}`} key={item.id}><span className={`task-state-mark ${item.status}`}>{item.status === 'completed' ? '✓' : item.status === 'in_progress' ? '↗' : '○'}</span><div className="roadmap-task-copy"><b>{item.title}</b><p>{item.description}</p><small>{item.domainName || 'Student action'} · {roadmapStages[item.stageYear - 1]?.title} · {statusLabel[item.status]}{item.domainStatus !== 'ready' ? ' · planned preview' : ''}</small><small>{item.reason}</small>{item.completionCriteria && <small>Done when: {item.completionCriteria}</small>}</div><div className="roadmap-task-controls"><Link to={item.route || '/domains'} className="text-link">{item.status === 'in_progress' ? 'Resume' : 'Open'} <Icon name="arrow" size={13}/></Link>{item.status === 'pending' && <button disabled={saving} onClick={() => changeStatus(item.id, 'in_progress')}>Start</button>}{item.status === 'in_progress' ? <button disabled={saving} onClick={() => changeStatus(item.id, 'completed')}>Mark complete</button> : item.status === 'completed' ? <button className="reopen-task" disabled={saving} onClick={() => changeStatus(item.id, 'pending')}>Reopen</button> : <button disabled={saving} onClick={() => changeStatus(item.id, 'completed')}>Mark complete</button>}</div></article>)}</div>
    </section>}
  </>;
}
