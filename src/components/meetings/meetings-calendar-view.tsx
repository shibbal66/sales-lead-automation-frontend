import { useMemo, useState } from "react";
import { MeetingsDayDetailDialog } from "@/components/meetings/meetings-day-detail-dialog";
import { MeetingsMonthCalendar } from "@/components/meetings/meetings-month-calendar";
import { MeetingsCalendarSkeleton } from "@/components/skeletons/meetings/meetings-calendar-skeleton";
import { cn } from "@/lib/utils";
import { getMeetingsOnDay, isAllowedMeetingCalendarDay } from "@/lib/meetings";
import type { Meeting } from "@/types/meeting";

type MeetingsCalendarViewProps = {
  meetings: Meeting[];
  onCreateMeeting: (day: Date) => void;
  onEditMeeting?: (meeting: Meeting) => void;
  onDeleteMeeting?: (meeting: Meeting) => void;
  actionsDisabled?: boolean;
  isLoading?: boolean;
};

export function MeetingsCalendarView({
  meetings,
  onCreateMeeting,
  onEditMeeting,
  onDeleteMeeting,
  actionsDisabled,
  isLoading
}: MeetingsCalendarViewProps) {
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  const selectedDayMeetings = useMemo(
    () => (selectedDay ? getMeetingsOnDay(meetings, selectedDay) : []),
    [meetings, selectedDay]
  );

  const dayDialogOpen = selectedDay !== null && selectedDayMeetings.length > 0;

  const handleAddMeeting = () => {
    if (!selectedDay || !isAllowedMeetingCalendarDay(selectedDay)) return;
    const day = selectedDay;
    setSelectedDay(null);
    onCreateMeeting(day);
  };

  const canAddMeetingOnSelectedDay = selectedDay
    ? isAllowedMeetingCalendarDay(selectedDay)
    : false;

  if (isLoading && meetings.length === 0) {
    return <MeetingsCalendarSkeleton />;
  }

  return (
    <div className="relative flex min-h-[520px] flex-col">
      {isLoading && meetings.length > 0 ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-0 z-10 bg-background/40",
            "animate-pulse"
          )}
          aria-hidden
        />
      ) : null}
      <MeetingsMonthCalendar
        meetings={meetings}
        selectedDay={selectedDay}
        onSelectedDayChange={setSelectedDay}
        onCreateMeeting={onCreateMeeting}
      />

      {selectedDay ? (
        <MeetingsDayDetailDialog
          open={dayDialogOpen}
          onOpenChange={(open) => {
            if (!open) setSelectedDay(null);
          }}
          day={selectedDay}
          meetings={selectedDayMeetings}
          onAddMeeting={handleAddMeeting}
          canAddMeeting={canAddMeetingOnSelectedDay}
          onEditMeeting={(meeting) => {
            setSelectedDay(null);
            onEditMeeting?.(meeting);
          }}
          onDeleteMeeting={(meeting) => {
            setSelectedDay(null);
            onDeleteMeeting?.(meeting);
          }}
          actionsDisabled={actionsDisabled}
        />
      ) : null}
    </div>
  );
}
