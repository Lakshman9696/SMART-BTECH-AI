import { Link, NavLink, useLocation } from 'react-router-dom';
import { Icon } from './Icon';

const navItems = [
  { to:'/', label:'Dashboard', icon:'grid', end:true },
  { to:'/domains', label:'All Domains', icon:'layers' },
  { to:'/progress', label:'My Progress', icon:'user' },
];

export function Logo() {
  return <Link className="brand" to="/" aria-label="Smart Engineer AI home"><span className="brand-mark"><Icon name="spark" size={19}/></span><span className="brand-type"><b>Smart Engineer</b><small>AI · STUDENT GROWTH HUB</small></span></Link>;
}

export function Sidebar({ profile }) {
  const location=useLocation();
  return <aside className="sidebar">
    <Logo/>
    <div className="side-label">WORKSPACE</div>
    <nav className="side-nav" aria-label="Main navigation">{navItems.map((item) => {const selected=location.pathname==='/profile'||location.pathname==='/account'?item.to==='/progress':undefined;return <NavLink key={item.to} to={item.to} end={item.end} title={item.label} className={({isActive})=>selected===undefined?(isActive?'active':''):(selected?'active':'')}><Icon name={item.icon} size={18}/><span>{item.label}</span></NavLink>})}</nav>
    <div className="side-divider"/>
    <div className="sidebar-spacer"/>
    <div className="sidebar-note"><span className="note-icon"><Icon name="spark" size={16}/></span><b>One step at a time</b><p>Keep learning. Keep building. Find your direction.</p></div>
  </aside>;
}

export function Header({ profile }) {
  return <header className="topbar"><div className="mobile-brand"><Logo/></div><div className="topbar-label"><Icon name="spark" size={15}/> Your B.Tech journey</div><div className="topbar-actions"><Link className="ask-ai-link" to="/#assistant"><Icon name="spark" size={16}/> Ask AI</Link><Link to="/progress" className="top-avatar" aria-label="Open progress and profile">{profile?.name?.[0]?.toUpperCase() || 'S'}</Link></div></header>;
}
