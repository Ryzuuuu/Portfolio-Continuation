import PropTypes from "prop-types";

// Hand-drawn marks for a heading's accent word, drawn in after the line rises.
const PATHS = {
  circle: [
    "M22 48C14 24 62 9 108 10c50 1 84 15 84 35 0 23-48 33-96 31C46 74 10 61 16 41c4-15 34-27 70-30",
  ],
  underline: ["M4 15C62 6 140 4 196 11"],
  squiggle: ["M4 13c11-9 21 7 32 0s21-9 32 0 21 9 32 0 21-9 32 0 21 9 32 0 21-9 30-2"],
  double: ["M5 11C70 4 132 4 195 9", "M24 20C82 14 140 14 182 18"],
};

export function Doodle({ variant }) {
  const viewBox = variant === "circle" ? "0 0 200 84" : "0 0 200 26";
  return (
    <svg
      className={`doodle doodle--${variant}`}
      viewBox={viewBox}
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[variant].map((d) => (
        <path key={d} d={d} pathLength="1" />
      ))}
    </svg>
  );
}

Doodle.propTypes = {
  variant: PropTypes.oneOf(Object.keys(PATHS)).isRequired,
};
