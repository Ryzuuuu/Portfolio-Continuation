import { describe, expect, it } from "vitest";
import {
  BRIDGE_DEFAULTS,
  BRIDGE_FIXED,
  BRIDGE_PARAMS,
  bridgeEnvelope,
  deriveBridge,
  normalizeBridgeParams,
} from "../bridge.js";

describe("normalizeBridgeParams", () => {
  it("keeps valid values and fills in missing ones", () => {
    expect(normalizeBridgeParams(BRIDGE_DEFAULTS)).toEqual(BRIDGE_DEFAULTS);
    expect(normalizeBridgeParams({ girders: 5 })).toEqual({ ...BRIDGE_DEFAULTS, girders: 5 });
    expect(normalizeBridgeParams()).toEqual(BRIDGE_DEFAULTS);
  });

  it("clamps to each range, snaps to each step and accepts strings", () => {
    const result = normalizeBridgeParams({
      girders: "99",
      spacing: 2449,
      girderDepth: -5,
      pierHeight: "not a number",
    });

    expect(result).toEqual({
      girders: 5,
      spacing: 2400,
      girderDepth: 600,
      pierHeight: BRIDGE_DEFAULTS.pierHeight,
    });
  });

  it("has defaults that sit on every parameter's own grid", () => {
    BRIDGE_PARAMS.forEach(({ key, min, max, step }) => {
      const value = BRIDGE_DEFAULTS[key];
      expect(value).toBeGreaterThanOrEqual(min);
      expect(value).toBeLessThanOrEqual(max);
      expect((value - min) % step).toBe(0);
    });
  });
});

describe("deriveBridge", () => {
  it("derives the deck width from the girder layout", () => {
    const { deckWidth, capWidth } = deriveBridge({ ...BRIDGE_DEFAULTS, girders: 4, spacing: 2600 });

    expect(deckWidth).toBe(3 * 2600 + 2 * BRIDGE_FIXED.overhang);
    expect(capWidth).toBe(3 * 2600 + BRIDGE_FIXED.bottomFlange + 2 * BRIDGE_FIXED.capOverhang);
  });

  it("spaces the girders evenly about the centreline", () => {
    const { girderY } = deriveBridge({ ...BRIDGE_DEFAULTS, girders: 5, spacing: 2000 });

    expect(girderY).toEqual([-4000, -2000, 0, 2000, 4000]);
    expect(deriveBridge({ ...BRIDGE_DEFAULTS, girders: 4 }).girderY).toHaveLength(4);
  });

  it("stacks every level in order, from pile tip to deck top", () => {
    const { levels } = deriveBridge(BRIDGE_DEFAULTS);
    const stack = [
      levels.pileTip,
      levels.pileCapBottom,
      levels.ground,
      levels.capBottom,
      levels.capShoulder,
      levels.capTop,
      levels.girderBottom,
      levels.girderTop,
      levels.deckTop,
    ];

    expect(stack).toEqual([...stack].sort((a, b) => a - b));
    expect(levels.capBottom).toBe(BRIDGE_DEFAULTS.pierHeight);
    expect(levels.girderTop - levels.girderBottom).toBe(BRIDGE_DEFAULTS.girderDepth);
  });

  it("raises the deck by exactly the change in pier height", () => {
    const low = deriveBridge({ ...BRIDGE_DEFAULTS, pierHeight: 3000 });
    const high = deriveBridge({ ...BRIDGE_DEFAULTS, pierHeight: 5000 });

    expect(high.levels.deckTop - low.levels.deckTop).toBe(2000);
    expect(high.deckWidth).toBe(low.deckWidth);
  });
});

describe("bridgeEnvelope", () => {
  it("contains every bridge the parameters allow", () => {
    const envelope = bridgeEnvelope();
    const extremes = (pick) =>
      Object.fromEntries(BRIDGE_PARAMS.map((param) => [param.key, param[pick]]));

    [extremes("min"), extremes("max"), BRIDGE_DEFAULTS].forEach((params) => {
      const { deckWidth, capWidth, levels } = deriveBridge(params);
      expect(deckWidth).toBeLessThanOrEqual(envelope.width);
      expect(capWidth).toBeLessThanOrEqual(envelope.width);
      expect(levels.deckTop).toBeLessThanOrEqual(envelope.top);
      expect(levels.pileTip).toBeGreaterThanOrEqual(envelope.bottom);
    });
  });
});
