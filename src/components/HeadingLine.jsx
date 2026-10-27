import PropTypes from "prop-types";

/** One line of a section heading; it rises out of its own slot when the section reveals. */
export function HeadingLine({ children }) {
  return (
    <span className="h2-line">
      <span>{children}</span>
    </span>
  );
}

HeadingLine.propTypes = {
  children: PropTypes.node.isRequired,
};
