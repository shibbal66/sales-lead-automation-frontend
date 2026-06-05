import { startOfDay } from "date-fns";
import { parseDatetimeLocalInput } from "@/lib/dateFormatting";

export const MEETING_PAST_DATE_MESSAGE =
  "Meetings can only be scheduled for today or a future date";

/** Local calendar day is today or later (midnight comparison). */
export function isAllowedMeetingCalendarDay(day: Date): boolean {
  return startOfDay(day).getTime() >= startOfDay(new Date()).getTime();
}

/** `datetime-local` start is on today or a future local calendar day. */
export function isAllowedMeetingStartLocal(startLocal: string): boolean {
  const parsed = parseDatetimeLocalInput(startLocal.trim());
  if (!parsed) return false;
  return isAllowedMeetingCalendarDay(parsed);
}
