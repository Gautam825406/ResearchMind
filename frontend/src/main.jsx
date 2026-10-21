import React, { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import ReactMarkdown from 'react-markdown'
import { ArrowDownToLine, ArrowRight, BookOpen, Check, CircleAlert, Compass, FileText, FlaskConical, Layers3, LoaderCircle, Plus, Search, ShieldCheck, Sparkles, X } from 'lucide-react'
import './styles.css'
import LandingPage from './LandingPage'

const agents = [
  { title: 'Search agent', text: 'Discover relevant sources', icon: Search },
  { title: 'Reader agent', text: 'Extract the important details', icon: BookOpen },
  { title: 'Writer agent', text: 'Build a structured report', icon: FileText },
  { title: 'Critic agent', text: 'Review quality and accuracy', icon: ShieldCheck },
]
const suggestions = ['The future of renewable energy', 'AI in healthcare', 'Advances in quantum computing']
const tabs = [ ['report', 'Research report'], ['search_results', 'Sources'], ['scraped_content', 'Reading notes'], ['feedback', 'Critical review'] ]

function App() {
  const [topic, setTopic] = useState(() => (new URLSearchParams(window.location.search).get('topic') || '').slice(0, 500))
  const [submittedTopic, setSubmittedTopic] = useState('')
  const [health, setHealth] = useState(null)
  const [connectionError, setConnectionError] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const [tab, setTab] = useState('report')
  const [history, setHistory] = useState([])
  const [settings, setSettings] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  async function checkHealth() {
    setConnectionError('')
    try {
      const response = await fetch('/api/health')
      if (!response.ok) throw new Error()
      setHealth(await response.json())
    } catch {
      setHealth(null)
      setConnectionError('Cannot reach the Python API. Start the backend on port 8000.')
    }
  }

  useEffect(() => { checkHealth() }, [])
  useEffect(() => {
    if (!busy) return
    const timer = setInterval(() => setElapsed(value => value + 1), 1000)
    return () => clearInterval(timer)
  }, [busy])

  async function runResearch(event) {
    event.preventDefault()
    if (busy || topic.trim().length < 3) return
    setBusy(true)
    setError('')
    setResult(null)
    setElapsed(0)
    setSubmittedTopic(topic.trim())
    setTab('report')
    try {
      const response = await fetch('/api/research', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topic.trim() }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'Please enter a topic between 3 and 500 characters.')
      setResult(data)
      setHistory(items => [{ topic: topic.trim(), result: data }, ...items].slice(0, 8))
    } catch (failure) {
      setError(failure instanceof TypeError ? 'Connection lost. Check the backend terminal before retrying.' : failure.message)
    } finally {
      setBusy(false)
    }
  }

  function newResearch() {
    setTopic(''); setResult(null); setSubmittedTopic(''); setError(''); setTab('report')
  }

  function downloadReport() {
    const url = URL.createObjectURL(new Blob([`# ${submittedTopic}\n\n${result.report}`], { type: 'text/markdown' }))
    const link = document.createElement('a')
    link.href = url; link.download = 'research-report.md'; link.click()
    URL.revokeObjectURL(url)
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="/" aria-label="ResearchMind home"><span className="brand-symbol"><Layers3 size={23} /></span>ResearchMind<span className="brand-dot">.</span></a>
      <div className="workspace-label">YOUR WORKSPACE</div>
      <button className="nav-item selected" onClick={() => setSettings(false)}><Compass size={19} /> Research studio <span className="nav-indicator" /></button>
      <button className="new-button" onClick={newResearch} disabled={busy}><Plus size={18} /> New research</button>
      <div className="history-label">THIS SESSION <span>{history.length.toString().padStart(2, '0')}</span></div>
      <div className="history-list">{history.length ? history.map((item, index) => <button disabled={busy} key={index} onClick={() => { setResult(item.result); setSubmittedTopic(item.topic); setTopic(item.topic); setTab('report'); setError('') }}><FileText size={16} /><span>{item.topic}</span></button>) : <p>No completed research yet.</p>}</div>
      <div className="sidebar-bottom"><span className="avatar">RM</span><div><strong>Research workspace</strong><small>Local environment</small></div><span className="local-dot" /></div>
    </aside>

    <main>
      <header className="topbar"><div><span>Workspace</span><span className="slash">/</span><strong>Research studio</strong></div><button className="connection" onClick={() => { setSettings(true); checkHealth() }}><span className={health?.configured ? 'status-dot ready' : 'status-dot'} />{health?.configured ? 'Agents connected' : 'Setup required'}</button></header>
      <div className="main-content">
        <div className="page-heading"><div><div className="eyebrow"><FlaskConical size={15} /> MULTI-AGENT RESEARCH</div><h1>Room for your next big question.</h1><p>A focused workspace for evidence, insight, and a clearer perspective.</p></div><div className="model-label" title={health?.model}><Sparkles size={15} /> {health?.provider || 'Groq'}</div></div>

        {(connectionError || (health && !health.configured)) && <div className="notice" role="status"><CircleAlert size={18} /><span>{connectionError || `Missing backend configuration: ${health.missing_keys.join(', ')}. Add it to backend/.env and restart the API.`}</span><button onClick={() => { setSettings(true); checkHealth() }}>Check setup <ArrowRight size={15} /></button></div>}

        <section className="research-composer" aria-label="New research">
          <div className="section-label"><span className="tiny-square" /> THE STARTING POINT <span className="private-label">01 / RESEARCH BRIEF</span></div>
          <form onSubmit={runResearch}>
            <label htmlFor="topic">What would you like to explore?</label>
            <textarea id="topic" value={topic} onChange={event => setTopic(event.target.value)} placeholder="e.g. How is AI changing the future of healthcare?" minLength={3} maxLength={500} required disabled={busy} />
            <div className="composer-footer"><span>{topic.length} / 500</span><button className="primary-button" type="submit" disabled={busy || !health?.configured || topic.trim().length < 3}>{busy ? <LoaderCircle size={17} className="spin" /> : <Sparkles size={17} />}{busy ? 'Researching...' : 'Start research'}{!busy && <ArrowRight size={17} />}</button></div>
          </form>
          <div className="suggestions"><span>Explore a topic</span>{suggestions.map(suggestion => <button disabled={busy} key={suggestion} onClick={() => setTopic(suggestion)}>{suggestion}<ArrowRight size={13} /></button>)}</div>
        </section>

        <section className="agent-section" aria-label="Research team"><div className="section-heading"><h2>Your research team</h2><span>Four agents. One considered answer.</span></div><div className="agent-grid">{agents.map(({ title, text, icon: Icon }, index) => <div className={`agent ${result ? 'complete' : ''}`} key={title}><div className={`agent-icon agent-${index}`}><Icon size={20} /></div><div><h3>{title}</h3><p>{text}</p></div><span className="agent-state">{result ? <Check size={15} /> : `0${index + 1}`}</span></div>)}</div></section>

        <section className="output-section" aria-label="Research output"><div className="section-heading"><h2>Research output</h2><span>{result ? 'Research complete' : busy ? `In progress · ${elapsed}s` : 'Ready when you are'}</span></div>
          {error && <div className="error" role="alert"><CircleAlert size={18} />{error}</div>}
          {busy ? <div className="working" role="status"><LoaderCircle className="spin" size={30} /><h3>Following the evidence</h3><p>Searching, reading, writing, and reviewing your research.</p><span>Research can take several minutes. Keep this page open.</span></div> : result ? <div className="results"><div className="results-top"><h3>{submittedTopic}</h3><button className="icon-button" onClick={downloadReport} title="Download report" aria-label="Download report"><ArrowDownToLine size={19} /></button></div><div className="tabs" role="tablist" aria-label="Research sections">{tabs.map(([key, label]) => <button id={`tab-${key}`} role="tab" aria-selected={tab === key} aria-controls="result-panel" className={tab === key ? 'active' : ''} key={key} onClick={() => setTab(key)}>{label}</button>)}</div><article id="result-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="markdown"><ReactMarkdown>{String(result[tab] || 'No content returned for this section.')}</ReactMarkdown></article></div> : <div className="empty-state"><div className="empty-image"><img src="https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=600&q=85" alt="Open notebook and pen on a research desk" /><span><BookOpen size={21} /></span></div><div><span className="eyebrow">FROM QUESTION TO CLARITY</span><h3>Your next discovery starts here.</h3><p>A fresh page for your research.</p></div><span className="empty-index">01</span></div>}
        </section>
        <footer className="page-footer"><span>ResearchMind <span className="footer-dot">/</span> Independent thinking, amplified.</span><span>AI-generated research. Verify important claims.</span></footer>
      </div>
    </main>

    {settings && <div className="modal-overlay" onClick={() => setSettings(false)}><section className="setup-dialog" role="dialog" aria-modal="true" aria-labelledby="setup-title" onClick={event => event.stopPropagation()} onKeyDown={event => { if (event.key === 'Escape') setSettings(false) }}><div className="results-top"><h2 id="setup-title">Backend connection</h2><button autoFocus className="icon-button" onClick={() => setSettings(false)} aria-label="Close setup"><X size={20} /></button></div><p>{connectionError || (health?.configured ? 'The API is connected and both provider keys are configured.' : 'Add your provider credentials to backend/.env, then restart the Python API.')}</p><pre>GROQ_API_KEY=your_groq_key{'\n'}GROQ_MODEL=openai/gpt-oss-20b{'\n'}TAVILY_API_KEY=your_tavily_key</pre><p>Backend command (from the project root)</p><pre>.venv\Scripts\python -m uvicorn api:app --app-dir backend --host 127.0.0.1 --port 8000</pre><button className="primary-button" onClick={checkHealth}>Check connection <ArrowRight size={16} /></button></section></div>}
  </div>
}

const isStudio = window.location.pathname.replace(/\/$/, '') === '/studio'

createRoot(document.getElementById('root')).render(<React.StrictMode>{isStudio ? <App /> : <LandingPage />}</React.StrictMode>)