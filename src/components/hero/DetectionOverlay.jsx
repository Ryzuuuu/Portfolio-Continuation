import { useEffect, useState } from "react";
import { prefersReducedMotion } from "../../lib/motion.js";

const CONFIDENCE = 0.98;
const COUNT_DELAY_MS = 1750; // starts as the box finishes locking on (see .detect__box)
const COUNT_MS = 650;

/** Counts up to `target` with an ease-out, like a detector's score settling. */
function useSettlingNumber(target, delay, duration) {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : 0));

  useEffect(() => {
    if (prefersReducedMotion() || typeof requestAnimationFrame !== "function") return undefined;
    let frame = 0;
    const start = performance.now() + delay;
    function tick(now) {
      const progress = Math.min(1, Math.max(0, (now - start) / duration));
      setValue(target * (1 - (1 - progress) ** 3));
      if (progress < 1) frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, delay, duration]);

  return value;
}

/**
 * A YOLO-style detection drawn over the portrait: corner brackets, class label,
 * confidence and track ID, plus a periodic scan line. Purely decorative.
 */
export function DetectionOverlay() {
  const confidence = useSettlingNumber(CONFIDENCE, COUNT_DELAY_MS, COUNT_MS);

  return (
    <div className="detect" aria-hidden="true">
      <div className="detect__scan" />
      <div className="detect__box">
        <i className="detect__corner detect__corner--tl" />
        <i className="detect__corner detect__corner--tr" />
        <i className="detect__corner detect__corner--bl" />
        <i className="detect__corner detect__corner--br" />
        <span className="detect__label">
          <span className="detect__class">
            <span className="detect__class-name">PERSON</span>
            <span className="detect__class-name detect__class-name--alt">BUILDER</span>
          </span>
          <span className="detect__score">{confidence.toFixed(2)}</span>
        </span>
        <span className="detect__track">ID 01 · TRACKING</span>
      </div>
    </div>
  );
}
