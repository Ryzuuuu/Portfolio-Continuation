import PropTypes from "prop-types";
import { useId, useState } from "react";
import {
  BRIDGE_DEFAULTS,
  BRIDGE_FIXED,
  BRIDGE_PARAMS,
  bridgeEnvelope,
  deriveBridge,
  normalizeBridgeParams,
} from "../../lib/bridge.js";
import { useMediaQuery } from "../../hooks/useMediaQuery.js";
import { formatMetres } from "../../lib/format.js";
import { Icon } from "../Icon.jsx";

// One fixed drawing scale, chosen so the largest section the sliders allow still fits.
// Nothing rescales as you drag: the bridge itself grows and shrinks.
const VIEW = { width: 1000, height: 600 };
const MARGIN = { top: 100, right: 200, bottom: 22, left: 64 };
const ENVELOPE = bridgeEnvelope();
const SCALE = Math.min(
  (VIEW.height - MARGIN.top - MARGIN.bottom) / (ENVELOPE.top - ENVELOPE.bottom),
  (VIEW.width - MARGIN.left - MARGIN.right) / ENVELOPE.width
);
const CENTRE_X = MARGIN.left + (VIEW.width - MARGIN.left - MARGIN.right) / 2;
const GROUND_Y = VIEW.height - MARGIN.bottom + ENVELOPE.bottom * SCALE;
const LABEL_X = VIEW.width - MARGIN.right + 28;

const round = (value) => Math.round(value * 100) / 100;
const px = (y) => round(CENTRE_X + y * SCALE);
const py = (z) => round(GROUND_Y - z * SCALE);

/** SVG rect attributes for a box given in model space. */
const box = (y0, y1, zTop, zBottom) => ({
  x: px(y0),
  y: py(zTop),
  width: round((y1 - y0) * SCALE),
  height: round((zTop - zBottom) * SCALE),
});

const formatValue = (unit, value) => (unit === "mm" ? formatMetres(value) : String(value));

/** A dimension line with slashed ends and its value, horizontal or vertical. */
function Dimension({ from, to, at, vertical = false, label }) {
  const mid = (from + to) / 2;
  const tick = 4;
  if (vertical) {
    return (
      <g className="bridge__dim">
        <path
          d={`M${at} ${from}V${to}M${at - tick} ${from + tick}l${2 * tick} ${-2 * tick}M${at - tick} ${to + tick}l${2 * tick} ${-2 * tick}`}
        />
        <text x={at - 8} y={mid} textAnchor="middle" transform={`rotate(-90 ${at - 8} ${mid})`}>
          {label}
        </text>
      </g>
    );
  }
  return (
    <g className="bridge__dim">
      <path
        d={`M${from} ${at}H${to}M${from - tick} ${at + tick}l${2 * tick} ${-2 * tick}M${to - tick} ${at + tick}l${2 * tick} ${-2 * tick}`}
      />
      <text x={mid} y={at - 7} textAnchor="middle">
        {label}
      </text>
    </g>
  );
}

Dimension.propTypes = {
  from: PropTypes.number.isRequired,
  to: PropTypes.number.isRequired,
  at: PropTypes.number.isRequired,
  vertical: PropTypes.bool,
  label: PropTypes.string.isRequired,
};

/** A part name in the right-hand column, with a leader back to the part. */
function Callout({ x, z, children }) {
  const y = py(z);
  return (
    <g className="bridge__callout">
      <path d={`M${x} ${y}H${LABEL_X - 8}`} />
      <circle cx={x} cy={y} r="2.25" />
      <text x={LABEL_X} y={y + 4}>
        {children}
      </text>
    </g>
  );
}

Callout.propTypes = {
  x: PropTypes.number.isRequired,
  z: PropTypes.number.isRequired,
  children: PropTypes.node.isRequired,
};

/**
 * ParaBridge in miniature: a cross-section at a pier, redrawn from four parameters. The
 * deck and pier-cap widths aren't inputs; they follow from the girder layout.
 */
export function BridgeFigure() {
  const [params, setParams] = useState(BRIDGE_DEFAULTS);
  // On small screens the part names are dropped and the drawing fills the frame, with
  // larger lettering (see figures.css) and the dimension tiers spaced to suit.
  const compact = useMediaQuery("(max-width: 700px)");
  const tier = compact ? 1.6 : 1;
  const viewWidth = compact ? VIEW.width - MARGIN.right + 12 : VIEW.width;
  const id = useId().replace(/:/g, "");
  const hatchId = `${id}-hatch`;

  const f = BRIDGE_FIXED;
  const { deckWidth, capWidth, girderY, levels } = deriveBridge(params);
  const isDefault = BRIDGE_PARAMS.every(({ key }) => params[key] === BRIDGE_DEFAULTS[key]);

  function handleChange(key, value) {
    setParams((current) => normalizeBridgeParams({ ...current, [key]: value }));
  }

  const webTop = levels.girderTop - f.flangeThickness;
  const webBottom = levels.girderBottom + f.flangeThickness;
  const lastGirder = girderY[girderY.length - 1];
  const deckY = py(levels.deckTop);
  const groundLeft = px(-ENVELOPE.width / 2) - 24;
  const groundRight = px(ENVELOPE.width / 2) + 24;
  const capLeft = px(-f.pileCapWidth / 2);
  const capRight = px(f.pileCapWidth / 2);

  // Hatch marks under the ground line, either side of the pile cap.
  let groundHatch = "";
  for (let x = groundLeft + 6; x < groundRight; x += 14) {
    if (x > capLeft - 12 && x < capRight + 4) continue;
    groundHatch += `M${round(x)} ${GROUND_Y}l-7 8`;
  }

  const summary =
    `Cross-section of a steel-girder bridge at a pier: ${params.girders} girders at ` +
    `${formatMetres(params.spacing)} spacing under a ${formatMetres(deckWidth)} deck, ` +
    `on a ${formatMetres(params.pierHeight)} pier.`;

  return (
    <div className="bridge">
      <svg
        className="bridge__drawing"
        viewBox={`0 0 ${viewWidth} ${VIEW.height}`}
        role="img"
        aria-label={summary}
      >
        <defs>
          <pattern
            id={hatchId}
            width="7"
            height="7"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line className="bridge__hatch" x1="0" y1="0" x2="0" y2="7" />
          </pattern>
        </defs>

        {/* Ground, piles and pile cap */}
        <path className="bridge__ground" d={`M${groundLeft} ${GROUND_Y}H${groundRight}`} />
        <path className="bridge__ground-hatch" d={groundHatch} />
        {[-f.pileOffset, f.pileOffset].map((offset) => {
          const left = px(offset - f.pileDiameter / 2);
          const right = px(offset + f.pileDiameter / 2);
          const top = py(levels.pileCapBottom);
          const tip = py(levels.pileTip);
          const width = right - left;
          return (
            <g key={offset}>
              <rect
                x={left}
                y={top}
                width={width}
                height={tip - top}
                fill={`url(#${hatchId})`}
                stroke="none"
              />
              <path className="bridge__line" d={`M${left} ${top}V${tip}M${right} ${top}V${tip}`} />
              {/* Break line: the piles carry on below the drawing. */}
              <path
                className="bridge__line"
                d={`M${left - 5} ${tip}h${round(width * 0.4 + 5)}l3 -6l5 12l3 -6h${round(width * 0.6 - 6)}`}
              />
            </g>
          );
        })}
        <rect
          className="bridge__concrete"
          fill={`url(#${hatchId})`}
          {...box(-f.pileCapWidth / 2, f.pileCapWidth / 2, levels.ground, levels.pileCapBottom)}
        />

        {/* Pier and hammerhead cap */}
        <rect
          className="bridge__concrete"
          fill={`url(#${hatchId})`}
          {...box(-f.pierDiameter / 2, f.pierDiameter / 2, levels.capBottom, levels.ground)}
        />
        <polygon
          className="bridge__concrete"
          fill={`url(#${hatchId})`}
          points={[
            [-capWidth / 2, levels.capTop],
            [capWidth / 2, levels.capTop],
            [capWidth / 2, levels.capShoulder],
            [f.pierDiameter / 2, levels.capBottom],
            [-f.pierDiameter / 2, levels.capBottom],
            [-capWidth / 2, levels.capShoulder],
          ]
            .map(([y, z]) => `${px(y)},${py(z)}`)
            .join(" ")}
        />

        {/* Girders on their bearings, braced by X cross-frames */}
        {girderY.slice(0, -1).map((y, index) => {
          const next = girderY[index + 1];
          const x0 = px(y + f.webThickness / 2);
          const x1 = px(next - f.webThickness / 2);
          const top = py(webTop - 50);
          const bottom = py(webBottom + 50);
          return (
            <path
              key={y}
              className="bridge__frame"
              d={`M${x0} ${top}L${x1} ${bottom}M${x0} ${bottom}L${x1} ${top}`}
            />
          );
        })}
        {girderY.map((y) => (
          <g key={y}>
            <rect
              className="bridge__bearing"
              {...box(y - 150, y + 150, levels.girderBottom, levels.capTop)}
            />
            <rect
              className="bridge__steel"
              {...box(y - f.topFlange / 2, y + f.topFlange / 2, levels.girderTop, webTop)}
            />
            <rect
              className="bridge__steel"
              {...box(y - f.webThickness / 2, y + f.webThickness / 2, webTop, webBottom)}
            />
            <rect
              className="bridge__steel"
              {...box(
                y - f.bottomFlange / 2,
                y + f.bottomFlange / 2,
                webBottom,
                levels.girderBottom
              )}
            />
          </g>
        ))}

        {/* Deck slab */}
        <rect
          className="bridge__concrete"
          fill={`url(#${hatchId})`}
          {...box(-deckWidth / 2, deckWidth / 2, levels.deckTop, levels.girderTop)}
        />

        {/* Centreline */}
        <path
          className="bridge__centreline"
          d={`M${CENTRE_X} ${deckY - 10}V${py(levels.pileTip) + 10}`}
        />

        {/* Dimensions */}
        <path
          className="bridge__extension"
          d={
            `M${px(-deckWidth / 2)} ${deckY - 6}V${deckY - 52 * tier}` +
            `M${px(deckWidth / 2)} ${deckY - 6}V${deckY - 52 * tier}` +
            `M${px(girderY[0])} ${deckY - 6}V${deckY - 26 * tier}` +
            `M${px(girderY[1])} ${deckY - 6}V${deckY - 26 * tier}`
          }
        />
        <Dimension
          from={px(-deckWidth / 2)}
          to={px(deckWidth / 2)}
          at={deckY - 46 * tier}
          label={`deck ${formatMetres(deckWidth)}`}
        />
        <Dimension
          from={px(girderY[0])}
          to={px(girderY[1])}
          at={deckY - 20 * tier}
          label={formatMetres(params.spacing)}
        />
        <Dimension
          vertical
          from={py(levels.girderTop)}
          to={py(levels.girderBottom)}
          at={px(-deckWidth / 2) - 20}
          label={formatMetres(params.girderDepth)}
        />
        <Dimension
          vertical
          from={py(levels.capBottom)}
          to={py(levels.ground)}
          at={px(-f.pierDiameter / 2) - 22}
          label={formatMetres(params.pierHeight)}
        />

        {/* Part names */}
        {!compact && (
          <>
            <Callout x={px(deckWidth / 2)} z={(levels.deckTop + levels.girderTop) / 2}>
              RC deck slab
            </Callout>
            <Callout
              x={px(lastGirder + f.webThickness / 2)}
              z={(levels.girderTop + levels.girderBottom) / 2}
            >
              I-girders, cross-frames
            </Callout>
            <Callout x={px(capWidth / 2)} z={(levels.capTop + levels.capShoulder) / 2}>
              Hammerhead pier cap
            </Callout>
            <Callout x={px(f.pierDiameter / 2)} z={levels.capBottom * 0.45}>
              Circular pier
            </Callout>
            <Callout x={px(f.pileCapWidth / 2)} z={levels.pileCapBottom / 2}>
              Pile cap
            </Callout>
            <Callout
              x={px(f.pileOffset + f.pileDiameter / 2)}
              z={levels.pileCapBottom - f.pileShown * 0.55}
            >
              Pile group
            </Callout>
          </>
        )}
      </svg>

      <div className="bridge__panel">
        <p className="figure__panel-title mono">Parameters</p>
        <div className="bridge__controls">
          {BRIDGE_PARAMS.map(({ key, label, min, max, step, unit }) => (
            <div className="range" key={key}>
              <label htmlFor={`${id}-${key}`}>{label}</label>
              <output className="mono" htmlFor={`${id}-${key}`}>
                {formatValue(unit, params[key])}
              </output>
              <input
                id={`${id}-${key}`}
                type="range"
                min={min}
                max={max}
                step={step}
                value={params[key]}
                aria-valuetext={formatValue(unit, params[key])}
                style={{ "--fill": `${((params[key] - min) / (max - min)) * 100}%` }}
                onChange={(event) => handleChange(key, event.target.value)}
              />
            </div>
          ))}
        </div>

        <p className="figure__panel-title mono">Derived</p>
        <dl className="bridge__derived">
          <div>
            <dt>Deck width</dt>
            <dd className="mono">{formatMetres(deckWidth)}</dd>
          </div>
          <div>
            <dt>Pier-cap width</dt>
            <dd className="mono">{formatMetres(capWidth)}</dd>
          </div>
        </dl>
        <p className="bridge__formula mono">
          deck = (n − 1) × spacing
          <br />
          {"     "}+ 2 × overhang
          <br />
          {"     "}= ({params.girders} − 1) × {(params.spacing / 1000).toFixed(2)} + 2 ×{" "}
          {(f.overhang / 1000).toFixed(2)}
        </p>

        <div className="figure__actions">
          <button
            className="chip-button"
            type="button"
            disabled={isDefault}
            onClick={() => setParams(BRIDGE_DEFAULTS)}
          >
            <Icon name="reset" size={14} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
