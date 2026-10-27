import PropTypes from "prop-types";
import { ArrowUpRight } from "lucide-react";
import { pad2 } from "../lib/format.js";
import { projectShape } from "../lib/propTypes.js";
import { Reveal } from "./Reveal.jsx";
import { SpotlightCard } from "./SpotlightCard.jsx";

export function ProjectCard({ project, index, total }) {
  return (
    <Reveal delay={index * 90}>
      <SpotlightCard className={`project-card project-card--${project.color}`}>
        <div className="project-card__top">
          <span className="mono">
            {pad2(index + 1)} / {pad2(total)}
          </span>
          {project.repo && (
            <a
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              aria-label={`${project.title} source code on GitHub (opens in a new tab)`}
            >
              <ArrowUpRight size={19} aria-hidden="true" />
            </a>
          )}
        </div>
        <div className="project-card__art" aria-hidden="true">
          <span className="project-card__halftone" />
          <span className="project-card__mark">{project.mark}</span>
          {project.color === "coral" && <span className="project-orbit" />}
          {project.color === "blue" && <span className="project-grid-lines" />}
          {project.color === "yellow" && <span className="project-spark">✳</span>}
          <span className="project-card__speech">
            LET&apos;S
            <br />
            BUILD!
          </span>
        </div>
        <div className="project-card__body">
          <span className="project-card__type mono">{project.type}</span>
          <h3>{project.title}</h3>
          <p>{project.description}</p>
          <p className="project-card__impact">{project.impact}</p>
          <ul className="project-tags" aria-label="Built with">
            {project.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </div>
      </SpotlightCard>
    </Reveal>
  );
}

ProjectCard.propTypes = {
  project: projectShape.isRequired,
  index: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};
