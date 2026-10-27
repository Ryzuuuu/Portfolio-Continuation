import PropTypes from "prop-types";
import { useRef } from "react";
import { hasFinePointer, prefersReducedMotion } from "../lib/motion.js";

/**
 * A card with a pointer-tracked spotlight. With a mouse it also publishes the pointer as
 * --tilt-x / --tilt-y in [-1, 1], which CSS turns into a slight 3D tilt and parallax.
 */
export function SpotlightCard({ children, className = "" }) {
  const cardRef = useRef(null);
  const tiltRef = useRef(null);

  function handlePointerMove(event) {
    const card = cardRef.current;
    const bounds = card?.getBoundingClientRect();
    if (!bounds) return;
    card.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
    card.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);

    tiltRef.current ??= hasFinePointer() && !prefersReducedMotion();
    if (!tiltRef.current) return;
    const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
    card.style.setProperty("--tilt-x", x.toFixed(3));
    card.style.setProperty("--tilt-y", y.toFixed(3));
  }

  function handlePointerLeave() {
    cardRef.current?.style.setProperty("--tilt-x", "0");
    cardRef.current?.style.setProperty("--tilt-y", "0");
  }

  return (
    <article
      className={`spotlight-card ${className}`}
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </article>
  );
}

SpotlightCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
