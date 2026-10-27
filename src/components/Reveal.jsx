import PropTypes from "prop-types";

export function Reveal({ children, className = "", delay = 0 }) {
  return (
    <div className={`reveal ${className}`} data-reveal style={{ "--reveal-delay": `${delay}ms` }}>
      {children}
    </div>
  );
}

Reveal.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  delay: PropTypes.number,
};
