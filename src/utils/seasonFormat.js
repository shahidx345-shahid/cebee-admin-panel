/**
 * Format season as year only (e.g. 2025, 2026). No "25-26" style.
 * @param {number|string} year - Season year (e.g. 2025)
 * @returns {string} e.g. "2025"
 */
export function formatSeasonLabel(year) {
  if (year == null || year === '' || year === 'all') return String(year ?? '');
  const y = Number(year);
  if (Number.isNaN(y)) return String(year);
  return String(y);
}

/**
 * Build season options for dropdowns: value = year (2025), label = year (e.g. "2025").
 * @param {number[]} years - e.g. [2027, 2026, 2025, 2024]
 * @returns {{ value: number, label: string }[]}
 */
export function getSeasonOptions(years) {
  return years.map((y) => ({ value: y, label: String(y) }));
}
