/**
 * Parses a display date string into a Date object.
 * Handles formats used in mock data:
 *   "21 Feb 2026"                → date only
 *   "12 Jan 2026, 08:40am"       → date + time separated by comma
 *   "Jan 12, 2025 · 10:24 AM"    → date + time separated by ·
 */
export function parseDateStr(str: string): Date | null {
  const withoutBullet = str.split("·")[0].trim()
  // Strip trailing time portion: ", HH:MM..." or " HH:MM..."
  const dateOnly = withoutBullet.replace(/,?\s+\d{1,2}:\d{2}.*$/i, "").trim()
  const d = new Date(dateOnly)
  return isNaN(d.getTime()) ? null : d
}
