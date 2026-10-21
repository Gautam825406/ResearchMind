import { ArrowDown, ArrowRight, BookOpen, Check, FileText, Layers3, Search, ShieldCheck, Sparkles } from 'lucide-react'
import './landing.css'

const workflow = [
  { icon: Search, name: 'Search', detail: 'Follow the question.', text: 'Discover relevant web sources and bring the evidence together.' },
  { icon: BookOpen, name: 'Read', detail: 'Look a little deeper.', text: 'Explore a relevant source beyond its headline and extract the details.' },
  { icon: FileText, name: 'Write', detail: 'Make the connections.', text: 'Turn the findings into a structured report with source references.' },
  { icon: ShieldCheck, name: 'Review', detail: 'Question the answer.', text: 'Get a separate critique of the report, its strengths, and its gaps.' },
]

const topics = [
  { category: 'TECHNOLOGY', name: 'Beyond the AI headlines', question: 'What are the benefits and limitations of AI in healthcare?', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=85', alt: 'Medical professionals reviewing healthcare information' },
  { category: 'ENERGY & CLIMATE', name: 'A brighter energy future', question: 'What are the benefits and limitations of rooftop solar energy for households?', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=800&q=85', alt: 'Solar panels collecting sunlight' },
  { category: 'SCIENCE', name: 'The next computing frontier', question: 'What are the latest advances and practical limitations of quantum computing?', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=85', alt: 'Detailed electronic circuit board' },
]

function Brand() {
  return <a className="brand" href="/" aria-label="ResearchMind home"><span className="brand-symbol"><Layers3 size={25} /></span>ResearchMind<span className="brand-dot">.</span></a>
}

export default function LandingPage() {
  return <div className="landing-page">
    <a className="landing-skip" href="#landing-content">Skip to content</a>
    <header className="landing-header">
      <Brand />
      <nav aria-label="Main navigation"><a href="#approach">The approach</a><a href="#explore">Explore</a><a href="#questions">Questions</a></nav>
      <a className="landing-button landing-button-small" href="/studio">Open studio <ArrowRight size={16} /></a>
    </header>

    <main id="landing-content">
      <section className="landing-hero" aria-labelledby="landing-title">
        <img className="landing-hero-image" src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=2400&q=90" alt="Books and reading desks in a sunlit research library" fetchPriority="high" />
        <div className="landing-hero-shade" />
        <div className="landing-hero-content">
          <div className="landing-kicker"><span /> A LITTLE CURIOSITY. A WIDER PERSPECTIVE.</div>
          <h1 id="landing-title">ResearchMind<span>.</span></h1>
          <p className="landing-hero-line">Good questions deserve<br />a deeper look.</p>
          <p className="landing-hero-description">From the first question to a considered report.<br className="landing-desktop-break" /> Research with a team of AI agents at your side.</p>
          <a className="landing-button landing-button-light" href="/studio">Start exploring <ArrowRight size={18} /></a>
        </div>
        <div className="landing-hero-bottom"><span>AN OPEN SPACE FOR INDEPENDENT THINKING</span><a href="#approach" aria-label="Discover the research approach"><ArrowDown size={19} /></a></div>
      </section>

      <section className="landing-proof" aria-label="Research workflow"><span>ONE QUESTION.<br /><strong>FOUR PERSPECTIVES.</strong></span><div>{workflow.map(({ name, icon: Icon }, index) => <span key={name}><Icon size={17} />{name}{index < workflow.length - 1 && <ArrowRight className="landing-proof-arrow" size={15} />}</span>)}</div><span className="landing-proof-note"><Sparkles size={16} /> Powered by Groq & Tavily</span></section>

      <section className="landing-section landing-approach" id="approach" aria-labelledby="approach-title">
        <div className="landing-section-heading"><div><span className="landing-section-label">01 / THE APPROACH</span><h2 id="approach-title">A question worth asking.<br />An answer worth examining.</h2></div><p>Research is more than finding information.<br />It is reading closely, connecting ideas,<br />and knowing what still needs a second look.</p></div>
        <div className="landing-workflow">{workflow.map(({ name, detail, text, icon: Icon }, index) => <div className="landing-workflow-step" key={name}><div className="landing-workflow-top"><span>0{index + 1}</span><Icon size={24} strokeWidth={1.5} /></div><span className="landing-step-label">{name.toUpperCase()}</span><h3>{detail}</h3><p>{text}</p></div>)}</div>
      </section>

      <section className="landing-deliverable" aria-labelledby="deliverable-title"><div className="landing-deliverable-inner"><div><span className="landing-section-label">THE OTHER SIDE OF YOUR QUESTION</span><h2 id="deliverable-title">Not just an answer.<br />Something to think with.</h2><p>A research report, its supporting material, and a separate critical review. All in one place, ready for your own judgment.</p><a className="landing-text-link" href="/studio">Make room for your next idea <ArrowRight size={18} /></a></div><ul>{['A structured report with key findings', 'Source references and reading notes', 'An independent AI critique', 'A downloadable Markdown report'].map(item => <li key={item}><Check size={17} /><span>{item}</span></li>)}</ul></div></section>

      <section className="landing-section" id="explore" aria-labelledby="explore-title"><div className="landing-section-heading"><div><span className="landing-section-label">02 / FOLLOW YOUR CURIOSITY</span><h2 id="explore-title">Where will your next<br />question take you?</h2></div><p>Start with a fresh perspective<br />on something that matters to you.</p></div><div className="landing-topics">{topics.map(topic => <a className="landing-topic" href={`/studio?topic=${encodeURIComponent(topic.question)}`} key={topic.name}><div className="landing-topic-image"><img src={topic.image} alt={topic.alt} loading="lazy" /><span aria-hidden="true"><ArrowRight size={22} /></span></div><div className="landing-topic-category">{topic.category}</div><h3>{topic.name}</h3><p>{topic.question}</p></a>)}</div></section>

      <section className="landing-section landing-faq" id="questions" aria-labelledby="questions-title"><div><span className="landing-section-label">03 / A FEW THINGS TO KNOW</span><h2 id="questions-title">Before you begin.</h2></div><div className="landing-faq-items"><details><summary>What happens when I start a research run?</summary><p>Your topic passes through search, reading, writing, and critique. The studio collects the results into separate report, source, reading-note, and review sections. A run can take a few minutes.</p></details><details><summary>Can I trust every finding?</summary><p>AI can make mistakes, and source quality varies. Use the report as a starting point, follow its references, and independently verify important claims.</p></details><details><summary>Do I need provider accounts?</summary><p>The local backend uses a Groq API key and a Tavily API key. They stay on the backend. Provider usage limits and charges may apply to research runs.</p></details><details><summary>Can I take my research with me?</summary><p>Yes. Download the research report as a Markdown file from the studio. Completed runs stay in the workspace until the page is refreshed.</p></details></div></section>

      <section className="landing-final"><span className="landing-section-label">THERE IS ALWAYS MORE TO DISCOVER</span><h2>Bring your curiosity.</h2><a className="landing-button" href="/studio">Open the research studio <ArrowRight size={18} /></a></section>
    </main>
    <footer className="landing-footer"><Brand /><span>Independent thinking, amplified.</span><a href="/studio">Research studio <ArrowRight size={15} /></a><small>AI-generated research. Verify important claims.</small></footer>
  </div>
}