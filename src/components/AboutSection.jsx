import PropTypes from "prop-types";
import { ArrowRight, Asterisk } from "lucide-react";
import { Fragment } from "react";
import { sectionShape } from "../lib/propTypes.js";
import { CountUp } from "./CountUp.jsx";
import { Doodle } from "./Doodle.jsx";
import { HeadingLine } from "./HeadingLine.jsx";
import { Reveal } from "./Reveal.jsx";
import { SectionKicker } from "./SectionKicker.jsx";

export function AboutSection({ section, bio, stats }) {
  return (
    <section className="intro section-pad" id={section.id} aria-labelledby="about-title">
      <SectionKicker section={section} />
      <div className="intro__grid">
        <Reveal className="intro__heading">
          <p className="eyebrow">
            <span className="eyebrow__line" /> RAW DATA IN. USEFUL SYSTEMS OUT.
          </p>
          <h2 id="about-title">
            <HeadingLine>Make messy</HeadingLine> <HeadingLine>problems</HeadingLine>{" "}
            <HeadingLine>
              <em>
                make
                <Doodle variant="circle" />
              </em>
            </HeadingLine>{" "}
            <HeadingLine>sense.</HeadingLine>
          </h2>
          <span className="intro__asterisk" aria-hidden="true">
            <Asterisk size={34} />
          </span>
        </Reveal>
        <Reveal className="intro__text" delay={120}>
          {/* Words ink in one after another once the block is revealed (CSS stagger). */}
          <p className="intro__lead">
            {bio.lead.split(" ").map((word, index, words) => (
              <Fragment key={`${word}-${index}`}>
                <span className="ink-word" style={{ "--i": index }}>
                  {word}
                </span>
                {index < words.length - 1 && " "}
              </Fragment>
            ))}
          </p>
          {bio.paragraphs.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <a className="text-link" href="#experience">
            FOLLOW THE THREAD <ArrowRight size={16} aria-hidden="true" />
          </a>
        </Reveal>
      </div>
      <div className="stats-row">
        {stats.map((stat, index) => (
          <Reveal key={stat.label} delay={index * 80}>
            <div className="stat">
              <span className="stat__number">
                <CountUp value={stat.value} />
                <span className="stat__suffix">{stat.suffix}</span>
              </span>
              <span className="stat__label mono">{stat.label}</span>
            </div>
          </Reveal>
        ))}
        <Reveal delay={stats.length * 80}>
          <div className="stat stat__note">
            <span>
              BUILD WITH CARE.
              <br />
              VERIFY THE DETAILS.
            </span>
            <Asterisk size={26} aria-hidden="true" />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

AboutSection.propTypes = {
  section: sectionShape.isRequired,
  bio: PropTypes.shape({
    lead: PropTypes.string.isRequired,
    paragraphs: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  stats: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired,
      suffix: PropTypes.string,
      label: PropTypes.string.isRequired,
    })
  ).isRequired,
};
