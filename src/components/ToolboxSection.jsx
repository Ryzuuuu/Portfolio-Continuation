import PropTypes from "prop-types";
import { ArrowUpRight, Asterisk } from "lucide-react";
import { sectionShape } from "../lib/propTypes.js";
import { Doodle } from "./Doodle.jsx";
import { HeadingLine } from "./HeadingLine.jsx";
import { Reveal } from "./Reveal.jsx";
import { SectionKicker } from "./SectionKicker.jsx";

const MARQUEE_REPEATS = 4;

export function ToolboxSection({ section, skills }) {
  return (
    <section className="toolbox section-pad" id={section.id} aria-labelledby="toolbox-title">
      <SectionKicker section={section} />
      <div className="toolbox__grid">
        <Reveal>
          <p className="eyebrow">
            <span className="eyebrow__line" /> THE RIGHT TOOL FOR THE PROBLEM
          </p>
          <h2 id="toolbox-title">
            <HeadingLine>From raw</HeadingLine> <HeadingLine>signal to</HeadingLine>{" "}
            <HeadingLine>
              <em>
                systems.
                <Doodle variant="double" />
              </em>
            </HeadingLine>
          </h2>
        </Reveal>
        <Reveal className="toolbox__details" delay={120}>
          <p>
            Python and backend systems are my home base. I work across ML, computer vision, data,
            cloud, and web to take ideas from experiment to dependable service.
          </p>
          <ul className="skill-list" aria-label="Skills">
            {skills.map((skill) => (
              <li className="skill-pill" key={skill}>
                <i aria-hidden="true" />
                {skill}
              </li>
            ))}
          </ul>
          <div className="toolbox__callout">
            <span className="toolbox__callout-mark" aria-hidden="true">
              !
            </span>
            <span>
              TESTED BY DESIGN
              <br />
              <small>BUILT TO WORK IN THE REAL WORLD</small>
            </span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </div>
        </Reveal>
      </div>
      <div className="marquee">
        <p className="visually-hidden">Build with intent, test with care, ship what matters.</p>
        <div className="marquee__track" aria-hidden="true">
          {Array.from({ length: MARQUEE_REPEATS }, (_, index) => (
            <span key={index}>
              BUILD WITH INTENT <Asterisk size={24} /> TEST WITH CARE <Asterisk size={24} /> SHIP
              WHAT MATTERS <Asterisk size={24} />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

ToolboxSection.propTypes = {
  section: sectionShape.isRequired,
  skills: PropTypes.arrayOf(PropTypes.string).isRequired,
};
