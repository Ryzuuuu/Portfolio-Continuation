import { useEffect } from "react";
import { prefersReducedMotion } from "../lib/motion.js";

const LOOP_SECONDS = 28; // one loop at rest, matching the CSS fallback
const BOOST = 0.9; // how much scroll speed adds to the marquee
const DECAY = 0.9; // how fast that boost fades per frame

/**
 * Drives the marquee from JS so it reacts to scrolling: it surges with scroll speed and
 * runs backwards while scrolling up. Hovering pauses it. Only ticks while on screen;
 * reduced motion keeps the CSS version (which the global rule stops).
 */
export function useVelocityMarquee(marqueeRef) {
  useEffect(() => {
    const marquee = marqueeRef.current;
    const track = marquee?.querySelector(".marquee__track");
    if (!track || prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    track.classList.add("is-driven");
    let offset = 0;
    let boost = 0;
    let direction = 1;
    let paused = false;
    let lastY = window.scrollY;
    let lastTime = 0;
    let frame = 0;

    function tick(now) {
      const dt = lastTime ? Math.min(64, now - lastTime) / 1000 : 0;
      lastTime = now;
      const loop = track.scrollWidth / 2; // the content is repeated, so half is one loop
      if (!paused && loop > 0) {
        offset = (offset + direction * (loop / LOOP_SECONDS + boost) * dt + loop) % loop;
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }
      boost *= DECAY;
      frame = requestAnimationFrame(tick);
    }

    function handleScroll() {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      if (delta !== 0) direction = delta > 0 ? 1 : -1;
      boost = Math.min(900, boost + Math.abs(delta) * BOOST * 10);
    }

    const pause = () => {
      paused = true;
    };
    const resume = () => {
      paused = false;
    };

    const observer = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(frame);
      if (entry.isIntersecting) {
        lastTime = 0;
        frame = requestAnimationFrame(tick);
      }
    });
    observer.observe(marquee);
    window.addEventListener("scroll", handleScroll, { passive: true });
    marquee.addEventListener("pointerenter", pause);
    marquee.addEventListener("pointerleave", resume);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", handleScroll);
      marquee.removeEventListener("pointerenter", pause);
      marquee.removeEventListener("pointerleave", resume);
      track.classList.remove("is-driven");
      track.style.transform = "";
    };
  }, [marqueeRef]);
}
