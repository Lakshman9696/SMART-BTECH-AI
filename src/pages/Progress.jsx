import { Link } from 'react-router-dom';
import { Icon } from '../components/Icon';
import ProgressDashboard from '../components/ProgressDashboard';

export default function Progress({ profile, saveProfile, profileLoading = false, profileError = '', user, secureStorage }) {
 const hasProfile = Boolean(profile?.complete);
 return <div className="page progress-page">
  <div className="breadcrumb"><Link to="/">Dashboard</Link><span> / </span>My Progress</div>
  <section className="progress-welcome"><div><div className="eyebrow"><Icon name="user" size={14}/> STUDENT SPACE</div><h1>Your progress &amp; next steps</h1><p>Build a plan around your goals, then track work you actually complete.</p></div><Link className="button-primary" to="/profile">{hasProfile ? 'Edit profile' : 'Set up profile'} <Icon name="arrow" size={15}/></Link></section>
  <section className="progress-profile panel"><div className="progress-profile-avatar">{profile?.name?.[0]?.toUpperCase() || 'S'}</div><div className="progress-profile-content"><span className="section-kicker">STUDENT PROFILE</span><h2>{profile?.name || 'Your student profile'}</h2><p>{hasProfile ? [profile.degree, profile.branch, profile.year].filter(Boolean).join(' · ') : 'Add your study details, interests and goals to personalize your roadmap.'}</p>{hasProfile && <div className="profile-tags">{(profile.skills || []).map(skill => <span key={skill}>{skill}</span>)}{profile.careerGoals && <span>Goal: {profile.careerGoals}</span>}</div>}</div><Link className="profile-edit-link" to="/profile" aria-label="Edit profile"><Icon name="file" size={17}/><span>Edit</span><Icon name="arrow" size={14}/></Link></section>
  {profileError && <p className="form-error" role="alert">{profileError}</p>}
  {profileLoading ? <section className="panel progress-loading" role="status">Loading your saved profile and roadmap…</section> : <ProgressDashboard profile={profile} saveProfile={saveProfile} profileLoading={profileLoading} user={user} secureStorage={secureStorage}/>}
  <section className="account-entry"><div><span className="section-kicker">ACCOUNT &amp; SECURITY</span><b>{user?.email || 'Manage your sign-in and saved profile'}</b><small>{user ? 'Your profile and roadmap tasks are saved to your account.' : 'Sign in to save your progress securely across devices.'}</small></div><Link to="/account">Open Account Center <Icon name="arrow" size={14}/></Link></section>
  <footer className="site-footer"><span><b>Smart Engineer AI</b> &nbsp;Your learning journey.</span><span>COMPLETION IS CALCULATED FROM YOUR TASK STATUSES</span></footer>
 </div>;
}
