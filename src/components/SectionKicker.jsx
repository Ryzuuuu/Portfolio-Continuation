import { sectionShape } from "../lib/propTypes.js";

/**
 * "01 — THE ORIGIN STORY": numbered from src/data/nav.js, like the header nav, with the
 * section's kanji chapter title drawn large behind it.
 */
export function SectionKicker({ section }) {
  return (
    <>
      <div className="section-kicker mono">
        <span>
          {section.number} — {section.kicker}
        </span>
        <span>{section.kickerAside}</span>
      </div>
      {section.kanji && (
        <span className="chapter-mark" aria-hidden="true">
          {section.kanji}
        </span>
      )}
    </>
  );
}

SectionKicker.propTypes = {
  section: sectionShape.isRequired,
};
