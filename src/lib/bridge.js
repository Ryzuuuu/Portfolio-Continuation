// Geometry for the ParaBridge figure: the cross-section of a composite steel-girder bridge
// at a pier. A handful of inputs drive every dimension, the way the project's BridgeConfig
// does. All lengths are millimetres. `y` runs across the deck (0 at the centreline) and
// `z` is the height above ground (the top of the pile cap).

export const BRIDGE_PARAMS = [
  { key: "girders", label: "Girders", min: 3, max: 5, step: 1, unit: "count" },
  { key: "spacing", label: "Girder spacing", min: 2000, max: 3000, step: 100, unit: "mm" },
  { key: "girderDepth", label: "Girder depth", min: 600, max: 1200, step: 50, unit: "mm" },
  { key: "pierHeight", label: "Pier height", min: 3000, max: 5000, step: 250, unit: "mm" },
];

export const BRIDGE_DEFAULTS = { girders: 4, spacing: 2600, girderDepth: 900, pierHeight: 4250 };

// Not adjustable in the figure. Plate thicknesses are drawn heavier than life so the
// I-sections still read at this scale.
export const BRIDGE_FIXED = {
  overhang: 900,
  deckThickness: 220,
  topFlange: 300,
  bottomFlange: 440,
  flangeThickness: 60,
  webThickness: 24,
  bearing: 110,
  capOverhang: 450,
  capHead: 420,
  capTaper: 520,
  pierDiameter: 1300,
  pileCapWidth: 4200,
  pileCapDepth: 800,
  pileDiameter: 620,
  pileOffset: 1250,
  pileShown: 1000,
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/** Snaps raw input to each parameter's range and step; missing values fall back to defaults. */
export function normalizeBridgeParams(params = {}) {
  return Object.fromEntries(
    BRIDGE_PARAMS.map(({ key, min, max, step }) => {
      const raw = Number(params[key]);
      const value = Number.isFinite(raw) ? raw : BRIDGE_DEFAULTS[key];
      return [key, clamp(Math.round((value - min) / step) * step + min, min, max)];
    })
  );
}

/** Everything the drawing needs, derived from the four inputs. */
export function deriveBridge(params) {
  const { girders, spacing, girderDepth, pierHeight } = normalizeBridgeParams(params);
  const f = BRIDGE_FIXED;

  const girderRun = (girders - 1) * spacing;
  const deckWidth = girderRun + 2 * f.overhang;
  const capWidth = girderRun + f.bottomFlange + 2 * f.capOverhang;

  const capBottom = pierHeight;
  const capShoulder = capBottom + f.capTaper;
  const capTop = capShoulder + f.capHead;
  const girderBottom = capTop + f.bearing;
  const girderTop = girderBottom + girderDepth;
  const deckTop = girderTop + f.deckThickness;

  return {
    params: { girders, spacing, girderDepth, pierHeight },
    deckWidth,
    capWidth,
    girderY: Array.from({ length: girders }, (_, index) => index * spacing - girderRun / 2),
    levels: {
      pileTip: -(f.pileCapDepth + f.pileShown),
      pileCapBottom: -f.pileCapDepth,
      ground: 0,
      capBottom,
      capShoulder,
      capTop,
      girderBottom,
      girderTop,
      deckTop,
    },
  };
}

/** The tallest and widest the section can get, so the figure can use one fixed scale. */
export function bridgeEnvelope() {
  const max = Object.fromEntries(BRIDGE_PARAMS.map(({ key, max: limit }) => [key, limit]));
  const { deckWidth, capWidth, levels } = deriveBridge(max);
  return {
    width: Math.max(deckWidth, capWidth, BRIDGE_FIXED.pileCapWidth),
    top: levels.deckTop,
    bottom: levels.pileTip,
  };
}
