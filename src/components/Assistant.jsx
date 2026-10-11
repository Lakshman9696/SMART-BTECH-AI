import { useState } from 'react';
import { Link } from 'react-router-dom';
import { recommendDomains, reasonFor } from '../data/domains';
import { Icon } from './Icon';

const prompts = ['Plan my career path', 'What skills should I learn?', 'Prepare me for interviews'];
const followUps = ['Coursework', 'Skills & projects', 'Career goals', 'Something else'];

export function Assistant({ profile, initialPrompt = '', className = '' }) {
  const [input, setInput] = useState(initialPrompt);
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);

  function send(text = input) {
    if (!text.trim() || busy) return;
    const userText = text.trim();
    setInput('');
    setMessages((current) => [...current, { role: 'user', text: userText }]);
    setBusy(true);
    setTimeout(() => {
      const terms = userText.toLowerCase().match(/[a-z]{3,}/g) || [];
      if (terms.length < 2) {
        setMessages((current) => [...current, {
          role: 'assistant',
          text: 'What would you like to make progress on? A little more detail will help me find a useful place to start.',
          followUp: true,
        }]);
        setBusy(false);
        return;
      }
      if (!profile?.complete) {
        setMessages((current) => [...current, {
          role: 'assistant',
          text: 'I can help you find a starting area. To make career and skill suggestions personal, complete your short student profile first.',
          profileNeeded: true,
        }]);
        setBusy(false);
        return;
      }
      const picks = recommendDomains(userText, profile).filter(Boolean);
      setMessages((current) => [...current, {
        role: 'assistant',
        text: 'Here are a few places that may help, based on what you shared:',
        domains: picks,
        message: userText,
      }]);
      setBusy(false);
    }, 480);
  }

  return <section className={`assistant-card ${className}`} id="assistant" aria-labelledby="assistant-title">
    <div className="assistant-head">
      <div className="assistant-emblem" aria-hidden="true">✳</div>
      <div>
        <div className="section-kicker">SMART ENGINEER AI <span className="demo-pill">DEMO</span></div>
        <h2 id="assistant-title">{profile?.complete ? 'What would you like help with?' : 'What’s on your mind?'}</h2>
        <p>{profile?.complete ? 'Share what you’re working toward. I’ll use your profile to suggest a next step.' : 'Tell me what you need in your own words. Your profile makes suggestions more personal.'}</p>
      </div>
    </div>
    <div className="chat-body" aria-live="polite">
      {messages.length === 0 ? <div className="suggestions" aria-label="Try asking">
        {prompts.map((suggestion) => <button key={suggestion} onClick={() => send(suggestion)}>{suggestion}<span aria-hidden="true">↗</span></button>)}
      </div> : <div className="messages">
        {messages.map((message, index) => <div className={`message ${message.role}`} key={`${message.role}-${index}`}>
          <span className="message-icon" aria-hidden="true">{message.role === 'assistant' ? '✳' : 'You'}</span>
          <div>{message.text}
            {message.followUp && <div className="follow-up-options">{followUps.map((option) => <button key={option} onClick={() => send(`I need help with ${option.toLowerCase()}`)}>{option}</button>)}</div>}
            {message.profileNeeded && <Link className="profile-cta-inline" to="/profile">Complete your student profile <span aria-hidden="true">↗</span></Link>}
            {message.domains?.map((domain) => <Link to={domain.route} className="message-domain" key={domain.id}>
              <span className={`domain-icon ${domain.color}`}>{domain.icon}</span>
              <span><b>{domain.name}</b><small>{reasonFor(domain, profile?.complete ? profile : {}, message.message)}</small><small className="domain-status">{domain.status === 'ready' ? 'Available' : 'Planned · preview only'}</small></span>
              <span className="arrow" aria-hidden="true">↗</span>
            </Link>)}
          </div>
        </div>)}
        {busy && <div className="typing" role="status"><span className="typing-mark" aria-hidden="true">✳</span><span>Finding a helpful starting point</span></div>}
      </div>}
    </div>
    <form className="chat-input" onSubmit={(event) => { event.preventDefault(); send(); }}>
      <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Tell me what you’re working through…" aria-label="Describe what you need help with" />
      <button disabled={!input.trim() || busy} aria-label="Send message">↑</button>
    </form>
    <div className="privacy-note"><Icon name="spark" size={13}/> &nbsp;Local demo recommendations only · AI backend not connected</div>
  </section>;
}
