import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths
} from "date-fns";
import type { Meeting } from "@/types/meeting";
import { parseMeetingDate } from "./presentation";

export const WEEKDAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"] as const;

export const MAX_MEETINGS_VISIBLE_IN_CELL = 2;

export type MonthCalendarCell = {
  date: Date;
  dayKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
};

export function buildMonthCalendarGrid(month: Date): MonthCalendarCell[] {
  const monthStart = startOfMonth(month);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(endOfMonth(monthStart), { weekStartsOn: 1 });
  const today = startOfDay(new Date());

  return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => ({
    date,
    dayKey: date.toISOString(),
    dayNumber: date.getDate(),
    isCurrentMonth: isSameMonth(date, monthStart),
    isToday: isSameDay(date, today)
  }));
}

export function formatMonthYearLabel(month: Date): string {
  return format(month, "MMMM yyyy");
}

export function getMeetingsForMonth(meetings: Meeting[], month: Date): Meeting[] {
  const monthStart = startOfMonth(month);
  return meetings.filter((m) => isSameMonth(parseMeetingDate(m), monthStart));
}

export function meetingEventLabel(meeting: Meeting): string {
  return meeting.leadName || meeting.company || "Meeting";
}

export function meetingEventColorClass(status: string): string {
  const normalized = status.trim().toLowerCase();
  if (normalized === "completed") {
    return "bg-success/20 text-success border-success/30 hover:bg-success/30";
  }
  if (normalized === "cancelled") {
    return "bg-muted text-muted-foreground border-border hover:bg-muted/80";
  }
  return "bg-primary/20 text-brand-text border-primary/30 hover:bg-primary/30";
}
