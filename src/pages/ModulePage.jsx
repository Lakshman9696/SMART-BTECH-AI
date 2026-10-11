import { Link, useParams } from 'react-router-dom';
import { Assistant } from '../components/Assistant';
import { Icon } from '../components/Icon';
import { getDomain } from '../data/domains';
import { careerStages, studentModules } from '../data/studentModules';

export default function ModulePage({ profile }) {
  const { moduleId } = useParams();
  const module = studentModules.find((item) => item.id === moduleId);
  if (!module) return <div className="page"><section className="panel empty-state"><h1>Module not found</h1><p>That student growth module is not available.</p><Link className="button-primary" to="/">Back to dashboard <Icon name="arrow" size={15}/></Link></section></div>;
  const domain = getDomain(module.domainId);
  const hasRoadmap = module.id === 'internship-placement';

  return <div className="page module-page">
    <div className="breadcrumb"><Link to="/">Dashboard</Link><span>/</span>{module.title}</div>
    <section className={`module-hero accent-${module.accent}`}>
      <div className="module-hero-icon"><Icon name={module.icon} size={24}/></div>
      <div className="module-hero-copy"><span className="section-kicker">STUDENT GROWTH MODULE <span className="demo-pill">PREVIEW</span></span><h1>{module.title}</h1><p>{module.description}</p></div>
      <Link className="back-link" to="/domains">Browse domains <Icon name="arrow" size={14}/></Link>
    </section>
    {hasRoadmap && <section className="panel roadmap-panel module-roadmap">
      <div className="panel-heading"><div><span className="section-kicker">SUGGESTED JOURNEY</span><h2>Prepare for opportunities year by year</h2></div></div>
      <p className="panel-lede">A general guide from the project plan. It does not track completed activity.</p>
      <div className="roadmap-track">{careerStages.map((stage, index) => <div className="roadmap-step" key={stage.year}><div className="roadmap-marker"><span>{String(index + 1).padStart(2, '0')}</span></div><div className="roadmap-year">{stage.year}</div><h3>{stage.title}</h3><p>{stage.detail}</p></div>)}</div>
    </section>}
    <div className="module-content-grid">
      <section className="panel module-empty-panel">
        <div className="panel-heading"><div><span className="section-kicker">WORKSPACE</span><h2>Ready when the module is connected</h2></div><span className="panel-icon"><Icon name={module.icon} size={18}/></span></div>
        <div className="empty-workspace"><span className={`module-icon accent-${module.accent}`}><Icon name={module.icon} size={20}/></span><div><b>{module.next}</b><p>This preview does not contain saved module data or a connected backend service.</p></div></div>
        {domain && <Link className="inline-link" to={domain.route}>View the related domain preview <Icon name="arrow" size={14}/></Link>}
      </section>
      <section className="module-assistant"><div className="section-heading"><div><span className="section-kicker">NEED A STARTING POINT?</span><h2>Ask your AI companion</h2></div></div><Assistant profile={profile} initialPrompt={`Help me get started with ${module.title.toLowerCase()}.`}/></section>
    </div>
    <footer className="site-footer"><span><b>Smart Engineer AI</b> &nbsp;From Confused Student to Placed Engineer.</span><span>MODULE PREVIEW · LIVE DATA NOT CONNECTED</span></footer>
  </div>;
}
