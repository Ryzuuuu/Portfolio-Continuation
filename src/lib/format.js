const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const pad2 = (value) => String(value).padStart(2, "0");

/** "2026-09" → "SEP 2026" */
export function formatMonth(value) {
  const [year, month] = value.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

/** Millimetres → "9.60 m" */
export const formatMetres = (millimetres) => `${(millimetres / 1000).toFixed(2)} m`;

/** 0.3925 → "39%"; anything that isn't a finite number → "—" */
export const formatPercent = (ratio) =>
  Number.isFinite(ratio) ? `${Math.round(ratio * 100)}%` : "—";

/** Seconds → "04:12" */
export function formatClock(seconds) {
  const whole = Math.floor(seconds);
  return `${pad2(Math.floor(whole / 60))}:${pad2(whole % 60)}`;
}
