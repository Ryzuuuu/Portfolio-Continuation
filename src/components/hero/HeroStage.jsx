import PropTypes from "prop-types";
import { useRef } from "react";
import { useEyeZoom } from "../../hooks/useEyeZoom.js";
import { buildBurst } from "../../lib/burst.js";
import { profileShape } from "../../lib/propTypes.js";
import { Hero } from "../Hero.jsx";

const DROPLET_COUNT = 6;
// Impact-frame line sets: heavy, close-in wedges, unlike the hero's fine speed lines.
const IMPACT_LINES = buildBurst({ seed: 41, count: 64, inner: [14, 46], width: [0.006, 0.05] });
const IMPACT_INK = buildBurst({ seed: 97, count: 90, inner: [10, 34], width: [0.008, 0.07] });

/**
 * Pins the hero while the first scroll pushes the camera into the character's eyes,
 * floods the screen with ink from them, and lifts the ink onto the next section.
 */
export function HeroStage({ profile, pageCount }) {
  const stageRef = useRef(null);
  useEyeZoom(stageRef);

  return (
    <div className="hero-stage" ref={stageRef} data-phase="rest">
      <div className="hero-stage__pin">
        <Hero profile={profile} pageCount={pageCount} />
        {/* Red/black duotone for the second impact frame: white → the site's coral. The
            hero is already inverted and grayscale by then, so red carries the luminance. */}
        <svg className="impact-defs" aria-hidden="true" focusable="false">
          <filter id="impact-duotone" colorInterpolationFilters="sRGB">
            <feColorMatrix values="0.914 0 0 0 0  0.329 0 0 0 0  0.22 0 0 0 0  0 0 0 1 0" />
          </filter>
        </svg>

        <div className="zoom-fx" aria-hidden="true">
          {/* Impact frames: a ~quarter-second burst of manga "impact" frames as the camera
              locks onto the eyes (timed and positioned by useEyeZoom). */}
          <div className="impact">
            <svg className="impact__burst impact__burst--light" viewBox="-100 -100 200 200">
              <path d={IMPACT_LINES} />
            </svg>
            <svg className="impact__burst impact__burst--ink" viewBox="-100 -100 200 200">
              <path d={IMPACT_INK} />
            </svg>
            <span className="impact__glyph">見</span>
          </div>
          <svg className="zoom-fx__ink" focusable="false">
            <circle data-ink-eye="left" r="0" />
            <circle data-ink-eye="right" r="0" />
            {Array.from({ length: DROPLET_COUNT }, (_, index) => (
              <circle key={index} data-ink-drop r="0" />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}

HeroStage.propTypes = {
  profile: profileShape.isRequired,
  pageCount: PropTypes.number.isRequired,
};
