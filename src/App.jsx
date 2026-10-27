import { AboutSection } from "./components/AboutSection.jsx";
import { ContactSection } from "./components/ContactSection.jsx";
import { ExperienceSection } from "./components/ExperienceSection.jsx";
import { Footer } from "./components/Footer.jsx";
import { Header } from "./components/Header.jsx";
import { Hero } from "./components/Hero.jsx";
import { ProjectsSection } from "./components/ProjectsSection.jsx";
import { ReadingProgress } from "./components/ReadingProgress.jsx";
import { ToolboxSection } from "./components/ToolboxSection.jsx";
import { certifications, education, experience } from "./data/experience.js";
import { sectionById, sections } from "./data/nav.js";
import { bio, profile, stats } from "./data/profile.js";
import { projects } from "./data/projects.js";
import { skills } from "./data/skills.js";
import { useScrollReveal } from "./hooks/useScrollReveal.js";

function App() {
  useScrollReveal();

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to main content
      </a>
      <ReadingProgress />
      <Header profile={profile} sections={sections} />

      <main id="main" tabIndex={-1}>
        <Hero profile={profile} pageCount={sections.length + 1} />
        <AboutSection section={sectionById.about} bio={bio} stats={stats} />
        <ProjectsSection section={sectionById.work} projects={projects} />
        <ExperienceSection
          section={sectionById.experience}
          experience={experience}
          education={education}
          certifications={certifications}
          linkedinUrl={profile.social.linkedin}
        />
        <ToolboxSection section={sectionById.toolbox} skills={skills} />
        <ContactSection section={sectionById.contact} profile={profile} />
      </main>

      <Footer profile={profile} />
    </>
  );
}

export default App;
