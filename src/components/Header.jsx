import PropTypes from "prop-types";
import { Menu, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { profileShape, sectionShape } from "../lib/propTypes.js";
import { ThemeToggle } from "./ThemeToggle.jsx";

const HIDE_AFTER_PX = 120; // never hide while the top of the page is in view
const DIRECTION_SLOP_PX = 6; // ignore scroll jitter

/** Hides the fixed header while scrolling down and brings it back on the way up. */
function useHeaderScrollState() {
  const [state, setState] = useState({ hidden: false, scrolled: false });

  useEffect(() => {
    let lastY = window.scrollY;
    let frame = 0;
    function update() {
      const y = window.scrollY;
      const delta = y - lastY;
      setState((current) => {
        const scrolled = y > 8;
        let hidden = current.hidden;
        if (Math.abs(delta) > DIRECTION_SLOP_PX) hidden = delta > 0 && y > HIDE_AFTER_PX;
        if (y <= HIDE_AFTER_PX) hidden = false;
        return hidden === current.hidden && scrolled === current.scrolled
          ? current
          : { hidden, scrolled };
      });
      if (Math.abs(delta) > DIRECTION_SLOP_PX) lastY = y;
    }
    function handleScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return state;
}

/** The id of the section crossing the middle of the screen, or null (e.g. on the hero). */
function useActiveSection(ids) {
  const [active, setActive] = useState(null);
  const key = ids.join(",");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;
    const order = key.split(",");
    const visible = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          entry.isIntersecting ? visible.add(entry.target.id) : visible.delete(entry.target.id)
        );
        setActive(order.find((id) => visible.has(id)) ?? null);
      },
      { rootMargin: "-48% 0px -51% 0px" }
    );
    order.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [key]);

  return active;
}

export function Header({ profile, sections }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { hidden, scrolled } = useHeaderScrollState();
  const toggleRef = useRef(null);
  const navRef = useRef(null);
  const inkRef = useRef(null);
  const activeId = useActiveSection(sections.map((section) => section.id));

  // Slide the ink bar under the active link (desktop nav only; hidden by CSS otherwise).
  useLayoutEffect(() => {
    const ink = inkRef.current;
    const link = activeId && navRef.current?.querySelector(`a[href="#${activeId}"]`);
    if (!ink) return undefined;
    function place() {
      ink.style.opacity = link ? "1" : "0";
      if (!link) return;
      ink.style.width = `${link.offsetWidth}px`;
      ink.style.translate = `${link.offsetLeft}px 0`;
    }
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [activeId]);

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
    <header
      className={[
        "site-header",
        hidden && !menuOpen ? "is-hidden" : "",
        scrolled ? "is-scrolled" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <a className="wordmark" href="#top" aria-label={`${profile.name} home`}>
        <svg className="wordmark__logo" viewBox="0 0 40 40" aria-hidden="true" focusable="false">
          <rect className="wordmark__logo-shadow" x="6" y="6" width="32" height="32" />
          <rect className="wordmark__logo-tile" x="1.5" y="1.5" width="32" height="32" />
          <path className="wordmark__logo-n" d="M8.5 26.5v-18l9 12.5v-12.5" />
          <path className="wordmark__logo-m" d="M17.5 26.5v-9l4.5 6 4.5-6v9" />
          <circle className="wordmark__logo-dot" cx="27" cy="9.5" r="2.2" />
        </svg>
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
          <a
            key={section.id}
            href={`#${section.id}`}
            aria-current={activeId === section.id ? "location" : undefined}
            onClick={closeMenu}
          >
            {section.navLabel} <span aria-hidden="true">{section.number}</span>
          </a>
        ))}
        <a className="nav-availability" href="#contact" onClick={closeMenu}>
          <i aria-hidden="true" /> AVAILABLE FOR WORK
        </a>
        <span className="site-nav__ink" ref={inkRef} aria-hidden="true" />
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
