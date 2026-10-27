// Manga "concentration lines" (集中線) as one SVG path of tapered wedges aimed at the
// centre of a -100..100 viewBox. Seeded, so every render draws the same lines.

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

/**
 * @param seed     any integer; different seeds give different line sets
 * @param count    number of wedges
 * @param inner    [min, max] radius where wedges start (0..100)
 * @param width    [min, max] angular half-width of each wedge, in fractions of π
 */
export function buildBurst({ seed, count, inner = [46, 86], width = [0.0025, 0.0185] }) {
  const random = seededRandom(seed);
  const outer = 142; // past the corners of the viewBox
  let d = "";
  for (let i = 0; i < count; i += 1) {
    const angle = ((i + random() * 0.8) / count) * Math.PI * 2;
    const start = inner[0] + random() ** 1.6 * (inner[1] - inner[0]);
    const half = (width[0] + random() ** 3 * (width[1] - width[0])) * Math.PI;
    d += `M${point(start, angle)}L${point(outer, angle - half)}L${point(outer, angle + half)}Z`;
  }
  return d;
}
