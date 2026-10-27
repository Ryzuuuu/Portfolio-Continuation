import PropTypes from "prop-types";
import { ArrowDownRight } from "lucide-react";
import { projectShape, sectionShape } from "../lib/propTypes.js";
import { ProjectCard } from "./ProjectCard.jsx";
import { Reveal } from "./Reveal.jsx";
import { SectionKicker } from "./SectionKicker.jsx";

export function ProjectsSection({ section, projects }) {
  return (
    <section className="work section-pad" id={section.id} aria-labelledby="work-title">
      <SectionKicker section={section} />
      <div className="work__heading">
        <Reveal>
          <h2 id="work-title">
            Systems
            <br />
            with <em>purpose.</em>
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p>
            Production-minded engineering: analytics from CCTV streams and parametric BIM geometry
            for an open-source bridge-design tool.
          </p>
        </Reveal>
      </div>
      <div className="project-grid">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} total={projects.length} />
        ))}
      </div>
      <Reveal className="work__foot">
        <span className="mono">MORE EXPERIMENTS IN THE MAKING</span>
        <span className="work__arrow" aria-hidden="true">
          <ArrowDownRight size={23} />
        </span>
      </Reveal>
    </section>
  );
}

ProjectsSection.propTypes = {
  section: sectionShape.isRequired,
  projects: PropTypes.arrayOf(projectShape).isRequired,
};
