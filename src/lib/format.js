const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

export const pad2 = (value) => String(value).padStart(2, "0");

/** "2026-09" → "SEP 2026" */
export function formatMonth(value) {
  const [year, month] = value.split("-");
  return `${MONTHS[Number(month) - 1]} ${year}`;
}
