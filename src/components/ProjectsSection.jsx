import PropTypes from "prop-types";
import { ArrowDownRight } from "lucide-react";
import { pad2 } from "../lib/format.js";
import { projectShape, sectionShape } from "../lib/propTypes.js";
import { Doodle } from "./Doodle.jsx";
import { BridgeFigure } from "./figures/BridgeFigure.jsx";
import { StoreFigure } from "./figures/StoreFigure.jsx";
import { HeadingLine } from "./HeadingLine.jsx";
import { ProjectCard } from "./ProjectCard.jsx";
import { Reveal } from "./Reveal.jsx";
import { SectionKicker } from "./SectionKicker.jsx";

// A small working model of each project, shown under the cards.
const FIGURES = [
  {
    id: "storesight",
    title: "STORESIGHT / THE EVENT MODEL, PLAYED BACK",
    note: "Synthetic visitors on an invented floor plan — not footage or store data.",
    Component: StoreFigure,
  },
  {
    id: "parabridge",
    title: "PARABRIDGE / PARAMETERS IN, GEOMETRY OUT",
    note: "A simplified section at a pier, redrawn from four parameters — not the CAD output.",
    Component: BridgeFigure,
  },
];

export function ProjectsSection({ section, projects }) {
  return (
    <section className="work section-pad" id={section.id} aria-labelledby="work-title">
      <SectionKicker section={section} />
      <div className="work__heading">
        <Reveal>
          <h2 id="work-title">
            <HeadingLine>Systems</HeadingLine>{" "}
            <HeadingLine>
              with{" "}
              <em>
                purpose.
                <Doodle variant="squiggle" />
              </em>
            </HeadingLine>
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
      <div className="project-figures">
        {FIGURES.map(({ id, title, note, Component }, index) => (
          <Reveal key={id}>
            <figure className={`project-figure project-figure--${id}`}>
              <figcaption className="mono">
                <span>
                  FIG. {pad2(index + 1)} — {title}
                </span>
                <span>TRY IT</span>
              </figcaption>
              <Component />
              <p className="project-figure__note">{note}</p>
            </figure>
          </Reveal>
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
