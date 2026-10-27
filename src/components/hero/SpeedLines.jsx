import PropTypes from "prop-types";
import { buildBurst } from "../../lib/burst.js";

// Two differently seeded frames let CSS flicker between them, the way anime boils lines.
const FRAME_A = buildBurst({ seed: 7, count: 118 });
const FRAME_B = buildBurst({ seed: 23, count: 118 });

export function SpeedLines({ className }) {
  return (
    <svg className={className} viewBox="-100 -100 200 200" aria-hidden="true" focusable="false">
      <path className="speedlines__frame speedlines__frame--a" d={FRAME_A} />
      <path className="speedlines__frame speedlines__frame--b" d={FRAME_B} />
    </svg>
  );
}

SpeedLines.propTypes = {
  className: PropTypes.string,
};
