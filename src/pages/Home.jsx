import { Link, useLocation } from 'react-router-dom';
import { Assistant } from '../components/Assistant';
import { Icon } from '../components/Icon';
import { DomainCard } from '../components/DomainCard';
import { enabledDomains, recommendDomains, reasonFor } from '../data/domains';
import { careerStages, studentModules } from '../data/studentModules';

function ModuleCard({ module, index }) {
  return <Link className={`module-card accent-${module.accent}`} to={module.route} style={{ '--card-index': index }}>
    <span className="module-icon"><Icon name={module.icon} size={20}/></span>
    <span className="module-copy"><b>{module.title}</b><small>{module.description}</small></span>
    <span className="module-link"><span>Explore</span><Icon name="arrow" size={15}/></span>
  </Link>;
}

function RecommendedAction({ profile }) {
  if (!profile?.complete) return <section className="focus-card focus-card-blue">
    <span className="focus-icon"><Icon name="spark" size={19}/></span>
    <div className="focus-content"><span className="section-kicker">A GOOD PLACE TO BEGIN</span><h3>Give your guidance a little context</h3><p>A short profile helps connect your studies, interests and goals with the right starting point.</p><Link className="button-primary" to="/profile">Complete your profile <Icon name="arrow" size={15}/></Link></div>
  </section>;
  const suggestion = recommendDomains('', profile)[0];
  if (!suggestion) return null;
  return <section className="focus-card focus-card-blue">
    <span className="focus-icon"><Icon name="spark" size={19}/></span>
    <div className="focus-content"><span className="section-kicker">PROFILE-BASED DEMO SUGGESTION</span><h3>Your next step could start with {suggestion.name}</h3><p>{reasonFor(suggestion, profile)}</p><Link className="button-primary" to={suggestion.route}>Explore this area <Icon name="arrow" size={15}/></Link></div>
  </section>;
}

function Roadmap() {
  return <section className="panel roadmap-panel">
    <div className="panel-heading"><div><span className="section-kicker">YOUR CAREER ROADMAP</span><h2>One step at a time</h2></div><Link className="text-link" to="/domains/career">Open Career Navigator <Icon name="arrow" size={14}/></Link></div>
    <p className="panel-lede">A suggested B.Tech journey. Your personal progress will appear when activity tracking is connected.</p>
    <div className="roadmap-track">{careerStages.map((stage, index) => <div className="roadmap-step" key={stage.year}>
      <div className="roadmap-marker"><span>{String(index + 1).padStart(2, '0')}</span></div>
      <div className="roadmap-year">{stage.year}</div><h3>{stage.title}</h3><p>{stage.detail}</p>
    </div>)}</div>
    <div className="roadmap-footer"><span className="status-dot"/> Suggested path · Not a live progress tracker</div>
  </section>;
}

function ProgressPanel() {
  return <section className="panel progress-panel">
    <div className="panel-heading"><div><span className="section-kicker">SKILL PROGRESS</span><h2>Your growth, as it happens</h2></div><span className="panel-icon"><Icon name="layers" size={18}/></span></div>
    <div className="empty-progress"><span className="empty-progress-icon"><Icon name="check" size={18}/></span><div><b>No learning activity yet</b><p>Skills and milestones will appear here once your activity can be saved.</p></div></div>
    <Link className="inline-link" to="/domains/skill-job-analysis">Explore the Skills Hub <Icon name="arrow" size={14}/></Link>
  </section>;
}

function MilestonesPanel() {
  return <section className="panel milestone-panel">
    <div className="panel-heading"><div><span className="section-kicker">LEARNING MILESTONES</span><h2>Keep your momentum</h2></div><span className="panel-icon violet"><Icon name="spark" size={18}/></span></div>
    <div className="milestone-empty"><span>No milestones saved yet.</span><p>Start with a skill, project or career goal and your next steps can live here.</p><Link to="/profile" className="text-link">Review your profile <Icon name="arrow" size={14}/></Link></div>
  </section>;
}

export default function Home({ profile }) {
  const location = useLocation();
  const mentorPrompt = new URLSearchParams(location.search).get('mentorPrompt') || '';
  const firstName = profile?.name?.trim()?.split(/\s+/)[0];
  const featured = enabledDomains().slice(0, 3);
  return <div className="page dashboard-page">
    <section className="welcome-row">
      <div><div className="eyebrow"><span className="welcome-spark"><Icon name="spark" size={15}/></span> SMART ENGINEER AI <span className="eyebrow-divider">/</span> YOUR STUDENT GROWTH HUB</div>
        <h1>{firstName ? `Welcome back, ${firstName}.` : 'Build your future, engineer.'}</h1>
        <p className="welcome-copy">From Confused Student to Placed Engineer</p>
      </div>
      <Link to="/profile" className="profile-action"><span className="profile-action-avatar">{firstName?.[0]?.toUpperCase() || 'S'}</span><span><b>{firstName || 'Your profile'}</b><small>{profile?.branch || 'Add your study details'}</small></span><Icon name="chevron" size={16}/></Link>
    </section>

      <section className="assistant-section"><div className="assistant-section-heading"><div><span className="section-kicker">YOUR AI COMPANION</span><h2>What are we working on today?</h2><p>Ask about careers, skills, exams or placements.</p></div><span className="assistant-status"><i/> Mentor API</span></div><Assistant profile={profile} progressTasks={profile?.progressTasks||[]} initialPrompt={mentorPrompt} className="dashboard-assistant"/></section>

    <section className="modules-section">
      <div className="section-heading"><div><span className="section-kicker">YOUR STUDENT TOOLKIT</span><h2>Explore your growth modules</h2></div><Link className="text-link" to="/domains">All {enabledDomains().length} domains <Icon name="arrow" size={14}/></Link></div>
      <div className="module-grid">{studentModules.map((module, index) => <ModuleCard key={module.id} module={module} index={index}/>)}</div>
    </section>

    <section className="journey-grid"><Roadmap/><RecommendedAction profile={profile}/></section>
    <section className="progress-grid"><ProgressPanel/><MilestonesPanel/></section>

    <section className="domains-section"><div className="section-heading"><div><span className="section-kicker">DOMAIN DIRECTORY</span><h2>More ways to move forward</h2></div><Link className="text-link" to="/domains">Browse all domains <Icon name="arrow" size={14}/></Link></div>
      <div className="domain-grid">{featured.map((domain, index) => <DomainCard domain={domain} index={index} key={domain.id}/>)}</div>
      <p className="catalog-note">Domain entries are previews until their dedicated experiences are connected.</p>
    </section>
    <footer className="site-footer"><span><b>Smart Engineer AI</b> &nbsp;Guidance for your next step.</span><span>DEMO GUIDANCE · CHECK OFFICIAL SOURCES FOR CURRENT FACTS</span></footer>
  </div>;
}
