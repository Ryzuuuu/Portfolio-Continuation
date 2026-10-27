import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Asterisk,
  Github,
  Linkedin,
  Mail,
  Menu,
  MoveUpRight,
  X,
} from "lucide-react";

const projects = [
  {
    number: "01",
    type: "COMPUTER VISION · BACKEND",
    title: "StoreSight",
    description: "Turns live CCTV into store analytics: conversion funnels, heatmaps, and anomaly alerts.",
    impact: "YOLOv8 + ByteTrack · idempotent events · 80%+ pytest coverage",
    color: "coral",
    tags: ["YOLOv8", "ByteTrack", "FastAPI"],
    mark: "S",
    href: "https://github.com/Ryzuuuu",
  },
  {
    number: "02",
    type: "OPEN SOURCE · BIM / CAD",
    title: "ParaBridge",
    description: "Parametric bridge substructures and IFC4 BIM export for IIT Bombay's Osdag.",
    impact: "5 CAD builders · IFC4 elements validated · OpenCASCADE fixes",
    color: "blue",
    tags: ["PythonOCC", "IfcOpenShell", "Python"],
    mark: "P.",
    href: "https://github.com/Ryzuuuu",
  },
];

const skills = [
  "Python", "FastAPI", "Flask", "SQL", "pytest", "LangChain", "LangGraph",
  "LangSmith", "OpenCV", "YOLOv8", "ByteTrack", "Scikit-learn", "Keras",
  "Pandas", "NumPy", "AWS", "Docker", "React", "JavaScript", "Node.js",
  "Redis", "SQLite", "Git", "CI/CD",
];

function useScrollReveal() {
  useEffect(() => {
    const elements = document.querySelectorAll("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function useReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let frame = 0;
    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const scrollable = document.documentElement.scrollHeight - window.innerHeight;
        setProgress(scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0);
      });
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => {
      window.removeEventListener("scroll", updateProgress);
      cancelAnimationFrame(frame);
    };
  }, []);

  return progress;
}

function MangaPortrait() {
  return (
    <div className="portrait-frame" aria-label="Original manga-inspired portrait illustration" role="img">
      <div className="portrait-frame__caption">FIG. 01 / THE BUILDER</div>
      <svg className="portrait-art" viewBox="0 0 480 560" fill="none" aria-hidden="true">
        <defs>
          <pattern id="dots" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill="#171715" />
          </pattern>
          <clipPath id="portraitClip">
            <path d="M84 82h311v400H84z" />
          </clipPath>
        </defs>
        <path d="M60 56h348v448H60z" fill="#E9E2D7" stroke="#171715" strokeWidth="3" />
        <path d="M281 56h127v205H281z" fill="url(#dots)" />
        <path d="M84 82h311v400H84z" fill="#F5F1E9" stroke="#171715" strokeWidth="3" />
        <g clipPath="url(#portraitClip)">
          <path d="M89 352c27-68 85-103 152-103 72 0 131 35 164 103v146H89V352Z" fill="#E95438" stroke="#171715" strokeWidth="4" />
          <path d="M173 290c1 31-10 60-22 78 26 33 55 48 90 48 34 0 65-17 91-49-17-20-24-51-24-82l-135 5Z" fill="#E6AF8D" stroke="#171715" strokeWidth="4" />
          <path d="M152 170c0-67 41-103 95-103 62 0 104 42 104 111 0 48-10 94-34 121-19 21-44 34-72 34-36 0-62-18-78-46-13-25-15-74-15-117Z" fill="#F2C5A6" stroke="#171715" strokeWidth="4" />
          <path d="M143 179c-4-76 28-125 92-129 35-2 62 11 81 37 20 27 27 60 21 100-18-15-32-42-39-68-30 28-78 44-142 45l-13 15Z" fill="#171715" stroke="#171715" strokeWidth="5" strokeLinejoin="round" />
          <path d="M154 189c-22 0-34 17-31 38 2 19 15 31 32 28M340 190c21-2 32 14 30 34-2 19-14 31-30 30" fill="#F2C5A6" stroke="#171715" strokeWidth="4" />
          <path d="M184 198c12-9 27-9 39-2M270 196c13-8 27-7 38 1" stroke="#171715" strokeWidth="5" strokeLinecap="round" />
          <path d="M194 221c5-8 12-8 17 0M281 220c5-8 12-8 17 0" stroke="#171715" strokeWidth="4" strokeLinecap="round" />
          <path d="M246 220c-2 17-7 35-13 43 8 6 17 7 25 2M224 282c16 8 34 7 48-3" stroke="#171715" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M194 239c8 10 19 12 30 4M277 242c9 8 19 6 27-4" stroke="#171715" strokeWidth="3" strokeLinecap="round" />
          <path d="M102 377c44-25 90-37 140-37 58 0 106 13 146 39" stroke="#171715" strokeWidth="3" strokeDasharray="8 8" />
          <path d="M190 368 240 436l48-67" stroke="#171715" strokeWidth="4" />
          <path d="m153 380 27 117m149-119-26 119" stroke="#171715" strokeWidth="3" />
        </g>
        <path d="M60 504h348" stroke="#171715" strokeWidth="3" />
        <path d="M73 72h9m-9 0v9m313-9h-9m9 0v9M73 490h9m-9 0v-9m313 9h-9m9 0v-9" stroke="#E95438" strokeWidth="4" />
      </svg>
      <div className="portrait-note"><Asterisk size={16} /> CURRENTLY MAKING GOOD THINGS</div>
      <span className="portrait-stamp">創<br />作</span>
    </div>
  );
}

function Reveal({ children, className = "", delay = 0 }) {
  return (
    <div
      className={`reveal ${className}`}
      data-reveal
      style={{ "--reveal-delay": `${delay}ms` }}
    >
      {children}
    </div>
  );
}

function SpotlightCard({ children, className = "" }) {
  const cardRef = useRef(null);

  function handlePointerMove(event) {
    const bounds = cardRef.current?.getBoundingClientRect();
    if (!bounds) return;
    cardRef.current.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
    cardRef.current.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
  }

  return (
    <article
      className={`spotlight-card ${className}`}
      ref={cardRef}
      onPointerMove={handlePointerMove}
    >
      {children}
    </article>
  );
}

function ProjectCard({ project, index }) {
  return (
    <Reveal delay={index * 90}>
      <SpotlightCard className={`project-card project-card--${project.color}`}>
        <div className="project-card__top">
          <span className="mono">{project.number} / {String(projects.length).padStart(2, "0")}</span>
          <a href={project.href} target="_blank" rel="noreferrer" aria-label={`Find ${project.title} on GitHub`}>
            <ArrowUpRight size={19} />
          </a>
        </div>
        <div className="project-card__art" aria-hidden="true">
          <span className="project-card__halftone" />
          <span className="project-card__mark">{project.mark}</span>
          {project.color === "coral" && <span className="project-orbit" />}
          {project.color === "blue" && <span className="project-grid-lines" />}
          {project.color === "yellow" && <span className="project-spark">✳</span>}
          <span className="project-card__speech">LET'S<br />BUILD!</span>
        </div>
        <div className="project-card__body">
          <span className="project-card__type mono">{project.type}</span>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <p className="project-card__impact">{project.impact}</p>
          <div className="project-tags">
            {project.tags.map((tag) => <span key={tag}>{tag}</span>)}
          </div>
        </div>
      </SpotlightCard>
    </Reveal>
  );
}

function App() {
  useScrollReveal();
  const progress = useReadingProgress();
  const [menuOpen, setMenuOpen] = useState(false);
  const [formState, setFormState] = useState("idle");
  const [formMessage, setFormMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setFormState("sending");
    setFormMessage("");
    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Your message could not be sent.");
      setFormState("success");
      setFormMessage(result.message);
      form.reset();
    } catch (error) {
      setFormState("error");
      setFormMessage(error.message || "The contact service is unavailable. Please try again later.");
    }
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <div className="reading-progress" style={{ transform: `scaleX(${progress / 100})` }} />
      <header className="site-header">
        <a className="wordmark" href="#top" aria-label="Neelabja Mukhopadhyay home">
          <span className="wordmark__icon">N<span>M</span></span>
          <span className="wordmark__label">NEELABJA MUKHOPADHYAY<br /><small>AI/ML ENGINEER · BUILDER</small></span>
        </a>
        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav className={menuOpen ? "site-nav is-open" : "site-nav"} aria-label="Main navigation">
          <a href="#about" onClick={closeMenu}>THE STORY <span>01</span></a>
          <a href="#work" onClick={closeMenu}>SELECTED WORK <span>02</span></a>
          <a href="#experience" onClick={closeMenu}>EXPERIENCE <span>03</span></a>
          <a href="#contact" onClick={closeMenu}>SAY HELLO <span>04</span></a>
          <a className="nav-availability" href="#contact" onClick={closeMenu}><i /> AVAILABLE FOR WORK</a>
        </nav>
      </header>

      <main id="top">
        <section className="hero page-pad">
          <div className="hero__meta mono">
            <span>KOLKATA, INDIA · PORTFOLIO / 2026</span>
            <span>SCROLL TO READ <ArrowDown size={13} /></span>
          </div>
          <div className="hero__grid">
            <div className="hero__copy">
              <p className="eyebrow"><span className="eyebrow__line" /> AI/ML ENGINEER · PYTHON BACKEND · COMPUTER VISION</p>
              <h1>
                I BUILD<br />
                SYSTEMS<br />
                THAT <span className="hero__italic">SEE</span>
                <span className="hero__period">.</span>
              </h1>
              <div className="hero__bottom">
                <p className="hero__intro">From raw footage to useful insight.<br />From vague specs to <span>shipped systems.</span></p>
                <a className="round-link" href="#work" aria-label="Explore selected work">
                  <ArrowDownRight size={26} />
                </a>
              </div>
            </div>
            <div className="hero__visual">
              <div className="hero__burst">AI<br />WITH<br />VISION.</div>
              <MangaPortrait />
              <span className="hero__vertical-label mono">VOL. 01 — HUMAN × MACHINE</span>
              <span className="hero__scribble" aria-hidden="true">✳</span>
            </div>
          </div>
          <div className="hero__foot mono">
            <span>KOLKATA, INDIA · OPEN TO HARD PROBLEMS</span>
            <span>01 / 06</span>
          </div>
        </section>

        <section className="intro section-pad" id="about">
          <div className="section-kicker mono"><span>01 — THE ORIGIN STORY</span><span>AI/ML · BACKEND · COMPUTER VISION</span></div>
          <div className="intro__grid">
            <Reveal className="intro__heading">
              <p className="eyebrow"><span className="eyebrow__line" /> RAW DATA IN. USEFUL SYSTEMS OUT.</p>
              <h2>Make messy<br />problems<br /><em>make</em><br />sense.</h2>
              <span className="intro__asterisk"><Asterisk size={34} /></span>
            </Reveal>
            <Reveal className="intro__text" delay={120}>
              <p className="intro__lead">I turn raw CCTV footage, messy data, and vague specs into tested, shipped systems.</p>
              <p>I’m an AI/ML and backend engineer working across LLM agents, computer vision pipelines, and Python services. I like problems that need both careful engineering and a little persistence—from real-time store analytics to parametric 3D geometry.</p>
              <p>Currently contributing to IIT Bombay’s open-source Osdag project and building AI-powered tools at Travarsa. Outside the codebase, I’m a core member of VIT Bhopal’s Matrix Multimedia Club and volunteer with Bengali Cultural Club Parboni.</p>
              <a className="text-link" href="#experience">FOLLOW THE THREAD <ArrowRight size={16} /></a>
            </Reveal>
          </div>
          <div className="stats-row">
            <Reveal><div className="stat"><span className="stat__number">2<span>+</span></span><span className="stat__label mono">ENGINEERING INTERNSHIPS</span></div></Reveal>
            <Reveal delay={80}><div className="stat"><span className="stat__number">3<span>+</span></span><span className="stat__label mono">FRONTEND MODULES SHIPPED</span></div></Reveal>
            <Reveal delay={160}><div className="stat"><span className="stat__number">80<span>%</span></span><span className="stat__label mono">STORESIGHT TEST COVERAGE</span></div></Reveal>
            <Reveal delay={240}><div className="stat stat__note"><span>BUILD WITH CARE.<br />VERIFY THE DETAILS.</span><Asterisk size={26} /></div></Reveal>
          </div>
        </section>

        <section className="work section-pad" id="work">
          <div className="section-kicker mono"><span>02 — SELECTED PROJECTS</span><span>BUILT, TESTED, VALIDATED</span></div>
          <div className="work__heading">
            <Reveal><h2>Systems<br />with <em>purpose.</em></h2></Reveal>
            <Reveal delay={100}><p>Production-minded engineering: analytics from CCTV streams and parametric BIM geometry for an open-source bridge-design tool.</p></Reveal>
          </div>
          <div className="project-grid">
            {projects.map((project, index) => <ProjectCard key={project.number} project={project} index={index} />)}
          </div>
          <Reveal className="work__foot">
            <span className="mono">MORE EXPERIMENTS IN THE MAKING</span>
            <span className="work__arrow"><ArrowDownRight size={23} /></span>
          </Reveal>
        </section>

        <section className="experience section-pad" id="experience">
          <div className="section-kicker mono"><span>03 — FIELD NOTES</span><span>EXPERIENCE · EDUCATION</span></div>
          <div className="experience__heading">
            <Reveal>
              <p className="eyebrow"><span className="eyebrow__line" /> THE WORK BEHIND THE WORK</p>
              <h2>Learning by<br /><em>shipping.</em></h2>
            </Reveal>
            <Reveal delay={100}>
              <p className="experience__intro">Working across AI, software, and engineering—with a bias toward building, testing, and making the details hold up.</p>
            </Reveal>
          </div>
          <div className="timeline">
            <Reveal className="timeline__item">
              <div className="timeline__date mono">SEP 2026 — PRESENT<br /><span>REMOTE</span></div>
              <div className="timeline__body">
                <p className="timeline__eyebrow mono">SOFTWARE DEVELOPMENT INTERN · FOSSEE AUTUMN INTERNSHIP</p>
                <h3>FOSSEE, IIT Bombay <span> / Osdag</span></h3>
                <ul>
                  <li>Engineering parametric 3D CAD geometry for an open-source bridge-design tool with Python and pythonOCC/OpenCASCADE.</li>
                  <li>Integrating substructure geometry into the IFC4 (BIM) export workflow with IfcOpenShell.</li>
                </ul>
              </div>
            </Reveal>
            <Reveal className="timeline__item" delay={90}>
              <div className="timeline__date mono">MAY 2025 — PRESENT<br /><span>KOLKATA, INDIA</span></div>
              <div className="timeline__body">
                <p className="timeline__eyebrow mono">PYTHON AI/ML DEVELOPER INTERN</p>
                <h3>Travarsa Private Limited</h3>
                <ul>
                  <li>Orchestrating LLM agents with LangChain, LangGraph, and LangSmith to automate multi-step reasoning and data processing.</li>
                  <li>Building production computer-vision pipelines with Python and OpenCV for image analysis and feature extraction.</li>
                  <li>Shipped 3+ frontend modules for internal AI tools; mentor fellow interns in computer vision and AI/ML.</li>
                </ul>
              </div>
            </Reveal>
          </div>
          <div className="experience__bottom">
            <Reveal className="education-card">
              <span className="timeline__eyebrow mono">EDUCATION</span>
              <h3>Vellore Institute of Technology, Bhopal</h3>
              <p>B.Tech, Computer Science & Engineering · 2023–2027</p>
              <span className="education-card__score mono">CGPA 7.22 / 10</span>
            </Reveal>
            <Reveal className="cert-card" delay={100}>
              <span className="timeline__eyebrow mono">SELECTED CERTIFICATIONS</span>
              <p>IBM Machine Learning with Python · IBM Deep Learning Essentials with Keras · NPTEL Introduction to Machine Learning (IIT Madras) · Microsoft Azure Fundamentals (AZ-900) · AWS Educate</p>
              <a className="text-link" href="https://www.linkedin.com/in/neelabjamukhopadhyay/" target="_blank" rel="noreferrer">MORE ON LINKEDIN <ArrowUpRight size={15} /></a>
            </Reveal>
          </div>
        </section>

        <section className="toolbox section-pad" id="toolbox">
          <div className="section-kicker mono"><span>04 — THE TOOLBOX</span><span>FAMILIAR, NOT PRECIOUS</span></div>
          <div className="toolbox__grid">
            <Reveal>
              <p className="eyebrow"><span className="eyebrow__line" /> THE RIGHT TOOL FOR THE PROBLEM</p>
              <h2>From raw<br />signal to<br /><em>systems.</em></h2>
            </Reveal>
            <Reveal className="toolbox__details" delay={120}>
              <p>Python and backend systems are my home base. I work across ML, computer vision, data, cloud, and web to take ideas from experiment to dependable service.</p>
              <div className="skill-list">
                {skills.map((skill) => <span className="skill-pill" key={skill}><i />{skill}</span>)}
              </div>
              <div className="toolbox__callout">
                <span className="toolbox__callout-mark">!</span>
                <span>TESTED BY DESIGN<br /><small>BUILT TO WORK IN THE REAL WORLD</small></span>
                <ArrowUpRight size={18} />
              </div>
            </Reveal>
          </div>
          <div className="marquee" aria-label="Build with intent, test with care, ship what matters">
            <div className="marquee__track" aria-hidden="true">
              {Array.from({ length: 4 }, (_, index) => (
                <span key={index}>BUILD WITH INTENT <Asterisk size={24} /> TEST WITH CARE <Asterisk size={24} /> SHIP WHAT MATTERS <Asterisk size={24} /></span>
              ))}
            </div>
          </div>
        </section>

        <section className="contact section-pad" id="contact">
          <div className="section-kicker mono"><span>05 — YOUR MOVE</span><span>THE NEXT CHAPTER</span></div>
          <div className="contact__grid">
            <Reveal className="contact__copy">
              <p className="eyebrow"><span className="eyebrow__line" /> HAVE A HARD PROBLEM?</p>
              <h2>Let's make<br />something<br /><em>matter.</em></h2>
              <p className="contact__sub">I’m looking for hard problems and a team that ships. If you’re building something ambitious, let’s talk.</p>
              <a className="contact__email" href="mailto:neel.abja114@email.com">NEEL.ABJA114@EMAIL.COM <MoveUpRight size={16} /></a>
              <div className="social-links">
                <a href="https://github.com/Ryzuuuu" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={18} /></a>
                <a href="https://www.linkedin.com/in/neelabjamukhopadhyay/" target="_blank" rel="noreferrer" aria-label="LinkedIn"><Linkedin size={18} /></a>
                <a href="mailto:neel.abja114@email.com" aria-label="Email"><Mail size={18} /></a>
              </div>
            </Reveal>
            <Reveal className="contact__form-wrap" delay={100}>
              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-title"><span className="mono">A QUICK NOTE</span><span>✳</span></div>
                <label htmlFor="name">YOUR NAME</label>
                <input id="name" name="name" placeholder="The name I should know you by" maxLength="80" required />
                <label htmlFor="email">YOUR EMAIL</label>
                <input id="email" name="email" type="email" placeholder="you@somewhere.com" maxLength="254" required />
                <label htmlFor="message">WHAT'S ON YOUR MIND?</label>
                <textarea id="message" name="message" placeholder="Tell me a little about it..." rows="4" maxLength="3000" required />
                <div className="honeypot" aria-hidden="true">
                  <label htmlFor="website">Leave this field empty</label>
                  <input id="website" name="website" tabIndex="-1" autoComplete="off" />
                </div>
                <button className="submit-button" type="submit" disabled={formState === "sending"}>
                  {formState === "sending" ? "SENDING..." : "SEND THE MESSAGE"} <ArrowUpRight size={18} />
                </button>
                {formMessage && <p className={`form-feedback form-feedback--${formState}`} role="status">{formMessage}</p>}
                <p className="form-foot mono">NO SPAM. JUST A HUMAN REPLY.</p>
              </form>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="footer-mark" href="#top">NM<span>.</span></a>
        <span className="mono">NEELABJA MUKHOPADHYAY · MADE WITH CURIOSITY</span>
        <a className="back-top mono" href="#top">BACK TO TOP <ArrowUpRight size={14} /></a>
      </footer>
    </>
  );
}

export default App;
