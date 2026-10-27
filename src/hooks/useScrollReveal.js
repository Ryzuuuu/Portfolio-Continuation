import { useLayoutEffect } from "react";

// [data-reveal] content is only hidden while this class is on <html> (see styles.css).
// If this hook never runs (script error, very old browser), content simply stays visible.
const READY_CLASS = "reveal-ready";

export function useScrollReveal() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const elements = document.querySelectorAll("[data-reveal]");
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (typeof IntersectionObserver === "undefined" || reducedMotion) {
      elements.forEach((element) => element.classList.add("is-visible"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -48px 0px" }
    );

    // useLayoutEffect adds the class before first paint, so nothing flashes in and out.
    root.classList.add(READY_CLASS);
    elements.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      root.classList.remove(READY_CLASS);
    };
  }, []);
}
