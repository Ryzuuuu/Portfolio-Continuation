import { ArrowUp } from "lucide-react";
import { profileShape } from "../lib/propTypes.js";
import { LiveClock } from "./LiveClock.jsx";

export function Footer({ profile }) {
  return (
    <footer className="site-footer">
      {/* A manga volume's last page: 続く, "to be continued". */}
      <div className="site-footer__end">
        <span className="site-footer__continued" aria-hidden="true">
          続く
        </span>
        <p className="mono">
          TO BE CONTINUED <span aria-hidden="true">—</span> END OF VOL. 01
        </p>
      </div>
      <div className="site-footer__bar">
        {/* Mouse shortcut only: "Back to top" serves keyboard and screen-reader users. */}
        <a className="footer-mark" href="#top" tabIndex={-1} aria-hidden="true">
          {profile.initials.join("")}
          <span>.</span>
        </a>
        <span className="mono">{profile.name.toUpperCase()} · MADE WITH CURIOSITY</span>
        <LiveClock timeZone={profile.timeZone} zoneLabel={profile.timeZoneLabel} camera="KOLKATA" />
        <a className="back-top mono" href="#top">
          BACK TO TOP <ArrowUp size={14} aria-hidden="true" />
        </a>
      </div>
    </footer>
  );
}

Footer.propTypes = {
  profile: profileShape.isRequired,
};
