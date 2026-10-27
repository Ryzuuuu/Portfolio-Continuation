import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { prefersReducedMotion } from "../../lib/motion.js";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>_+*#";
const KEEP = /[\s·.,/]/; // separators stay put so the line's shape reads immediately
const FRAME_MS = 45; // repaint the noise at ~22fps, like a terminal, not at 60

const scramble = (text, resolved) =>
  Array.from(text, (character, index) =>
    index < resolved || KEEP.test(character)
      ? character
      : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]
  ).join("");

/**
 * Text that decodes left to right, like a feed resolving. Screen readers get the real
 * text from the start; the noise is aria-hidden. Monospace fonts keep it from jittering.
 */
export function ScrambleText({ text, delay = 0, duration = 900 }) {
  const [animate] = useState(() => !prefersReducedMotion());
  const [output, setOutput] = useState(() => (animate ? scramble(text, 0) : text));

  useEffect(() => {
    if (!animate) return undefined;
    let frame = 0;
    let lastPaint = 0;
    const start = performance.now() + delay;

    function tick(now) {
      const progress = Math.min(1, Math.max(0, (now - start) / duration));
      if (progress >= 1) {
        setOutput(text);
        return;
      }
      if (now - lastPaint >= FRAME_MS) {
        lastPaint = now;
        setOutput(scramble(text, Math.floor(progress * text.length)));
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [animate, text, delay, duration]);

  return (
    <>
      <span className="scramble" aria-hidden="true">
        {output}
      </span>
      <span className="visually-hidden">{text}</span>
    </>
  );
}

ScrambleText.propTypes = {
  text: PropTypes.string.isRequired,
  delay: PropTypes.number,
  duration: PropTypes.number,
};
