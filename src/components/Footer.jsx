import { ArrowUpRight } from "lucide-react";
import { profileShape } from "../lib/propTypes.js";

export function Footer({ profile }) {
  return (
    <footer className="site-footer">
      {/* Mouse shortcut only: the "Back to top" link below serves keyboard and screen readers. */}
      <a className="footer-mark" href="#top" tabIndex={-1} aria-hidden="true">
        {profile.initials.join("")}
        <span>.</span>
      </a>
      <span className="mono">{profile.name.toUpperCase()} · MADE WITH CURIOSITY</span>
      <a className="back-top mono" href="#top">
        BACK TO TOP <ArrowUpRight size={14} aria-hidden="true" />
      </a>
    </footer>
  );
}

Footer.propTypes = {
  profile: profileShape.isRequired,
};
