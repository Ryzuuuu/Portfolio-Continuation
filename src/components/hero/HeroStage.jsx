import PropTypes from "prop-types";
import { useRef } from "react";
import { useEyeZoom } from "../../hooks/useEyeZoom.js";
import { profileShape } from "../../lib/propTypes.js";
import { Hero } from "../Hero.jsx";

const DROPLET_COUNT = 6;

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

        <div className="zoom-fx" aria-hidden="true">
          {/* A camera HUD while the zoom runs, echoing the hero's CCTV clock. */}
          <div className="zoom-fx__hud">
            <i className="zoom-fx__corner zoom-fx__corner--tl" />
            <i className="zoom-fx__corner zoom-fx__corner--tr" />
            <i className="zoom-fx__corner zoom-fx__corner--bl" />
            <i className="zoom-fx__corner zoom-fx__corner--br" />
            <span className="zoom-fx__rec mono">
              <i /> REC
            </span>
            <span className="zoom-fx__readout mono">
              CAM 01 · ZOOM <b data-zoom-readout>×1.0</b>
            </span>
            <span className="zoom-fx__target mono">
              TARGET · EYES <b>LOCKED</b>
            </span>
            <span className="zoom-fx__reticle" />
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
