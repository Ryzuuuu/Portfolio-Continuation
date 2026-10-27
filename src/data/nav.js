// The single source of section numbering: the header nav and every section kicker read
// from this list, so they can't drift apart. Reorder here and both follow.
export const sections = [
  {
    id: "about",
    navLabel: "THE STORY",
    kicker: "THE ORIGIN STORY",
    kickerAside: "AI/ML · BACKEND · COMPUTER VISION",
  },
  {
    id: "work",
    navLabel: "SELECTED WORK",
    kicker: "SELECTED PROJECTS",
    kickerAside: "BUILT, TESTED, VALIDATED",
  },
  {
    id: "experience",
    navLabel: "EXPERIENCE",
    kicker: "FIELD NOTES",
    kickerAside: "EXPERIENCE · EDUCATION",
  },
  {
    id: "toolbox",
    navLabel: "TOOLBOX",
    kicker: "THE TOOLBOX",
    kickerAside: "FAMILIAR, NOT PRECIOUS",
  },
  {
    id: "contact",
    navLabel: "SAY HELLO",
    kicker: "YOUR MOVE",
    kickerAside: "THE NEXT CHAPTER",
  },
].map((section, index) => ({ ...section, number: String(index + 1).padStart(2, "0") }));

export const sectionById = Object.fromEntries(sections.map((section) => [section.id, section]));
