import PropTypes from "prop-types";
import { Children, forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

// React wrappers for the Sakuga VFX web components in public/sakuga-vfx/ (MIT,
// github.com/finktheartist/sakuga-vfx). index.html loads most of them before the app;
// the toggle (a 0.5 MB sprite sheet) is loaded once the page is idle (see main.jsx).
// Each wrapper renders the native control until its element is defined, so the page
// never loses a working control (tests, a blocked script, a slow network).

// Trims float noise (0.1 × 3 → 0.30000000000000004) before values reach an attribute.
const round = (value) => Math.round(value * 1e6) / 1e6;

const isDefined = (tag) =>
  typeof customElements !== "undefined" && Boolean(customElements.get(tag));

/** True once `tag` is defined; re-renders when a late script defines it. */
function useDefined(tag) {
  const [defined, setDefined] = useState(() => isDefined(tag));
  useEffect(() => {
    if (defined || typeof customElements === "undefined") return undefined;
    let live = true;
    customElements.whenDefined(tag).then(() => live && setDefined(true));
    return () => {
      live = false;
    };
  }, [tag, defined]);
  return defined;
}

/** Listens for `type` on the element in `ref` and hands it to the latest `handler`. */
function useElementEvent(ref, active, type, handler) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });
  useEffect(() => {
    const element = ref.current;
    if (!active || !element) return undefined;
    const listen = (event) => handlerRef.current(event, element);
    element.addEventListener(type, listen);
    return () => element.removeEventListener(type, listen);
  }, [ref, active, type]);
}

/** `<option>` children as plain data, for both the element and the fallback. */
const readOptions = (children) =>
  Children.toArray(children).map((child) => ({
    value: child.props.value,
    label: child.props.children,
  }));

// ─── Button ────────────────────────────────────────────────────────────────

/** Squashes, bursts and lands a ドン! on click. `ref.current.done()` adds the check. */
export const SakugaButton = forwardRef(function SakugaButton(
  { children, variant, type = "button", onClick, disabled = false, busy = false, className, label },
  ref
) {
  const elRef = useRef(null);
  const sakuga = useDefined("sakuga-button");
  useImperativeHandle(ref, () => ({ done: (ms) => elRef.current?.done?.(ms) }), []);

  if (!sakuga) {
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

  // Custom elements get attributes as strings, so false ones are left off entirely.
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

// ─── Slider ────────────────────────────────────────────────────────────────

/**
 * The thumb stretches on a spring and throws cloud behind a fast drag. Controlled:
 * `value` in, `onChange(number)` out. `scale` converts to the units in its bubble
 * (0.001 shows millimetres as metres); values in and out stay unscaled.
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
  const sakuga = useDefined("sakuga-slider");
  useElementEvent(elRef, sakuga, "input", (_event, element) =>
    onChange(Math.round(Number(element.value) / scale))
  );

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

// ─── Toggle ────────────────────────────────────────────────────────────────

/** A drawn switch: the knob smears across and splashes. `fallback` renders until it loads. */
export function SakugaToggle({ label, checked, onChange, fallback }) {
  const elRef = useRef(null);
  const sakuga = useDefined("sakuga-toggle");
  useElementEvent(elRef, sakuga, "change", (event, element) => onChange(element.checked, event));

  // Follow outside changes (e.g. the system theme) without replaying the drawing.
  useEffect(() => {
    const element = elRef.current;
    if (sakuga && element && element.checked !== checked) element.checked = checked;
  }, [sakuga, checked]);

  if (!sakuga) return fallback;
  return (
    <sakuga-toggle
      ref={elRef}
      class="sakuga-toggle"
      label={label}
      checked={checked ? "" : undefined}
    />
  );
}

SakugaToggle.propTypes = {
  label: PropTypes.string.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  fallback: PropTypes.node.isRequired,
};

// ─── Checkbox ──────────────────────────────────────────────────────────────

/** Crescents swing round the box and the tick draws itself. Controlled. */
export function SakugaCheckbox({ children, checked, onChange }) {
  const elRef = useRef(null);
  const sakuga = useDefined("sakuga-checkbox");
  useElementEvent(elRef, sakuga, "change", (_event, element) => onChange(element.checked));

  useEffect(() => {
    const element = elRef.current;
    if (sakuga && element && element.checked !== checked) element.checked = checked;
  }, [sakuga, checked]);

  if (!sakuga) {
    return (
      <label className="sakuga-fallback-check">
        <input
          type="checkbox"
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
        />{" "}
        {children}
      </label>
    );
  }
  return (
    <sakuga-checkbox ref={elRef} checked={checked ? "" : undefined}>
      {children}
    </sakuga-checkbox>
  );
}

SakugaCheckbox.propTypes = {
  children: PropTypes.node.isRequired,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
};

// ─── Input ─────────────────────────────────────────────────────────────────

/**
 * Every keystroke kicks up dust at the caret. Uncontrolled and form-associated, so
 * FormData reads it by `name` like a native input.
 */
export function SakugaInput({
  id,
  name,
  label,
  type = "text",
  placeholder,
  autoComplete,
  maxLength,
  required,
  onChange,
  ...aria
}) {
  const onInput = onChange;
  const elRef = useRef(null);
  const sakuga = useDefined("sakuga-input");
  useElementEvent(elRef, sakuga, "input", (_event, element) =>
    onInput?.({ target: { name, value: element.value } })
  );

  if (!sakuga) {
    return (
      <input
        id={id}
        name={name}
        type={type}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required={required}
        onChange={onInput}
        {...aria}
      />
    );
  }
  return (
    <sakuga-input
      ref={elRef}
      id={id}
      name={name}
      label={label}
      type={type}
      placeholder={placeholder}
      autocomplete={autoComplete}
      class="sakuga-input"
      {...aria}
    />
  );
}

SakugaInput.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  autoComplete: PropTypes.string,
  maxLength: PropTypes.number,
  required: PropTypes.bool,
  onChange: PropTypes.func,
};

// ─── Radio ─────────────────────────────────────────────────────────────────

/** The dot springs in with wedges and a ポン. Form-associated by `name`. */
export function SakugaRadio({ name, label, defaultValue, children }) {
  const sakuga = useDefined("sakuga-radio");
  const options = readOptions(children);

  if (!sakuga) {
    return (
      <div role="radiogroup" aria-label={label} className="sakuga-fallback-radio">
        {options.map((option) => (
          <label key={option.value}>
            <input
              type="radio"
              name={name}
              value={option.value}
              defaultChecked={option.value === defaultValue}
            />{" "}
            {option.label}
          </label>
        ))}
      </div>
    );
  }
  return (
    <sakuga-radio name={name} label={label} value={defaultValue}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </sakuga-radio>
  );
}

SakugaRadio.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  defaultValue: PropTypes.string,
  children: PropTypes.node.isRequired,
};

// ─── Rating ────────────────────────────────────────────────────────────────

/** Stars pop in one after another; five gets a burst. Form-associated by `name`. */
export function SakugaRating({ name, label }) {
  const sakuga = useDefined("sakuga-rating");
  if (!sakuga) {
    return (
      <select name={name} aria-label={label} defaultValue="">
        <option value="">—</option>
        {[1, 2, 3, 4, 5].map((stars) => (
          <option key={stars} value={stars}>
            {"★".repeat(stars)}
          </option>
        ))}
      </select>
    );
  }
  return <sakuga-rating name={name} label={label} />;
}

SakugaRating.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

// ─── Tabs ──────────────────────────────────────────────────────────────────

/** The raised tab slides, stretching, and lands with wedges and a puff. `onChange(value)`. */
export function SakugaTabs({ label, value, onChange, children }) {
  const elRef = useRef(null);
  const sakuga = useDefined("sakuga-tabs");
  const options = readOptions(children);
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );
  useElementEvent(elRef, sakuga, "change", (event) => onChange(event.detail.value));

  if (!sakuga) {
    return (
      <div role="tablist" aria-label={label} className="sakuga-fallback-tabs">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={option.value === value}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    );
  }
  return (
    <sakuga-tabs ref={elRef} label={label} selected={index}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </sakuga-tabs>
  );
}

SakugaTabs.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

// ─── Progress ──────────────────────────────────────────────────────────────

/** A storm cloud rides the bar; at the end, a burst and ドン!. `value` from 0 to 1. */
export function SakugaProgress({ label, value, doneLabel }) {
  const elRef = useRef(null);
  const sakuga = useDefined("sakuga-progress");
  useEffect(() => {
    const element = elRef.current;
    if (!sakuga || !element) return;
    if (value <= 0) element.reset?.();
    else element.set?.(value);
  }, [sakuga, value]);

  if (!sakuga) return <progress aria-label={label} value={value} max={1} />;
  return (
    <sakuga-progress ref={elRef} class="sakuga-progress" label={label} done-label={doneLabel} />
  );
}

SakugaProgress.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  doneLabel: PropTypes.string,
};

// ─── Tooltip ───────────────────────────────────────────────────────────────

/** A hint that springs out like a speech bubble with カチッ. */
export function SakugaTooltip({ text, label, children = "?" }) {
  const sakuga = useDefined("sakuga-tooltip");
  if (!sakuga) {
    return (
      <span className="sakuga-fallback-tip" title={text}>
        {children}
      </span>
    );
  }
  return (
    <sakuga-tooltip text={text} label={label}>
      {children}
    </sakuga-tooltip>
  );
}

SakugaTooltip.propTypes = {
  text: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
};

// ─── Toast ─────────────────────────────────────────────────────────────────

/** Streaks in and lands in dust. `ref.current.show(message)`. Nothing as a fallback. */
export const SakugaToast = forwardRef(function SakugaToast(_props, ref) {
  const elRef = useRef(null);
  const sakuga = useDefined("sakuga-toast");
  useImperativeHandle(ref, () => ({ show: (message) => elRef.current?.show?.(message) }), []);
  if (!sakuga) return null;
  return <sakuga-toast ref={elRef} class="sakuga-toast" />;
});
