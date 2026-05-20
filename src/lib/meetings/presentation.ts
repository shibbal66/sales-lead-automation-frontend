import { isSameDay, parseISO, startOfDay } from "date-fns";
import type { Meeting } from "@/types/meeting";

export type MeetingsViewMode = "list" | "calendar";

export function parseMeetingDate(meeting: Meeting): Date {
  return parseISO(meeting.meetingAt);
}

export function getMeetingsOnDay(meetings: Meeting[], day: Date): Meeting[] {
  const dayStart = startOfDay(day);
  return meetings
    .filter((m) => isSameDay(parseMeetingDate(m), dayStart))
    .sort((a, b) => parseMeetingDate(a).getTime() - parseMeetingDate(b).getTime());
}

export function hasMeetingsOnDay(meetings: Meeting[], day: Date): boolean {
  return getMeetingsOnDay(meetings, day).length > 0;
}

export function getInitialCalendarDay(meetings: Meeting[]): Date | undefined {
  const upcoming = meetings
    .filter((m) => m.status === "Upcoming")
    .sort((a, b) => parseMeetingDate(a).getTime() - parseMeetingDate(b).getTime());
  if (upcoming[0]) return startOfDay(parseMeetingDate(upcoming[0]));
  if (meetings[0]) return startOfDay(parseMeetingDate(meetings[0]));
  return undefined;
}
