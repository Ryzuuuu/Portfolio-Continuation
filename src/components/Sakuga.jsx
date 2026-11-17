import PropTypes from "prop-types";
import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

// React wrappers for the Sakuga VFX web components in public/sakuga-vfx/ (MIT,
// github.com/finktheartist/sakuga-vfx), loaded by index.html before the app.
// Each falls back to the native control when its element isn't defined (tests,
// a blocked script), so the page never loses a working control.

// Trims float noise (0.1 × 3 → 0.30000000000000004) before values reach an attribute.
const round = (value) => Math.round(value * 1e6) / 1e6;

const isDefined = (tag) =>
  typeof customElements !== "undefined" && Boolean(customElements.get(tag));

/** A button that squashes, bursts and lands a ドン! on click. `ref.current.done()` adds the check. */
export const SakugaButton = forwardRef(function SakugaButton(
  { children, variant, type = "button", onClick, disabled = false, busy = false, className, label },
  ref
) {
  const elRef = useRef(null);
  useImperativeHandle(ref, () => ({ done: (ms) => elRef.current?.done?.(ms) }), []);

  if (!isDefined("sakuga-button")) {
    return (
      <button
        ref={elRef}
        className={className}
        type={type}
        onClick={onClick}
        disabled={disabled}
        aria-disabled={busy || undefined}
        aria-label={label}
      >
        {children}
      </button>
    );
  }

  // Custom elements get attributes as strings, so leave false ones off entirely.
  return (
    <sakuga-button
      ref={elRef}
      class={className}
      variant={variant}
      type={type}
      disabled={disabled ? "" : undefined}
      aria-busy={busy || undefined}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </sakuga-button>
  );
});

SakugaButton.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(["secondary"]),
  type: PropTypes.oneOf(["button", "submit"]),
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  busy: PropTypes.bool,
  className: PropTypes.string,
  label: PropTypes.string,
};

/**
 * A slider whose thumb stretches on a spring and throws cloud behind a fast drag.
 * Controlled: `value` in, `onChange(number)` out. `scale` converts to the units shown in its
 * bubble (0.001 shows millimetres as metres); values in and out stay unscaled.
 */
export function SakugaSlider({
  id,
  label,
  min,
  max,
  step,
  value,
  scale = 1,
  unit = "",
  valueText,
  onChange,
}) {
  const elRef = useRef(null);
  const sakuga = isDefined("sakuga-slider");
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  useEffect(() => {
    const element = elRef.current;
    if (!sakuga || !element) return undefined;
    const handle = () => onChangeRef.current(Math.round(Number(element.value) / scale));
    element.addEventListener("input", handle);
    return () => element.removeEventListener("input", handle);
  }, [sakuga, scale]);

  // Keep the element in step when the value changes from outside (e.g. Reset).
  useEffect(() => {
    const element = elRef.current;
    if (sakuga && element && Math.round(Number(element.value) / scale) !== value) {
      element.value = round(value * scale);
    }
  }, [sakuga, value, scale]);

  if (!sakuga) {
    return (
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={valueText}
        style={{ "--fill": `${((value - min) / (max - min)) * 100}%` }}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    );
  }

  return (
    <sakuga-slider
      ref={elRef}
      id={id}
      label={label}
      min={round(min * scale)}
      max={round(max * scale)}
      step={round(step * scale)}
      value={round(value * scale)}
      unit={unit}
    />
  );
}

SakugaSlider.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  step: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
  scale: PropTypes.number,
  unit: PropTypes.string,
  valueText: PropTypes.string,
  onChange: PropTypes.func.isRequired,
};

/** A toast that streaks in and lands in dust. `ref.current.show(message)`. Renders nothing as a fallback. */
export const SakugaToast = forwardRef(function SakugaToast(_props, ref) {
  const elRef = useRef(null);
  useImperativeHandle(ref, () => ({ show: (message) => elRef.current?.show?.(message) }), []);
  if (!isDefined("sakuga-toast")) return null;
  return <sakuga-toast ref={elRef} class="sakuga-toast" />;
});
