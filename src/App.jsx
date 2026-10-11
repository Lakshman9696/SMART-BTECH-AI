import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { domains } from './data/domains';
import { useProfile } from './data/profile';
import { Sidebar, Header } from './components/Layout';
import { getDomainModule } from './domains';
import Home from './pages/Home';
import Profile from './pages/Profile';
import { DomainsPage, DomainPage } from './pages/Domains';
import ModulePage from './pages/ModulePage';
import { useAuth } from './data/auth';
import Account from './pages/Account';
import Progress from './pages/Progress';

export default function App() {
  const auth = useAuth();
  const { profile, saveProfile, loading, error } = useProfile(auth.user?.id);
  const location = useLocation();

  return <div className="app-shell">
    <Sidebar profile={profile}/>
    <main className="main-area">
      <Header profile={profile}/>
      <Routes location={location}>
        <Route path="/" element={<Home profile={profile} saveProfile={saveProfile} profileLoading={loading} user={auth.user} secureStorage={auth.configured}/>}/>
        <Route path="/progress" element={<Progress profile={profile} saveProfile={saveProfile} profileLoading={loading} user={auth.user} secureStorage={auth.configured} profileError={error}/>}/>
        <Route path="/profile" element={<Profile key={auth.user?.id || 'local-profile'} profile={profile} saveProfile={saveProfile} profileLoading={loading} profileError={error} user={auth.user} secureStorage={auth.configured}/>}/>
        <Route path="/account" element={<Account user={auth.user} authLoading={auth.loading}/>}/>
        <Route path="/domains" element={<DomainsPage/>}/>
        <Route path="/modules/:moduleId" element={<ModulePage profile={profile}/>}/>
        {domains.map(domain => {
          const Module = domain.enabled ? getDomainModule(domain.id) : null;
          const page = Module
            ? <Module profile={profile} domain={domain}/>
            : <DomainPage profile={profile} domainId={domain.id} progressTasks={profile?.progressTasks || []}/>;
          return <Route key={domain.id} path={domain.route} element={page}/>;
        })}
        <Route path="*" element={<Navigate to="/" replace/>}/>
      </Routes>
    </main>
  </div>;
}

