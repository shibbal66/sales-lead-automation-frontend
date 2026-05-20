import { endOfDay, startOfDay } from "date-fns";
import { parseDateInput } from "@/lib/dateFormatting";
import type { MeetingApiStatus } from "@/types/meeting";

export const MEETINGS_FILTER_ALL = "__all__";

export const MEETING_STATUS_FILTER_OPTIONS: { value: string; label: string }[] = [
  { value: MEETINGS_FILTER_ALL, label: "All statuses" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" }
];

export const MEETING_STATUS_FORM_OPTIONS = MEETING_STATUS_FILTER_OPTIONS.filter(
  (opt) => opt.value !== MEETINGS_FILTER_ALL
);

export type MeetingsFilterDraft = {
  status: string;
  campaignId: string;
  fromDate: string;
  toDate: string;
};

export function statusFilterToQuery(value: string): MeetingApiStatus | undefined {
  if (value === MEETINGS_FILTER_ALL) return undefined;
  return value as MeetingApiStatus;
}

export function statusQueryToFilter(status?: MeetingApiStatus): string {
  return status ?? MEETINGS_FILTER_ALL;
}

export function campaignFilterToQuery(value: string): string | undefined {
  return value === MEETINGS_FILTER_ALL ? undefined : value;
}

/** `YYYY-MM-DD` → ISO start of day (UTC instant for API `from`). */
export function dateFilterToIsoFrom(dateInput: string): string | undefined {
  const d = parseDateInput(dateInput);
  if (!d) return undefined;
  return startOfDay(d).toISOString();
}

/** `YYYY-MM-DD` → ISO end of day (UTC instant for API `to`). */
export function dateFilterToIsoTo(dateInput: string): string | undefined {
  const d = parseDateInput(dateInput);
  if (!d) return undefined;
  return endOfDay(d).toISOString();
}

/** ISO → `YYYY-MM-DD` for date pickers. */
export function isoToDateFilterInput(iso?: string): string {
  if (!iso?.trim()) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}
