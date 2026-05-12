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

  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) return "just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
