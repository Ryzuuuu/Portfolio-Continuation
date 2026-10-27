const matches = (query) =>
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia(query).matches
    : false;

export const prefersReducedMotion = () => matches("(prefers-reduced-motion: reduce)");

/** True on devices with a precise pointer that can hover (not touch screens). */
export const hasFinePointer = () => matches("(hover: hover) and (pointer: fine)");
