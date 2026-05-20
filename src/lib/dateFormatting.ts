export const EMPTY_DATE_LABEL = "—";

function parseDateValue(value?: string | null): Date | null {
  if (value === null || value === undefined) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

export function hasPresentableDate(value?: string | null): boolean {
  return parseDateValue(value) !== null;
}

export function formatDateTime(value?: string | null): string {
  const date = parseDateValue(value);
  if (!date) return value?.trim() ? value : EMPTY_DATE_LABEL;
  return date.toLocaleString();
}

export function formatRelativeDate(value?: string | null): string {
  const date = parseDateValue(value);
  if (!date) return value?.trim() ? value : EMPTY_DATE_LABEL;

  const diffMs = Math.max(0, Date.now() - date.getTime());
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 1) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

/** Local `YYYY-MM-DDThh:mm` from a Date (pickers / datetime-local string). */
export function formatDatetimeLocalFromDate(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${y}-${mo}-${day}T${h}:${min}`;
}

/** Parse `YYYY-MM-DDThh:mm` as local wall clock; undefined if invalid or empty. */
export function parseDatetimeLocalInput(value: string): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value.trim());
  if (!m) return undefined;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), 0, 0);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Local calendar date `YYYY-MM-DD`. */
export function formatDateInput(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

/** Parse `YYYY-MM-DD` as local date at noon (avoids TZ shift). */
export function parseDateInput(value: string): Date | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!m) return undefined;
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), 12, 0, 0, 0);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

/** Format an ISO timestamp for `<input type="datetime-local" />` (local wall time). */
export function isoToDatetimeLocalValue(iso?: string | null): string {
  const date = parseDateValue(iso);
  if (!date) return "";
  return formatDatetimeLocalFromDate(date);
}

/** Interpret `datetime-local` value as local time and return UTC ISO 8601, or null if empty/invalid. */
export function datetimeLocalValueToIsoUtc(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = parseDatetimeLocalInput(trimmed);
  if (parsed) return parsed.toISOString();
  const date = parseDateValue(trimmed);
  if (!date) return null;
  return date.toISOString();
}
