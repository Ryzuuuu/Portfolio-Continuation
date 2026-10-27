import PropTypes from "prop-types";
import { ArrowDown, ArrowDownRight } from "lucide-react";
import { pad2 } from "../lib/format.js";
import { profileShape } from "../lib/propTypes.js";
import { MangaPortrait } from "./MangaPortrait.jsx";

export function Hero({ profile, pageCount }) {
  const location = profile.location.toUpperCase();

  return (
    <section className="hero page-pad" aria-labelledby="hero-title">
      <div className="hero__meta mono">
        <span>
          {location} · {profile.edition}
        </span>
        <span>
          SCROLL TO READ <ArrowDown size={13} aria-hidden="true" />
        </span>
      </div>
      <div className="hero__grid">
        <div className="hero__copy">
          <p className="eyebrow">
            <span className="eyebrow__line" /> {profile.focus}
          </p>
          <h1 id="hero-title">
            I BUILD
            <br />
            SYSTEMS
            <br />
            THAT <span className="hero__italic">SEE</span>
            <span className="hero__period">.</span>
          </h1>
          <div className="hero__bottom">
            <p className="hero__intro">
              From raw footage to useful insight.
              <br />
              From vague specs to <span>shipped systems.</span>
            </p>
            <a className="round-link" href="#work" aria-label="Explore selected work">
              <ArrowDownRight size={26} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="hero__visual">
          <div className="hero__burst">
            AI
            <br />
            WITH
            <br />
            VISION.
          </div>
          <MangaPortrait />
          <span className="hero__vertical-label mono">VOL. 01 — HUMAN × MACHINE</span>
          <span className="hero__scribble" aria-hidden="true">
            ✳
          </span>
        </div>
      </div>
      <div className="hero__foot mono">
        <span>{location} · OPEN TO HARD PROBLEMS</span>
        <span>01 / {pad2(pageCount)}</span>
      </div>
    </section>
  );
}

Hero.propTypes = {
  profile: profileShape.isRequired,
  pageCount: PropTypes.number.isRequired,
};
