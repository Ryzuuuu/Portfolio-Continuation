import PropTypes from "prop-types";

// A handful of 16px line icons, drawn here so the site ships no icon library.
const PATHS = {
  "arrow-up-right": "M4.5 11.5l7-7M5.5 4.5h6v6",
  "arrow-down": "M8 3v10M3.5 8.5L8 13l4.5-4.5",
  "arrow-up": "M8 13V3M3.5 7.5L8 3l4.5 4.5",
  "arrow-right": "M3 8h10M8.5 3.5L13 8l-4.5 4.5",
  copy: "M5.5 5.5v-3h8v8h-3M2.5 5.5h8v8h-8z",
  check: "M3 8.5l3.2 3.2L13 4.8",
  play: "M5 3.5v9l7.5-4.5z",
  pause: "M5.5 3.5v9M10.5 3.5v9",
  reset: "M3 8a5 5 0 1 0 1.6-3.7M3 2.5v3h3",
};

export function Icon({ name, size = 16 }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

Icon.propTypes = {
  name: PropTypes.oneOf(Object.keys(PATHS)).isRequired,
  size: PropTypes.number,
};
