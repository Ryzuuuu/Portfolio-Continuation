import PropTypes from "prop-types";
import { useRef } from "react";

export function SpotlightCard({ children, className = "" }) {
  const cardRef = useRef(null);

  function handlePointerMove(event) {
    const bounds = cardRef.current?.getBoundingClientRect();
    if (!bounds) return;
    cardRef.current.style.setProperty("--pointer-x", `${event.clientX - bounds.left}px`);
    cardRef.current.style.setProperty("--pointer-y", `${event.clientY - bounds.top}px`);
  }

  return (
    <article
      className={`spotlight-card ${className}`}
      ref={cardRef}
      onPointerMove={handlePointerMove}
    >
      {children}
    </article>
  );
}

SpotlightCard.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
