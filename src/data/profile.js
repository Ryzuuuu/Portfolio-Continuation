// TODO(site-url): set to the production origin once the site is deployed, e.g.
// "https://yourdomain.com" (no trailing slash). It feeds the canonical link, Open Graph and
// Twitter URLs, JSON-LD, robots.txt and sitemap.xml at build time. While it's empty,
// `npm run build` warns and leaves the tags that need an absolute URL out.
export const SITE_URL = "";

export const profile = {
  name: "Neelabja Mukhopadhyay",
  initials: ["N", "M"],
  jobTitle: "AI/ML Engineer",
  tagline: "AI/ML ENGINEER · BUILDER",
  focus: "AI/ML ENGINEER · PYTHON BACKEND · COMPUTER VISION",
  location: "Kolkata, India",
  edition: "PORTFOLIO / 2026",
  description:
    "Neelabja Mukhopadhyay — AI/ML engineer building computer vision systems, LLM agents, and Python backend services.",
  email: "neel.abja114@gmail.com",
  social: {
    github: "https://github.com/Ryzuuuu",
    linkedin: "https://www.linkedin.com/in/neelabjamukhopadhyay/",
  },
};

export const bio = {
  lead: "I turn raw CCTV footage, messy data, and vague specs into tested, shipped systems.",
  paragraphs: [
    "I’m an AI/ML and backend engineer working across LLM agents, computer vision pipelines, and Python services. I like problems that need both careful engineering and a little persistence—from real-time store analytics to parametric 3D geometry.",
    "Currently contributing to IIT Bombay’s open-source Osdag project and building AI-powered tools at Travarsa. Outside the codebase, I’m a core member of VIT Bhopal’s Matrix Multimedia Club and volunteer with Bengali Cultural Club Parboni.",
  ],
};

export const stats = [
  { value: "2", suffix: "+", label: "ENGINEERING INTERNSHIPS" },
  { value: "3", suffix: "+", label: "FRONTEND MODULES SHIPPED" },
  { value: "80", suffix: "%", label: "STORESIGHT TEST COVERAGE" },
];
