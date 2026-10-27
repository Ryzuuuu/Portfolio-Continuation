import { sectionShape } from "../lib/propTypes.js";

/** "01 — THE ORIGIN STORY": numbered from src/data/nav.js, like the header nav. */
export function SectionKicker({ section }) {
  return (
    <div className="section-kicker mono">
      <span>
        {section.number} — {section.kicker}
      </span>
      <span>{section.kickerAside}</span>
    </div>
  );
}

SectionKicker.propTypes = {
  section: sectionShape.isRequired,
};
