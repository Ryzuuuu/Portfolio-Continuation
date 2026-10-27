import PropTypes from "prop-types";
import { ArrowUpRight } from "lucide-react";
import { formatMonth } from "../lib/format.js";
import { sectionShape } from "../lib/propTypes.js";
import { Doodle } from "./Doodle.jsx";
import { HeadingLine } from "./HeadingLine.jsx";
import { Reveal } from "./Reveal.jsx";
import { SectionKicker } from "./SectionKicker.jsx";

function DateRange({ start, end }) {
  return (
    <>
      <time dateTime={start}>{formatMonth(start)}</time> —{" "}
      {end ? <time dateTime={end}>{formatMonth(end)}</time> : "PRESENT"}
    </>
  );
}

DateRange.propTypes = {
  start: PropTypes.string.isRequired,
  end: PropTypes.string,
};

export function ExperienceSection({ section, experience, education, certifications, linkedinUrl }) {
  return (
    <section className="experience section-pad" id={section.id} aria-labelledby="experience-title">
      <SectionKicker section={section} />
      <div className="experience__heading">
        <Reveal>
          <p className="eyebrow">
            <span className="eyebrow__line" /> THE WORK BEHIND THE WORK
          </p>
          <h2 id="experience-title">
            <HeadingLine>Learning by</HeadingLine>{" "}
            <HeadingLine>
              <em>
                shipping.
                <Doodle variant="underline" />
              </em>
            </HeadingLine>
          </h2>
        </Reveal>
        <Reveal delay={100}>
          <p className="experience__intro">
            Working across AI, software, and engineering—with a bias toward building, testing, and
            making the details hold up.
          </p>
        </Reveal>
      </div>
      <div className="timeline">
        {experience.map((item, index) => (
          <Reveal className="timeline__item" delay={index * 90} key={item.id}>
            <div className="timeline__date mono">
              <DateRange start={item.start} end={item.end} />
              <br />
              <span>{item.location}</span>
            </div>
            <div className="timeline__body">
              <p className="timeline__eyebrow mono">{item.role}</p>
              <h3>
                {item.organization}
                {item.organizationDetail && (
                  <>
                    {" "}
                    <span>{item.organizationDetail}</span>
                  </>
                )}
              </h3>
              <ul>
                {item.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
      <div className="experience__bottom">
        <Reveal className="education-card">
          <span className="timeline__eyebrow mono">EDUCATION</span>
          <h3>{education.school}</h3>
          <p>
            {education.degree} · {education.years}
          </p>
          <span className="education-card__score mono">{education.score}</span>
        </Reveal>
        <Reveal className="cert-card" delay={100}>
          <span className="timeline__eyebrow mono">SELECTED CERTIFICATIONS</span>
          <p>{certifications.join(" · ")}</p>
          <a className="text-link" href={linkedinUrl} target="_blank" rel="noreferrer">
            MORE ON LINKEDIN <span className="visually-hidden">(opens in a new tab)</span>
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}

ExperienceSection.propTypes = {
  section: sectionShape.isRequired,
  experience: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      start: PropTypes.string.isRequired,
      end: PropTypes.string,
      location: PropTypes.string.isRequired,
      role: PropTypes.string.isRequired,
      organization: PropTypes.string.isRequired,
      organizationDetail: PropTypes.string,
      highlights: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ).isRequired,
  education: PropTypes.shape({
    school: PropTypes.string.isRequired,
    degree: PropTypes.string.isRequired,
    years: PropTypes.string.isRequired,
    score: PropTypes.string,
  }).isRequired,
  certifications: PropTypes.arrayOf(PropTypes.string).isRequired,
  linkedinUrl: PropTypes.string.isRequired,
};
