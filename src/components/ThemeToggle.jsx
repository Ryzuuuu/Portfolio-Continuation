import { useTheme } from "../hooks/useTheme.js";

const RAY_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

/** A sun that eclipses into a crescent moon. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  function handleClick(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    toggleTheme({ x: bounds.left + bounds.width / 2, y: bounds.top + bounds.height / 2 });
  }

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label="Dark mode"
      aria-pressed={isDark}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={handleClick}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <mask id="theme-toggle-moon">
          <rect width="24" height="24" fill="#fff" />
          <circle className="theme-toggle__cutout" cx="17" cy="7" r="6" fill="#000" />
        </mask>
        <circle
          className="theme-toggle__core"
          cx="12"
          cy="12"
          r="5"
          fill="currentColor"
          mask="url(#theme-toggle-moon)"
        />
        <g
          className="theme-toggle__rays"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          {RAY_ANGLES.map((angle) => (
            <line
              key={angle}
              x1="12"
              y1="2.5"
              x2="12"
              y2="4.5"
              transform={`rotate(${angle} 12 12)`}
            />
          ))}
        </g>
      </svg>
    </button>
  );
}
