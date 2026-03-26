/**
 * Common formatters for Drug Cross-Reactivity Project
 */

/**
 * Formats a date string into a user-friendly locale string
 * @param value ISO date string or null
 * @returns Formatted date string (e.g., "2026. 3. 26.")
 */
export function formatDate(value: string | null): string {
  if (!value) return 'N/A';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(value.includes('T') ? { hour: '2-digit', minute: '2-digit' } : {}),
  }).format(parsed);
}

/**
 * Capitalizes the first letter of a string
 */
export function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Truncates text with ellipsis
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}
