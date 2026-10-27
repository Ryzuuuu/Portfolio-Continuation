import { useEffect } from "react";
import { prefersReducedMotion } from "../lib/motion.js";

/**
 * Writes how far `ref` has travelled through the viewport to --progress (0 when its top
 * reaches 80% down the screen, 1 when its bottom passes 45%). Only listens while the
 * element is near the screen. Reduced motion pins it at 1.
 */
export function useScrollProgress(ref) {
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    if (prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      element.style.setProperty("--progress", "1");
      return undefined;
    }

    let frame = 0;
    function update() {
      const rect = element.getBoundingClientRect();
      const start = window.innerHeight * 0.8;
      const end = window.innerHeight * 0.45;
      const progress = (start - rect.top) / (rect.height + start - end);
      element.style.setProperty("--progress", Math.min(1, Math.max(0, progress)).toFixed(4));
    }
    function handleScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        window.addEventListener("scroll", handleScroll, { passive: true });
        update();
      } else {
        window.removeEventListener("scroll", handleScroll);
        update();
      }
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [ref]);
}
