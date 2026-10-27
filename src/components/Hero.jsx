import PropTypes from "prop-types";
import { ArrowDown, ArrowDownRight } from "lucide-react";
import { useRef } from "react";
import { usePointerTilt } from "../hooks/usePointerTilt.js";
import { pad2 } from "../lib/format.js";
import { profileShape } from "../lib/propTypes.js";
import { DetectionOverlay } from "./hero/DetectionOverlay.jsx";
import { HeroClock } from "./hero/HeroClock.jsx";
import { ScrambleText } from "./hero/ScrambleText.jsx";
import { SpeedLines } from "./hero/SpeedLines.jsx";
import { MangaPortrait } from "./MangaPortrait.jsx";

export function Hero({ profile, pageCount }) {
  const heroRef = useRef(null);
  const visualRef = useRef(null);
  usePointerTilt(heroRef, visualRef);
  const location = profile.location.toUpperCase();

  return (
    <section className="hero page-pad" aria-labelledby="hero-title" ref={heroRef}>
      <div className="hero__meta mono">
        <span>
          {location} · {profile.edition}
        </span>
        <HeroClock timeZone={profile.timeZone} zoneLabel={profile.timeZoneLabel} />
        <span className="hero__scroll">
          SCROLL TO READ <ArrowDown size={13} aria-hidden="true" />
        </span>
      </div>

      <div className="hero__grid">
        <div className="hero__copy">
          <p className="eyebrow">
            <span className="eyebrow__line" /> <ScrambleText text={profile.focus} delay={300} />
          </p>
          {/* Each line rises out of its own slot; the spaces keep the accessible name readable. */}
          <h1 id="hero-title" className="hero__title">
            <span className="hero__line">
              <span>I BUILD</span>
            </span>{" "}
            <span className="hero__line">
              <span>SYSTEMS</span>
            </span>{" "}
            <span className="hero__line">
              <span>
                THAT{" "}
                <span className="hero__italic">
                  SEE
                  <svg
                    className="hero__underline"
                    viewBox="0 0 220 26"
                    preserveAspectRatio="none"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <path pathLength="1" d="M5 17C52 7 122 4 214 12" />
                    <path pathLength="1" d="M36 23C86 17 142 16 188 20" />
                  </svg>
                </span>
                <span className="hero__period">.</span>
              </span>
            </span>
          </h1>
          <div className="hero__bottom">
            <p className="hero__intro">
              From raw footage to useful insight.
              <br />
              From vague specs to <span>shipped systems.</span>
            </p>
            <a className="round-link" href="#work" aria-label="Explore selected work">
              <svg
                className="round-link__ring"
                viewBox="0 0 100 100"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  id="round-link-path"
                  d="M50 50m-39 0a39 39 0 1 1 78 0a39 39 0 1 1-78 0"
                  fill="none"
                />
                <text>
                  <textPath href="#round-link-path" textLength="244" lengthAdjust="spacing">
                    SEE THE WORK ✳ SEE THE WORK ✳{" "}
                  </textPath>
                </text>
              </svg>
              <span className="round-link__core">
                <ArrowDownRight size={24} aria-hidden="true" />
              </span>
            </a>
          </div>
        </div>

        <div className="hero__visual" ref={visualRef}>
          <SpeedLines className="hero__speedlines" />
          {/* ジーッ: the manga sound effect for staring intently. */}
          <span className="hero__sfx" aria-hidden="true">
            ジーッ
          </span>
          <div className="hero__burst">
            AI
            <br />
            WITH
            <br />
            VISION.
          </div>
          <div className="hero__tilt">
            <MangaPortrait>
              <DetectionOverlay />
            </MangaPortrait>
          </div>
          <span className="hero__vertical-label mono">VOL. 01 — HUMAN × MACHINE</span>
          <span className="hero__scribble" aria-hidden="true">
            ✳
          </span>
        </div>
      </div>

      <div className="hero__foot mono">
        <span>{location} · OPEN TO HARD PROBLEMS</span>
        <span className="hero__page">
          <span
            className="hero__page-bar"
            aria-hidden="true"
            style={{ "--page-fill": `${100 / pageCount}%` }}
          />
          01 / {pad2(pageCount)}
        </span>
      </div>
    </section>
  );
}

Hero.propTypes = {
  profile: profileShape.isRequired,
  pageCount: PropTypes.number.isRequired,
};
