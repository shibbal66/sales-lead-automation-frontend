import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { addMonths, isSameDay, startOfDay, startOfMonth, subMonths } from "date-fns";
import {
  buildMonthCalendarGrid,
  formatMonthYearLabel,
  MAX_MEETINGS_VISIBLE_IN_CELL,
  meetingEventColorClass,
  meetingEventLabel,
  WEEKDAY_LABELS,
  type MonthCalendarCell
} from "@/lib/meetings/calendarGrid";
import { isAllowedMeetingCalendarDay } from "@/lib/meetings/meetingDates";
import { getInitialCalendarDay, getMeetingsOnDay } from "@/lib/meetings/presentation";
import type { Meeting } from "@/types/meeting";
import { cn } from "@/lib/utils";

type MeetingsMonthCalendarProps = {
  meetings: Meeting[];
  selectedDay: Date | null;
  onSelectedDayChange: (day: Date | null) => void;
  onCreateMeeting: (day: Date) => void;
};

export function MeetingsMonthCalendar({
  meetings,
  selectedDay,
  onSelectedDayChange,
  onCreateMeeting
}: MeetingsMonthCalendarProps) {
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const prevMeetingsCountRef = useRef(0);

  // Month is initialized before the API returns; sync once meetings first populate.
  useEffect(() => {
    const prevCount = prevMeetingsCountRef.current;
    prevMeetingsCountRef.current = meetings.length;
    if (meetings.length === 0 || prevCount > 0) return;

    const initial = getInitialCalendarDay(meetings);
    if (initial) setMonth(startOfMonth(initial));
  }, [meetings]);

  const cells = useMemo(() => buildMonthCalendarGrid(month), [month]);
  const monthLabel = formatMonthYearLabel(month);

  const handleToday = () => {
    const today = startOfDay(new Date());
    setMonth(startOfMonth(today));
    onSelectedDayChange(today);
  };

  const handleDayClick = (cell: MonthCalendarCell) => {
    const dayMeetings = getMeetingsOnDay(meetings, cell.date);
    if (dayMeetings.length === 0) {
      if (isAllowedMeetingCalendarDay(cell.date)) {
        onCreateMeeting(cell.date);
      }
      return;
    }
    onSelectedDayChange(cell.date);
  };

  const handleEventClick = (e: React.MouseEvent, day: Date) => {
    e.stopPropagation();
    onSelectedDayChange(day);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleToday}>
            Today
          </Button>
          <div className="flex items-center gap-0.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Previous month"
              onClick={() => setMonth((m) => subMonths(m, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Next month"
              onClick={() => setMonth((m) => addMonths(m, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <span className="font-display text-lg font-semibold tracking-tight">{monthLabel}</span>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border bg-muted/30">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="border-r border-border px-1 py-2 text-center text-[11px] font-semibold tracking-wide text-muted-foreground last:border-r-0"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid min-h-[480px] flex-1 auto-rows-fr grid-cols-7">
        {cells.map((cell) => {
          const dayMeetings = getMeetingsOnDay(meetings, cell.date);
          const visible = dayMeetings.slice(0, MAX_MEETINGS_VISIBLE_IN_CELL);
          const overflow = dayMeetings.length - visible.length;
          const isSelected = selectedDay ? isSameDay(selectedDay, cell.date) : false;
          const isPastDay = !isAllowedMeetingCalendarDay(cell.date);

          return (
            <button
              key={cell.dayKey}
              type="button"
              onClick={() => handleDayClick(cell)}
              className={cn(
                "flex min-h-[88px] flex-col border-b border-r border-border p-1.5 text-left transition-colors last:border-r-0",
                "hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                !cell.isCurrentMonth && "bg-muted/15 text-muted-foreground",
                isPastDay && "cursor-default opacity-60 hover:bg-transparent",
                isSelected && "bg-primary/10 ring-1 ring-inset ring-primary/40"
              )}
            >
              <span
                className={cn(
                  "mb-1 inline-flex h-6 w-6 items-center justify-center self-end rounded-full text-xs font-medium",
                  cell.isToday && "bg-primary text-primary-foreground",
                  !cell.isToday && "text-foreground"
                )}
              >
                {cell.dayNumber}
              </span>

              <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-hidden">
                {visible.map((meeting) => (
                  <span
                    key={meeting.id}
                    role="presentation"
                    onClick={(e) => handleEventClick(e, cell.date)}
                    className={cn(
                      "truncate rounded px-1.5 py-0.5 text-left text-[10px] font-medium leading-tight border",
                      meetingEventColorClass(meeting.status)
                    )}
                    title={meetingEventLabel(meeting)}
                  >
                    {meetingEventLabel(meeting)}
                  </span>
                ))}
                {overflow > 0 ? (
                  <span className="truncate px-1 text-[10px] font-medium text-muted-foreground">
                    +{overflow} more
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
