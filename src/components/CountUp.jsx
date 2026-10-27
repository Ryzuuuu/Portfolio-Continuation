import PropTypes from "prop-types";
import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "../lib/motion.js";

const DURATION_MS = 1100;

/**
 * A number that counts up from zero the first time it's actually seen (in view and not
 * under the hero's ink). Screen readers get the final value straight away.
 */
export function CountUp({ value }) {
  const target = Number(value);
  const ref = useRef(null);
  const [animate] = useState(
    () => !prefersReducedMotion() && typeof IntersectionObserver !== "undefined"
  );
  const [shown, setShown] = useState(animate ? 0 : target);

  useEffect(() => {
    const element = ref.current;
    if (!element || !animate) return undefined;
    let frame = 0;

    // Seen = intersecting, not under the ink, and its reveal (if any) has played.
    const isSeen = () =>
      !element.closest(".is-covered") &&
      (element.closest(".reveal")?.classList.contains("is-visible") ?? true);

    function count(start) {
      const progress = Math.min(1, (performance.now() - start) / DURATION_MS);
      setShown(Math.round(target * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame = requestAnimationFrame(() => count(start));
    }
    function waitUntilSeen() {
      if (isSeen()) count(performance.now());
      else frame = requestAnimationFrame(waitUntilSeen);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        waitUntilSeen();
      },
      { threshold: 0.6 }
    );
    observer.observe(element);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [animate, target]);

  return (
    <span ref={ref}>
      <span aria-hidden="true">{shown}</span>
      <span className="visually-hidden">{value}</span>
    </span>
  );
}

CountUp.propTypes = {
  value: PropTypes.string.isRequired,
};
