import PropTypes from "prop-types";

export const sectionShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  number: PropTypes.string.isRequired,
  navLabel: PropTypes.string.isRequired,
  kicker: PropTypes.string.isRequired,
  kickerAside: PropTypes.string.isRequired,
});

export const profileShape = PropTypes.shape({
  name: PropTypes.string.isRequired,
  initials: PropTypes.arrayOf(PropTypes.string).isRequired,
  tagline: PropTypes.string.isRequired,
  focus: PropTypes.string.isRequired,
  location: PropTypes.string.isRequired,
  edition: PropTypes.string.isRequired,
  email: PropTypes.string.isRequired,
  social: PropTypes.shape({
    github: PropTypes.string.isRequired,
    linkedin: PropTypes.string.isRequired,
  }).isRequired,
});

export const projectShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  impact: PropTypes.string.isRequired,
  color: PropTypes.oneOf(["coral", "blue", "yellow"]).isRequired,
  tags: PropTypes.arrayOf(PropTypes.string).isRequired,
  mark: PropTypes.string.isRequired,
  repo: PropTypes.string,
});
