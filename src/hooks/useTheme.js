import { useCallback, useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { prefersReducedMotion } from "../lib/motion.js";

// Keep in sync with the inline script in index.html, which applies the theme before
// first paint so there's no flash of the wrong one.
export const THEME_STORAGE_KEY = "theme";
const THEME_COLORS = { light: "#f2eee5", dark: "#131210" };

function readStoredTheme() {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === "light" || stored === "dark" ? stored : null;
  } catch {
    return null; // storage blocked (private mode, cookies off)
  }
}

function systemTheme() {
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(theme) {
  const root = document.documentElement;
  root.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEME_COLORS[theme]);
}

export function useTheme() {
  const [theme, setTheme] = useState(() =>
    document.documentElement.dataset.theme === "dark" ? "dark" : "light"
  );

  // Until the visitor picks a theme, follow the operating system as it changes.
  useEffect(() => {
    const query = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!query) return undefined;
    function handleChange() {
      if (readStoredTheme()) return;
      const next = systemTheme();
      applyTheme(next);
      setTheme(next);
    }
    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  /** Switches theme; `origin` is the point the iris-wipe transition expands from. */
  const toggleTheme = useCallback(
    (origin) => {
      const next = theme === "dark" ? "light" : "dark";
      const commit = () => {
        applyTheme(next);
        flushSync(() => setTheme(next));
      };
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        // Not persisted; the switch still applies for this visit.
      }

      if (typeof document.startViewTransition !== "function" || prefersReducedMotion()) {
        commit();
        return;
      }

      const x = origin?.x ?? window.innerWidth - 40;
      const y = origin?.y ?? 40;
      const radius = Math.hypot(
        Math.max(x, window.innerWidth - x),
        Math.max(y, window.innerHeight - y)
      );
      const transition = document.startViewTransition(commit);
      transition.ready
        .then(() => {
          document.documentElement.animate(
            { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
            {
              duration: 700,
              easing: "cubic-bezier(.7, 0, .2, 1)",
              pseudoElement: "::view-transition-new(root)",
            }
          );
        })
        .catch(() => {});
    },
    [theme]
  );

  return { theme, toggleTheme };
}
