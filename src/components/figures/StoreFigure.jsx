import { useEffect, useRef, useState } from "react";
import { useInView } from "../../hooks/useInView.js";
import { formatClock, formatPercent } from "../../lib/format.js";
import { prefersReducedMotion } from "../../lib/motion.js";
import { createStoreSim, snapshotStoreSim, stepStoreSim, STORE } from "../../lib/storeSim.js";
import { Icon } from "../Icon.jsx";

const UNIT = 10; // SVG units per floor unit
const PREWARM_SECONDS = 75; // the store opens mid-afternoon, not empty
const TIME_SCALE = 1.5;
const MAX_FRAME_SECONDS = 0.05; // a background tab shouldn't fast-forward the store

const STAGES = [
  { key: "entry", label: "Entry" },
  { key: "zoneVisit", label: "Zone visit" },
  { key: "queue", label: "Billing queue" },
  { key: "purchase", label: "Purchase" },
];

const openStore = () => createStoreSim({ prewarm: PREWARM_SECONDS });
const points = (trail) =>
  trail.map(([x, y]) => `${(x * UNIT).toFixed(1)},${(y * UNIT).toFixed(1)}`).join(" ");

/**
 * StoreSight's outputs, played back on synthetic visitors: a floor plan whose zones
 * shade with visit frequency, and the four-stage funnel the API serves. It only runs
 * while it's on screen, and waits for Play when reduced motion is on.
 */
export function StoreFigure() {
  const rootRef = useRef(null);
  const simRef = useRef(null);
  const inView = useInView(rootRef, "160px");
  const [playing, setPlaying] = useState(() => !prefersReducedMotion());
  // The store is seeded, so this first frame matches the one the loop starts from.
  const [view, setView] = useState(() => snapshotStoreSim(openStore()));
  const running = playing && inView;

  useEffect(() => {
    if (!running || typeof requestAnimationFrame !== "function") return undefined;
    simRef.current ??= openStore();
    let frame = 0;
    let last = performance.now();
    function loop(now) {
      const dt = Math.min(MAX_FRAME_SECONDS, (now - last) / 1000);
      last = now;
      setView(snapshotStoreSim(stepStoreSim(simRef.current, dt * TIME_SCALE)));
      frame = requestAnimationFrame(loop);
    }
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  function handleReset() {
    simRef.current = createStoreSim();
    setView(snapshotStoreSim(simRef.current));
  }

  const { funnel, zones, visitors, queueDepth, conversion, time } = view;
  const width = STORE.width * UNIT;
  const height = STORE.height * UNIT;
  const doorLeft = (STORE.door.x - STORE.door.halfWidth) * UNIT;
  const doorRight = (STORE.door.x + STORE.door.halfWidth) * UNIT;

  return (
    <div className="store" ref={rootRef}>
      <svg
        className="store__floor"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Simulated store floor plan. Dots are synthetic visitors walking between four product zones and the billing counter; each zone is shaded by how often it is visited."
      >
        {zones.map((zone) => (
          <g key={zone.id}>
            <rect
              className={zone.checkout ? "store__zone store__zone--checkout" : "store__zone"}
              x={zone.x * UNIT}
              y={zone.y * UNIT}
              width={zone.w * UNIT}
              height={zone.h * UNIT}
              style={zone.checkout ? undefined : { fillOpacity: 0.04 + (zone.heat / 100) * 0.36 }}
            />
            <text className="store__zone-id" x={zone.x * UNIT + 14} y={zone.y * UNIT + 30}>
              {zone.id}
            </text>
            <text
              className="store__zone-value"
              x={(zone.x + zone.w) * UNIT - 14}
              y={(zone.y + zone.h) * UNIT - 16}
              textAnchor="end"
            >
              {zone.checkout ? `Q ${queueDepth}` : zone.heat}
            </text>
          </g>
        ))}

        {/* Walls, with a gap for the door */}
        <path
          className="store__wall"
          d={`M${doorLeft} ${height}H0V0H${width}V${height}H${doorRight}`}
        />
        <path
          className="store__door"
          d={`M${doorLeft} ${height - 12}v24M${doorRight} ${height - 12}v24`}
        />
        <text className="store__zone-id" x={doorRight + 16} y={height - 18}>
          ENTRY
        </text>

        {visitors.map((visitor) => (
          <g key={visitor.id}>
            <polyline className="store__trail" points={points(visitor.trail)} />
            <circle
              className={visitor.dwelling ? "store__visitor is-dwelling" : "store__visitor"}
              cx={(visitor.x * UNIT).toFixed(1)}
              cy={(visitor.y * UNIT).toFixed(1)}
              r="8"
            />
          </g>
        ))}
      </svg>

      <div className="store__panel">
        <p className="figure__panel-title mono">Funnel</p>
        <ol className="funnel">
          {STAGES.map(({ key, label }) => {
            const share = funnel.entry ? funnel[key] / funnel.entry : 0;
            return (
              <li key={key} className={key === "purchase" ? "is-final" : undefined}>
                <span className="funnel__label">{label}</span>
                <span className="funnel__count mono">{funnel[key]}</span>
                <span className="funnel__share mono">{formatPercent(share)}</span>
                <span className="funnel__bar" style={{ "--share": share }} aria-hidden="true" />
              </li>
            );
          })}
        </ol>

        <dl className="store__stats">
          <div>
            <dt>Conversion</dt>
            <dd className="mono">{formatPercent(conversion)}</dd>
          </div>
          <div>
            <dt>Queue depth</dt>
            <dd className="mono">{queueDepth}</dd>
          </div>
          <div>
            <dt>Clock</dt>
            <dd className="mono">{formatClock(time)}</dd>
          </div>
        </dl>

        <div className="figure__actions">
          <button
            className="chip-button"
            type="button"
            onClick={() => setPlaying((value) => !value)}
          >
            <Icon name={playing ? "pause" : "play"} size={14} />
            {playing ? "Pause" : "Play"}
          </button>
          <button className="chip-button" type="button" onClick={handleReset}>
            <Icon name="reset" size={14} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
