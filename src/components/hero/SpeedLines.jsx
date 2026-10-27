import PropTypes from "prop-types";

// Manga "concentration lines" (集中線): tapered wedges aimed at the centre. Two
// differently seeded frames let CSS flicker between them, the way anime boils them.

function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const point = (radius, angle) =>
  `${(radius * Math.cos(angle)).toFixed(2)} ${(radius * Math.sin(angle)).toFixed(2)}`;

function buildLines(seed, count) {
  const random = seededRandom(seed);
  const outer = 142; // past the corners of the -100..100 viewBox
  let d = "";
  for (let i = 0; i < count; i += 1) {
    const angle = ((i + random() * 0.8) / count) * Math.PI * 2;
    const inner = 46 + random() ** 1.6 * 40;
    const halfWidth = (0.0025 + random() ** 3 * 0.016) * Math.PI;
    d += `M${point(inner, angle)}L${point(outer, angle - halfWidth)}L${point(outer, angle + halfWidth)}Z`;
  }
  return d;
}

const FRAME_A = buildLines(7, 118);
const FRAME_B = buildLines(23, 118);

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
