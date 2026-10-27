import PropTypes from "prop-types";
import { Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { profileShape, sectionShape } from "../lib/propTypes.js";
import { ThemeToggle } from "./ThemeToggle.jsx";

export function Header({ profile, sections }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleRef = useRef(null);
  const navRef = useRef(null);
  const [firstInitial, secondInitial] = profile.initials;

  useEffect(() => {
    if (!menuOpen) return undefined;
    // The nav sits before the buttons in the DOM (so desktop tab order matches the
    // layout), so move focus into the dropdown when it opens.
    navRef.current?.querySelector("a")?.focus();

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label={`${profile.name} home`}>
        <span className="wordmark__icon" aria-hidden="true">
          {firstInitial}
          <span>{secondInitial}</span>
        </span>
        <span className="wordmark__label">
          {profile.name}
          <br />
          <small>{profile.tagline}</small>
        </span>
      </a>
      <nav
        id="site-nav"
        ref={navRef}
        className={menuOpen ? "site-nav is-open" : "site-nav"}
        aria-label="Main navigation"
      >
        {sections.map((section) => (
          <a key={section.id} href={`#${section.id}`} onClick={closeMenu}>
            {section.navLabel} <span aria-hidden="true">{section.number}</span>
          </a>
        ))}
        <a className="nav-availability" href="#contact" onClick={closeMenu}>
          <i aria-hidden="true" /> AVAILABLE FOR WORK
        </a>
      </nav>
      <ThemeToggle />
      <button
        ref={toggleRef}
        className="menu-toggle"
        type="button"
        aria-label="Navigation menu"
        aria-expanded={menuOpen}
        aria-controls="site-nav"
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
      </button>
    </header>
  );
}

Header.propTypes = {
  profile: profileShape.isRequired,
  sections: PropTypes.arrayOf(sectionShape).isRequired,
};
