import { describe, expect, it } from "vitest";
import { formatClock, formatMetres, formatMonth, formatPercent } from "../format.js";
import { createStoreSim, snapshotStoreSim, stepStoreSim, STORE, ZONES } from "../storeSim.js";

const run = (sim, seconds, dt = 0.1) => {
  for (let elapsed = 0; elapsed < seconds; elapsed += dt) stepStoreSim(sim, dt);
  return sim;
};

describe("store simulation", () => {
  it("starts empty", () => {
    const view = snapshotStoreSim(createStoreSim());

    expect(view.visitors).toEqual([]);
    expect(view.funnel).toEqual({ entry: 0, zoneVisit: 0, queue: 0, purchase: 0 });
    expect(view.conversion).toBeNaN();
    expect(view.zones.map((zone) => zone.id)).toEqual(ZONES.map((zone) => zone.id));
  });

  it("is deterministic for a given seed", () => {
    const a = snapshotStoreSim(run(createStoreSim({ seed: 3 }), 120));
    const b = snapshotStoreSim(run(createStoreSim({ seed: 3 }), 120));
    const c = snapshotStoreSim(run(createStoreSim({ seed: 4 }), 120));

    expect(a).toEqual(b);
    expect(a).not.toEqual(c);
  });

  it("prewarms to the same state as stepping by hand", () => {
    const prewarmed = snapshotStoreSim(createStoreSim({ prewarm: 30 }));
    const stepped = snapshotStoreSim(run(createStoreSim(), 30));

    expect(prewarmed).toEqual(stepped);
    expect(prewarmed.funnel.entry).toBeGreaterThan(0);
  });

  it("only ever narrows the funnel", () => {
    const sim = createStoreSim();
    for (let step = 0; step < 6000; step += 1) {
      stepStoreSim(sim, 0.05);
      const { entry, zoneVisit, queue, purchase } = sim.funnel;
      expect(zoneVisit).toBeLessThanOrEqual(entry);
      expect(queue).toBeLessThanOrEqual(zoneVisit);
      expect(purchase).toBeLessThanOrEqual(queue);
      expect(sim.queueDepth).toBeGreaterThanOrEqual(0);
    }
    expect(sim.funnel.purchase).toBeGreaterThan(0);
  });

  it("keeps visitors on the floor and the crowd bounded", () => {
    const sim = createStoreSim();
    for (let step = 0; step < 4000; step += 1) {
      stepStoreSim(sim, 0.05);
      expect(sim.visitors.length).toBeLessThanOrEqual(12);
      sim.visitors.forEach(({ x, y }) => {
        expect(x).toBeGreaterThanOrEqual(0);
        expect(x).toBeLessThanOrEqual(STORE.width);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(STORE.height + 1);
      });
    }
  });

  it("scores zones 0–100 against the busiest one and leaves billing unscored", () => {
    const { zones, conversion, funnel } = snapshotStoreSim(run(createStoreSim(), 600));
    const scores = zones.filter((zone) => !zone.checkout).map((zone) => zone.heat);

    expect(Math.max(...scores)).toBe(100);
    scores.forEach((score) => {
      expect(Number.isInteger(score)).toBe(true);
      expect(score).toBeGreaterThanOrEqual(0);
    });
    expect(zones.find((zone) => zone.checkout).heat).toBeNull();
    expect(conversion).toBeCloseTo(funnel.purchase / funnel.entry);
  });

  it("returns snapshots that later steps can't change", () => {
    const sim = run(createStoreSim(), 20);
    const before = snapshotStoreSim(sim);
    const copy = JSON.parse(JSON.stringify(before));

    run(sim, 20);
    expect(JSON.parse(JSON.stringify(before))).toEqual(copy);
  });
});

describe("formatters", () => {
  it("formats months, metres, percentages and clocks", () => {
    expect(formatMonth("2026-09")).toBe("SEP 2026");
    expect(formatMetres(9600)).toBe("9.60 m");
    expect(formatPercent(0.3925)).toBe("39%");
    expect(formatPercent(NaN)).toBe("—");
    expect(formatClock(252.9)).toBe("04:12");
  });
});
