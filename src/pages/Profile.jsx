import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProfileQuestionSequence, isAnswered, profileQuestionProgress, profileQuestions } from '../data/profileQuestions';
import { buildStarterRoadmap, taskPlanSignature } from '../data/progress';

const emptyProfile = { degree: '', branch: '', year: '', skills: [], interests: '', careerGoals: '' };
const goalLabels = { exploring: 'Exploring options', placements: 'Preparing for placements', internships: 'Finding an internship', 'higher-studies': 'Higher studies or scholarships', 'competitive-exams': 'Competitive exams', projects: 'Building a project' };

export default function Profile({ profile, saveProfile, profileLoading = false, profileError = null, user = null, secureStorage = false }) {
  const [form, setForm] = useState({ ...emptyProfile, ...profile });
  const [editing, setEditing] = useState(false);
  const [activeKey, setActiveKey] = useState(() => getProfileQuestionSequence(profile || {})[0]?.key || null);
  const hydrated = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const sequence = useMemo(() => getProfileQuestionSequence(form, { editing }), [form, editing]);
  const progress = profileQuestionProgress(form, sequence);
  const question = profileQuestions.find(item => item.key === activeKey) || sequence[0];
  const complete = Boolean(profile?.complete) && !editing;

  useEffect(() => {
    if (profileLoading || hydrated.current) return;
    hydrated.current = true;
    const nextForm = profile ? { ...emptyProfile, ...profile } : { ...emptyProfile };
    setForm(nextForm);
    setActiveKey(getProfileQuestionSequence(nextForm)[0]?.key || null);
  }, [profile, profileLoading]);

  function change(key, value) {
    setForm(current => ({ ...current, [key]: value }));
    setError('');
  }

  async function saveStep(nextForm) {
    if (secureStorage && !user) throw new Error('Sign in to save your profile securely.');
    await saveProfile({ ...nextForm, complete: false });
  }

  async function finishProfile(nextForm) {
    const tasks = buildStarterRoadmap(nextForm, nextForm.progressTasks || []);
    const planUpdates = tasks.length ? { progressTasks: tasks, progressPlanSignature: taskPlanSignature(nextForm) } : {};
    await saveProfile({ ...nextForm, ...planUpdates, complete: true, onboardingCompletedAt: new Date().toISOString() });
    setEditing(false);
  }

  async function continueQuestion() {
    if (!question) return;
    if (question.required && !isAnswered(question, form)) {
      setError(question.key === 'branch' ? 'Add your branch to continue.' : 'Please answer this question to continue.');
      return;
    }
    setSaving(true); setError('');
    try {
      await saveStep(form);
      const eligible = getProfileQuestionSequence(form, { editing });
      const position = eligible.findIndex(item => item.key === question.key);
      const next = editing ? eligible[position + 1] : eligible.find(item => item.key !== question.key && !isAnswered(item, form));
      if (next) setActiveKey(next.key);
      else {
        await finishProfile(form);
      }
    } catch (issue) {
      setError(issue.message || 'Your profile could not be saved. Please try again.');
    } finally { setSaving(false); }
  }

  async function skipQuestion() {
    if (!question?.optional) return;
    const skippedQuestions = [...new Set([...(form.skippedQuestions || []), question.key])];
    const nextForm = { ...form, skippedQuestions };
    if (question.key === 'supportConsent') nextForm.supportConsent = false;
    setForm(nextForm); setSaving(true); setError('');
    try {
      await saveStep(nextForm);
      const eligible = getProfileQuestionSequence(nextForm, { editing });
      const position = eligible.findIndex(item => item.key === question.key);
      const next = editing ? eligible[position + 1] : eligible.find(item => item.key !== question.key);
      if (next) setActiveKey(next.key);
      else {
        await finishProfile(nextForm);
      }
    } catch (issue) { setError(issue.message || 'Your profile could not be saved. Please try again.'); }
    finally { setSaving(false); }
  }

  function beginEditing() {
    const eligible = getProfileQuestionSequence(form, { editing: true });
    setEditing(true); setActiveKey(eligible[0]?.key || null); setError('');
  }

  const answeredCount = Math.min(progress.total, progress.completed);
  const currentOrdinal = question ? profileQuestions.findIndex(item => item.key === question.key) + 1 : 0;
  const currentPercent = question ? Math.round((currentOrdinal / profileQuestions.length) * 100) : (progress.requiredComplete ? 100 : 0);
  const persistedLabel = secureStorage ? (user ? 'Your profile is saved to your Supabase account.' : 'Sign in to save your profile securely to Supabase.') : 'Demo mode: your profile is saved only in this browser.';

  return <div className="page profile-page">
    <div className="breadcrumb"><Link to="/">Home</Link><span> / </span>Student profile <span>·</span> <Link to="/account">Account Center</Link></div>
    <div className="questionnaire-layout">
      <section className="questionnaire-intro">
        <div className="eyebrow"><span className="sparkle">✳</span> YOUR STUDENT PROFILE</div>
        <h1>Guidance that<br/><em>fits your goals.</em></h1>
        <p>A few focused questions help your mentor recommend relevant domains and practical next steps. Skip anything optional and update your answers any time.</p>
        <div className="privacy-inline">{persistedLabel}<br/><Link className="profile-cta-inline" to="/account">{user ? 'Manage account and security' : 'Open Account Center'} ↗</Link></div>
      </section>
      <section className="questionnaire" aria-live="polite">
        {complete ? <>
          <div className="progress-meta"><span>PROFILE COMPLETE</span><span>{answeredCount} DETAILS</span></div>
          <div className="progress-track"><span style={{ width: '100%' }}/></div>
          <div className="question-title"><h2>Your guidance is ready</h2><p>These details shape your roadmap. You can revisit any answer whenever your goals change.</p></div>
          <div className="profile-summary">
            <div><small>STUDY</small><b>{[form.degree, form.branch, form.year && `${form.year}${form.semester ? ` · semester ${form.semester}` : ''}`].filter(Boolean).join(' · ') || 'Add study details'}</b></div>
            <div><small>SKILLS &amp; EXPERIENCE</small><b>{[...(form.skills || []), form.programmingExperience, form.projectsExperience].filter(Boolean).join(' · ') || 'To be explored'}</b></div>
            <div><small>INTERESTS &amp; DIRECTION</small><b>{[form.interests, goalLabels[form.goalType], form.careerGoals].filter(Boolean).join(' · ') || 'To be explored'}</b></div>
            <div><small>LEARNING PLAN</small><b>{[form.availableTime, form.learningPreference].filter(Boolean).join(' · ') || 'Flexible'}</b></div>
            {form.supportConsent && form.supportNeeds && <div><small>REQUESTED SUPPORT</small><b>{form.supportNeeds}</b></div>}
            <div className="form-submit"><Link to="/progress" className="button-primary">See my action plan <span>↗</span></Link><button className="button-quiet" onClick={beginEditing}>Edit profile</button></div>
          </div>
        </> : question ? <>
          <div className="progress-meta"><span>{editing ? 'EDIT PROFILE' : 'YOUR PROFILE'} <i>·</i> STEP {String(currentOrdinal).padStart(2, '0')} <i>/</i> {String(profileQuestions.length).padStart(2, '0')}</span><span>{currentPercent}%</span></div>
          <div className="progress-track"><span style={{ width: `${currentPercent}%` }}/></div>
          <div className="question-title"><h2>{question.title}</h2><p>{question.subtitle}</p></div>
          {question.type === 'select' && <label className="field-label">{question.key === 'degree' ? 'Degree' : question.key === 'year' ? 'Current year' : question.key === 'semester' ? 'Semester' : question.key === 'goalType' ? 'Main goal' : question.key === 'availableTime' ? 'Weekly time' : question.key === 'learningPreference' ? 'Learning preference' : 'Experience'}
            <select autoFocus value={form[question.key] || ''} onChange={event => { const index = question.options.indexOf(event.target.value); change(question.key, question.values?.[index] || event.target.value); }}>
              <option value="">Choose an option</option>{question.options.map((option, index) => <option key={option} value={question.values?.[index] || option}>{option}</option>)}
            </select>
          </label>}
          {question.type === 'text' && <label className="field-label">Branch<input autoFocus value={form[question.key] || ''} onChange={event => change(question.key, event.target.value)} placeholder={question.placeholder}/></label>}
          {question.type === 'textarea' && <label className="field-label">Your answer<textarea autoFocus rows="4" value={form[question.key] || ''} onChange={event => change(question.key, event.target.value)} placeholder={question.placeholder}/></label>}
          {question.type === 'multi' && <div className="skill-options">{question.options.map(skill => <button type="button" className={(form.skills || []).includes(skill) ? 'selected' : ''} onClick={() => change('skills', (form.skills || []).includes(skill) ? form.skills.filter(item => item !== skill) : [...(form.skills || []), skill])} key={skill}>{skill}<span>{(form.skills || []).includes(skill) ? '✓' : '+'}</span></button>)}</div>}
          {question.type === 'consent' && <div className="support-consent"><p>Your answer is optional and will be stored with your profile so the mentor can adapt its suggestions.</p><button className={form.supportConsent === true ? 'selected' : ''} onClick={() => { change('supportConsent', true); change('supportNeeds', ''); }}>Yes, I would like to share</button><button className={form.supportConsent === false ? 'selected' : ''} onClick={() => { change('supportConsent', false); change('supportNeeds', ''); }}>No, skip this</button></div>}
          {(error || profileError) && <p role="alert" className="form-error">{error || profileError}</p>}
          {profileLoading && <p className="profile-save-note" role="status">Loading your saved profile…</p>}
          <div className="question-actions">
            {currentOrdinal > 1 ? <button className="button-quiet" onClick={() => setActiveKey(profileQuestions.filter(item => !item.sensitive || form.supportConsent === true)[currentOrdinal - 2]?.key)}>← Back</button> : <Link to="/" className="button-quiet">Not now</Link>}
            <div className="action-right">{question.optional && <button className="button-quiet" disabled={saving} onClick={skipQuestion}>Skip</button>}<button className="button-primary" disabled={saving || profileLoading || (secureStorage && !user)} onClick={continueQuestion}>{saving ? 'Saving…' : 'Continue'} <span>→</span></button></div>
          </div>
          {secureStorage && !user && <p className="profile-save-note">{persistedLabel} <Link to="/account">Sign in</Link></p>}
        </> : <>
          <div className="progress-meta"><span>PROFILE READY</span><span>100%</span></div><div className="progress-track"><span style={{ width: '100%' }}/></div>
          <div className="question-title"><h2>All set</h2><p>Your profile has the required study details. You can edit or add more context at any time.</p></div>
          <div className="form-submit"><button className="button-primary" disabled={saving || (secureStorage && !user)} onClick={async () => { setSaving(true); setError(''); try { await finishProfile(form); } catch (issue) { setError(issue.message || 'Your profile could not be saved.'); } finally { setSaving(false); } }}>{saving ? 'Saving…' : 'Finish profile'} ↗</button><button className="button-quiet" onClick={beginEditing}>Edit profile</button></div>
          {(error || profileError) && <p role="alert" className="form-error">{error || profileError}</p>}
        </>}
      </section>
    </div>
    <footer className="site-footer"><span><b>Smart Engineer AI<span className="brand-dot">.</span></b> &nbsp;From Confused Student to Placed Engineer.</span><span>YOUR PROFILE CAN BE EDITED AT ANY TIME. &nbsp;✳</span></footer>
  </div>;
}
