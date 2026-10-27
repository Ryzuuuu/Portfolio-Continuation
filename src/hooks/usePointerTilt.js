import { useEffect } from "react";
import { hasFinePointer, prefersReducedMotion } from "../lib/motion.js";

/**
 * Publishes the pointer's position over `ref` as --tilt-x / --tilt-y in [-1, 1],
 * measured from the centre of `targetRef` (defaults to `ref`). CSS turns these into
 * the hero's 3D tilt and parallax. Touch devices and reduced-motion users get none.
 */
export function usePointerTilt(ref, targetRef = ref) {
  useEffect(() => {
    const host = ref.current;
    if (!host || !hasFinePointer() || prefersReducedMotion()) return undefined;

    let frame = 0;
    const clamp = (value) => Math.max(-1, Math.min(1, value));
    const publish = (x, y) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        host.style.setProperty("--tilt-x", x.toFixed(3));
        host.style.setProperty("--tilt-y", y.toFixed(3));
      });
    };

    function handleMove(event) {
      const target = (targetRef.current ?? host).getBoundingClientRect();
      const x = (event.clientX - (target.left + target.width / 2)) / (target.width / 2);
      const y = (event.clientY - (target.top + target.height / 2)) / (target.height / 2);
      publish(clamp(x), clamp(y));
    }
    function handleLeave() {
      publish(0, 0);
    }

    host.addEventListener("pointermove", handleMove);
    host.addEventListener("pointerleave", handleLeave);
    return () => {
      cancelAnimationFrame(frame);
      host.removeEventListener("pointermove", handleMove);
      host.removeEventListener("pointerleave", handleLeave);
    };
  }, [ref, targetRef]);
}
