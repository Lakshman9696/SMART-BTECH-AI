import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getDomain, reasonFor } from '../data/domains';
import { getMentorStatus, sendMentorMessage } from '../services/mentorApi';
import { Icon } from './Icon';

const prompts = ['Plan my career path', 'What skills should I learn?', 'Prepare me for interviews'];
const markdownComponents = {
  a: ({ href, children, ...props }) => <a {...props} href={href} target="_blank" rel="noopener noreferrer">{children}</a>,
};
export function Assistant({ profile, progressTasks = [], initialPrompt = '', className = '' }) {
  const [input, setInput] = useState(initialPrompt), [messages, setMessages] = useState([]), [busy, setBusy] = useState(false);
  const [status, setStatus] = useState({ available: false, configured: false });
  const busyRef = useRef(false), historyRef = useRef([]);
  useEffect(() => { getMentorStatus().then(setStatus); }, []);

  async function send(text = input) {
    if (!text.trim() || busyRef.current) return;
    const userText = text.trim();
    const userMessage = { role: 'user', text: userText };
    const prior = historyRef.current;
    const next = [...prior, userMessage];
    setInput(''); setMessages(current => [...current, userMessage]); setBusy(true); busyRef.current = true;
    try {
      const result = await sendMentorMessage({ text: userText, profile: profile || {}, progressTasks, history: prior });
      const assistantMessage = { role: 'assistant', text: result.reply, intent: result.intent, domains: (result.recommendedDomainIds || []).slice(0, 2).map(getDomain).filter(domain => domain?.enabled).map(domain => ({ ...domain, reason: reasonFor(domain, profile || {}, userText) })), actionPlanTask: result.actionPlanTask || null, followUpQuestion: result.followUpQuestion, pendingIntent: result.pendingIntent, awaitingField: result.awaitingField };
      historyRef.current = [...next, assistantMessage]; setMessages(current => [...current, assistantMessage]);
      setStatus({ available: true, configured: true });
    } catch (error) {
      const assistantMessage = { role: 'assistant', text: error.message, error: true, setup: error.code === 'GEMINI_NOT_CONFIGURED' };
      historyRef.current = [...next, assistantMessage]; setMessages(current => [...current, assistantMessage]);
      if (error.code === 'GEMINI_NOT_CONFIGURED') setStatus({ available: true, configured: false });
    } finally { setBusy(false); busyRef.current = false; }
  }

  return <section className={`assistant-card ${className}`} id="assistant" aria-labelledby="assistant-title">
    <div className="assistant-head"><div className="assistant-emblem" aria-hidden="true">✳</div><div>
      <div className="section-kicker">SMART ENGINEER AI <span className={`demo-pill ${status.configured ? 'connected' : ''}`}>{status.configured ? 'GEMINI API' : 'SETUP NEEDED'}</span></div>
      <h2 id="assistant-title">{profile?.complete ? 'What would you like help with?' : 'What’s on your mind?'}</h2>
      <p>{profile?.complete ? 'Share what you’re working toward. I’ll use your profile to guide a practical next step.' : 'Tell me what you need in your own words. Your profile can make guidance more personal.'}</p>
    </div></div>
    {!status.configured && <div className="mentor-setup-note" role="status">{status.available ? 'Gemini backend is running, but no server API key is configured yet.' : 'Mentor backend is not reachable. Start the project with npm.cmd run dev.'} Replies will not be simulated.</div>}
    <div className="chat-body" aria-live="polite">{messages.length === 0 ? <div className="suggestions" aria-label="Try asking">
      {prompts.map(suggestion => <button key={suggestion} onClick={() => send(suggestion)}>{suggestion}<span aria-hidden="true">↗</span></button>)}
    </div> : <div className="messages">{messages.map((message, index) => <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
      <span className="message-icon" aria-hidden="true">{message.role === 'assistant' ? '✳' : 'You'}</span><div className={message.role === 'assistant' ? 'message-content assistant-markdown' : 'message-content'}>{message.role === 'assistant' ? <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>{message.text}</ReactMarkdown> : message.text}
        {message.setup && <p className="setup-hint">Add <code>GEMINI_API_KEY</code> to the ignored <code>.env.local</code> file, then restart the API. Never use a <code>VITE_</code> key.</p>}
        {message.actionPlanTask && <div className="mentor-action-plan"><div><span className="section-kicker">FROM YOUR ACTION PLAN</span><b>{message.actionPlanTask.title}</b><small>{message.actionPlanTask.reason}</small><small>{message.actionPlanTask.domainName} · {message.actionPlanTask.estimatedMinutes} min · {message.actionPlanTask.status === 'in_progress' ? 'In progress' : 'Not started'}{message.actionPlanTask.domainStatus !== 'ready' ? ' · preview module' : ''}</small></div><Link to={message.actionPlanTask.route} className="mentor-action-link">{message.actionPlanTask.domainStatus === 'ready' ? 'Open next task' : 'Explore domain preview'} <span aria-hidden="true">→</span></Link></div>}
        {message.domains?.length > 0 && <section className="message-domain-section" aria-label="Recommended domains"><h3>Recommended domains 🧭</h3><div className="message-domain-list">{message.domains.map(domain => <Link to={domain.route} className="message-domain" key={domain.id} aria-label={`Explore ${domain.name}${domain.status === 'ready' ? '' : ' preview'}`}><span className={`domain-icon ${domain.color}`}>{domain.icon}</span><span className="message-domain-copy"><b>{domain.name}</b><small>{domain.reason}</small><span className="message-domain-action">Explore domain <span aria-hidden="true">→</span></span>{domain.status !== 'ready' && <small className="domain-status">Preview · module not connected yet</small>}</span></Link>)}</div></section>}
      </div></div>)}{busy && <div className="typing" role="status"><span className="typing-mark" aria-hidden="true">✳</span><span>Preparing a response…</span></div>}</div>}</div>
    <form className="chat-input" onSubmit={event => { event.preventDefault(); send(); }}><input value={input} onChange={event => setInput(event.target.value)} placeholder="Tell me what you’re working through…" aria-label="Describe what you need help with"/><button disabled={!input.trim() || busy} aria-label="Send message">↑</button></form>
    <div className="privacy-note"><Icon name="spark" size={13}/> &nbsp;Chat stays in this tab and is sent to the configured mentor API only when you send a message.</div>
  </section>;
}
