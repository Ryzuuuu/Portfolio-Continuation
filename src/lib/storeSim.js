// A small, deterministic simulation behind the StoreSight figure: synthetic visitors walk
// a store floor, dwell in zones and sometimes queue and buy. It produces the same shape of
// numbers the real API serves (a four-stage funnel and per-zone visit frequency, 0–100),
// but none of it is real data. Floor coordinates are abstract units, origin top-left.

export const STORE = { width: 100, height: 60, door: { x: 50, halfWidth: 6 } };

// `weight` is how likely a visitor is to include the zone in their route.
export const ZONES = [
  { id: "SKINCARE", x: 4, y: 4, w: 28, h: 22, weight: 1 },
  { id: "FRAGRANCE", x: 36, y: 4, w: 28, h: 22, weight: 0.8 },
  { id: "MAKEUP", x: 68, y: 4, w: 28, h: 22, weight: 1.25 },
  { id: "HAIRCARE", x: 4, y: 34, w: 28, h: 22, weight: 0.45 },
  { id: "BILLING", x: 68, y: 34, w: 28, h: 22, checkout: true },
];

const BILLING_INDEX = ZONES.findIndex((zone) => zone.checkout);
const PRODUCT_ZONES = ZONES.map((zone, index) => ({ zone, index })).filter(
  ({ zone }) => !zone.checkout
);

const MAX_VISITORS = 12;
const WALK_SPEED = 12; // floor units per second
const TRAIL_INTERVAL = 0.09; // seconds between trail samples
const TRAIL_LENGTH = 7;
const BOUNCE_RATE = 0.12; // walks in, looks around, leaves
const QUEUE_RATE = 0.62; // of those who visited a zone, how many join the billing queue
const PURCHASE_RATE = 0.72; // of those who queue, how many buy (the rest abandon)

/** mulberry32: a tiny seeded generator, so every visit to the page plays the same store. */
function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (random, min, max) => min + random() * (max - min);

function pointInZone(random, zone, inset = 4) {
  return {
    x: between(random, zone.x + inset, zone.x + zone.w - inset),
    y: between(random, zone.y + inset, zone.y + zone.h - inset),
  };
}

/** Picks 1–3 distinct product zones, weighted, in visiting order. */
function pickRoute(random) {
  const pool = [...PRODUCT_ZONES];
  const count = Math.min(pool.length, 1 + Math.floor(random() * 3));
  const route = [];
  for (let step = 0; step < count; step += 1) {
    const total = pool.reduce((sum, { zone }) => sum + zone.weight, 0);
    let roll = random() * total;
    const choice = pool.findIndex(({ zone }) => (roll -= zone.weight) <= 0);
    route.push(pool.splice(choice < 0 ? pool.length - 1 : choice, 1)[0].index);
  }
  return route;
}

function spawnVisitor(sim) {
  const { random } = sim;
  const stops = [];

  if (random() < BOUNCE_RATE) {
    stops.push({
      zone: null,
      x: between(random, 41, 59),
      y: between(random, 42, 50),
      dwell: between(random, 0.8, 2),
    });
  } else {
    pickRoute(random).forEach((index) => {
      stops.push({
        zone: index,
        ...pointInZone(random, ZONES[index]),
        dwell: between(random, 2.5, 7),
      });
    });
    if (random() < QUEUE_RATE) {
      stops.push({
        zone: BILLING_INDEX,
        ...pointInZone(random, ZONES[BILLING_INDEX]),
        dwell: between(random, 3, 6.5),
      });
    }
  }
  stops.push({ exit: true, x: STORE.door.x + between(random, -3, 3), y: STORE.height + 1 });

  const x = STORE.door.x + between(random, -3, 3);
  sim.visitors.push({
    id: sim.nextId,
    x,
    y: STORE.height,
    trail: [],
    trailClock: 0,
    stops,
    stopIndex: 0,
    waiting: 0,
    dwelling: false,
    seenZone: false,
    buys: random() < PURCHASE_RATE,
    done: false,
  });
  sim.nextId += 1;
  sim.funnel.entry += 1;
}

function arrive(sim, visitor, stop) {
  if (stop.exit) {
    visitor.done = true;
    return;
  }
  if (stop.zone !== null) {
    sim.zoneStats[stop.zone].visits += 1;
    if (stop.zone === BILLING_INDEX) {
      sim.funnel.queue += 1;
      sim.queueDepth += 1;
    } else if (!visitor.seenZone) {
      visitor.seenZone = true;
      sim.funnel.zoneVisit += 1;
    }
  }
  visitor.dwelling = true;
  visitor.waiting = stop.dwell;
}

function leave(sim, visitor, stop) {
  if (stop.zone === BILLING_INDEX) {
    sim.queueDepth -= 1;
    if (visitor.buys) sim.funnel.purchase += 1;
  }
  visitor.dwelling = false;
  visitor.stopIndex += 1;
}

function advance(sim, visitor, dt) {
  const stop = visitor.stops[visitor.stopIndex];

  if (visitor.dwelling) {
    visitor.waiting -= dt;
    if (stop.zone !== null) sim.zoneStats[stop.zone].dwell += dt;
    if (visitor.waiting <= 0) leave(sim, visitor, stop);
  } else {
    const dx = stop.x - visitor.x;
    const dy = stop.y - visitor.y;
    const distance = Math.hypot(dx, dy);
    const reach = WALK_SPEED * dt;
    if (distance <= reach) {
      visitor.x = stop.x;
      visitor.y = stop.y;
      arrive(sim, visitor, stop);
    } else {
      visitor.x += (dx / distance) * reach;
      visitor.y += (dy / distance) * reach;
    }
  }

  visitor.trailClock += dt;
  if (visitor.trailClock >= TRAIL_INTERVAL) {
    visitor.trailClock = 0;
    visitor.trail.push([visitor.x, visitor.y]);
    if (visitor.trail.length > TRAIL_LENGTH) visitor.trail.shift();
  }
}

/** Moves the store forward by `dt` seconds. Mutates and returns `sim`. */
export function stepStoreSim(sim, dt) {
  sim.time += dt;
  sim.spawnIn -= dt;
  if (sim.spawnIn <= 0) {
    if (sim.visitors.length < MAX_VISITORS) spawnVisitor(sim);
    // Exponential gaps between arrivals, like a Poisson door.
    sim.spawnIn = 0.7 - Math.log(1 - sim.random()) * 1.5;
  }
  sim.visitors.forEach((visitor) => advance(sim, visitor, dt));
  sim.visitors = sim.visitors.filter((visitor) => !visitor.done);
  return sim;
}

/** A new store. `prewarm` runs it for that many seconds first, so it never starts empty. */
export function createStoreSim({ seed = 11, prewarm = 0 } = {}) {
  const sim = {
    random: seededRandom(seed),
    time: 0,
    nextId: 1,
    spawnIn: 0.3,
    visitors: [],
    zoneStats: ZONES.map(() => ({ visits: 0, dwell: 0 })),
    funnel: { entry: 0, zoneVisit: 0, queue: 0, purchase: 0 },
    queueDepth: 0,
  };
  for (let elapsed = 0; elapsed < prewarm; elapsed += 0.1) stepStoreSim(sim, 0.1);
  return sim;
}

/** An immutable view of the store for rendering. */
export function snapshotStoreSim(sim) {
  const busiest = Math.max(1, ...PRODUCT_ZONES.map(({ index }) => sim.zoneStats[index].visits));
  return {
    time: sim.time,
    funnel: { ...sim.funnel },
    queueDepth: sim.queueDepth,
    conversion: sim.funnel.entry ? sim.funnel.purchase / sim.funnel.entry : NaN,
    zones: ZONES.map((zone, index) => {
      const { visits, dwell } = sim.zoneStats[index];
      return {
        ...zone,
        visits,
        // The API's heatmap scale: visit frequency relative to the busiest zone, 0–100.
        heat: zone.checkout ? null : Math.round((visits / busiest) * 100),
        avgDwell: visits ? dwell / visits : 0,
      };
    }),
    visitors: sim.visitors.map(({ id, x, y, trail, dwelling }) => ({
      id,
      x,
      y,
      dwelling,
      trail: trail.map(([px, py]) => [px, py]),
    })),
  };
}
