import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, supabaseConfigured } from '../lib/supabase';
import { Icon } from '../components/Icon';

const MIN_PASSWORD_LENGTH = 8;

export default function Account({ user, authLoading }) {
  const [mode, setMode] = useState(() => window.location.hash.includes('type=recovery') ? 'recovery' : user ? 'signed-in' : 'signin');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const changeMode = next => {
    setMode(next);
    setMessage('');
    setError('');
    setPassword('');
    setOtp('');
  };

  async function sendCode() {
    if (!supabaseConfigured) throw new Error('Connect Supabase to enable secure email sign-in.');
    const { error: requestError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false },
    });
    if (requestError) throw requestError;
    setMode('verify');
    setMessage(`We sent a sign-in code to ${email.trim()}.`);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');
    setBusy(true);
    try {
      if (mode === 'signin') {
        if (!email.trim()) throw new Error('Enter your email address.');
        await sendCode();
      } else if (mode === 'verify') {
        if (!/^\d{6}$/.test(otp.trim())) throw new Error('Enter the 6-digit code from your email.');
        const { error: verifyError } = await supabase.auth.verifyOtp({ email: email.trim(), token: otp.trim(), type: 'email' });
        if (verifyError) throw verifyError;
        setMessage('Email verified. You are signed in.');
      } else if (mode === 'signup') {
        if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`Choose a password with at least ${MIN_PASSWORD_LENGTH} characters.`);
        const { error: signUpError } = await supabase.auth.signUp({ email: email.trim(), password });
        if (signUpError) throw signUpError;
        setMessage('Check your email to confirm your account. After confirmation, sign in with an email code.');
      } else if (mode === 'reset') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/account` });
        if (resetError) throw resetError;
        setMessage('If an account exists for this email, a password reset link is on its way.');
      } else if (mode === 'recovery') {
        if (password.length < MIN_PASSWORD_LENGTH) throw new Error(`Choose a password with at least ${MIN_PASSWORD_LENGTH} characters.`);
        const { error: updateError } = await supabase.auth.updateUser({ password });
        if (updateError) throw updateError;
        setMessage('Your password has been updated.');
        setMode('signed-in');
      }
    } catch (submitError) {
      setError(submitError.message || 'We could not complete that request. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    setBusy(true);
    setError('');
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      changeMode('signin');
    } catch (signOutError) {
      setError(signOutError.message || 'Could not sign out.');
    } finally {
      setBusy(false);
    }
  }

  const needsPassword = mode === 'signup' || mode === 'recovery';
  const heading = ({ signin: 'Welcome back', verify: 'Check your email', signup: 'Create your account', reset: 'Reset your password', recovery: 'Choose a new password', 'signed-in': 'Your account' })[mode];

  return <section className="account-page">
    <div className="account-layout">
      <div className="account-intro">
        <span className="section-kicker">ACCOUNT CENTER</span>
        <h1>Your student space, <em>kept secure.</em></h1>
        <p>Sign in to save your profile and roadmap, and pick up where you left off on any device.</p>
        <div className="account-trust"><span><Icon name="lock" size={17}/></span><div><b>Private by design</b><small>Your profile and progress are tied to your own Supabase account.</small></div></div>
      </div>
      <div className="account-panel">
        <span className={`account-state-icon ${user ? 'secure' : ''}`}><Icon name={user ? 'check' : 'user'} size={20}/></span>
        <span className="section-kicker">{supabaseConfigured ? 'SECURE ACCOUNT ACCESS' : 'DEVELOPMENT MODE'}</span>
        <h2>{authLoading ? 'Checking your account…' : heading}</h2>
        {!supabaseConfigured && <div className="account-notice"><b>Supabase is not connected yet</b><span>Add your Supabase project URL and publishable key to <code>.env.local</code>, then restart the app to enable account access.</span></div>}

        {user && mode !== 'recovery' ? <>
          <p>Your account is active. Your saved student profile and roadmap are associated with this account.</p>
          <div className="account-identity"><span className="account-avatar">{user.email?.[0]?.toUpperCase() || 'S'}</span><span><small>SIGNED IN AS</small><b>{user.email}</b></span><span className="security-badge">Verified</span></div>
          {error && <p className="account-success" role="alert">{error}</p>}
          {message && <p className="account-success" role="status">{message}</p>}
          <div className="account-actions"><button className="button-quiet" disabled={busy} onClick={signOut}>{busy ? 'Signing out…' : 'Sign out'}</button><Link className="text-link" to="/profile">View student profile <Icon name="arrow" size={13}/></Link></div>
        </> : <>
          <p>{mode === 'signin' ? 'We’ll email you a one-time code each time you sign in.' : mode === 'verify' ? `Enter the 6-digit code sent to ${email}.` : mode === 'signup' ? 'Create an account to save your progress. You’ll confirm your email before signing in.' : mode === 'reset' ? 'We’ll send a secure password reset link if this email has an account.' : 'Set a new password for your account.'}</p>
          {error && <p className="account-success" role="alert" style={{ color: '#b44444', background: '#fff1f0' }}>{error}</p>}
          {message && <p className="account-success" role="status">{message}</p>}
          <form className="account-form" onSubmit={handleSubmit}>
            {mode !== 'verify' && <label className="field-label">Email address<input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required disabled={busy || mode === 'recovery'}/></label>}
            {mode === 'verify' && <label className="field-label">6-digit email code<input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={otp} onChange={event => setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000" required disabled={busy} autoFocus/></label>}
            {needsPassword && <label className="field-label">New password<input type="password" autoComplete={mode === 'signup' ? 'new-password' : 'new-password'} minLength={MIN_PASSWORD_LENGTH} value={password} onChange={event => setPassword(event.target.value)} placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`} required disabled={busy}/></label>}
            <button className="button-primary account-submit" type="submit" disabled={busy || authLoading || !supabaseConfigured}>{busy ? 'Please wait…' : mode === 'signin' ? 'Email me a sign-in code' : mode === 'verify' ? 'Verify code and sign in' : mode === 'signup' ? 'Create account' : mode === 'reset' ? 'Send reset link' : 'Update password'} <Icon name="arrow" size={14}/></button>
          </form>
          <div className="account-switches">
            {mode === 'signin' && <><button onClick={() => changeMode('signup')}>Create an account</button><button onClick={() => changeMode('reset')}>Forgot password?</button></>}
            {mode === 'verify' && <><button disabled={busy} onClick={async () => { setBusy(true); setError(''); setMessage(''); try { await sendCode(); } catch (e) { setError(e.message || 'Could not resend the code.'); } finally { setBusy(false); } }}>Resend code</button><button onClick={() => changeMode('signin')}>Use another email</button></>}
            {(mode === 'signup' || mode === 'reset') && <button onClick={() => changeMode('signin')}>Back to sign in</button>}
            {mode === 'recovery' && <button onClick={() => changeMode('signin')}>Back to account</button>}
          </div>
          {needsPassword && <p className="account-help">Use at least 8 characters. Sign-in itself uses a one-time email code.</p>}
          {mode === 'verify' && <p className="account-help">Codes are delivered by Supabase Auth. If the email contains a link instead, enable the OTP email template in Supabase.</p>}
        </>}
      </div>
    </div>
  </section>;
}
