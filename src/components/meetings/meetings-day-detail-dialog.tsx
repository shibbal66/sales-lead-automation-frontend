import { format } from "date-fns";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MEETING_PAST_DATE_MESSAGE } from "@/lib/meetings";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { MeetingDetailCard } from "@/components/meetings/meeting-detail-card";
import type { Meeting } from "@/types/meeting";

type MeetingsDayDetailDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  day: Date;
  meetings: Meeting[];
  onAddMeeting: () => void;
  onEditMeeting?: (meeting: Meeting) => void;
  onDeleteMeeting?: (meeting: Meeting) => void;
  actionsDisabled?: boolean;
  /** False when the selected day is before today (create blocked). */
  canAddMeeting?: boolean;
};

export function MeetingsDayDetailDialog({
  open,
  onOpenChange,
  day,
  meetings,
  onAddMeeting,
  onEditMeeting,
  onDeleteMeeting,
  actionsDisabled,
  canAddMeeting = true
}: MeetingsDayDetailDialogProps) {
  const addMeetingDisabled = actionsDisabled || !canAddMeeting;
  const dayLabel = format(day, "EEEE, MMMM d");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-hidden flex flex-col gap-0 p-0">
        <DialogHeader className="border-b border-border px-6 py-4 text-left">
          <DialogTitle className="font-display">{dayLabel}</DialogTitle>
          <p className="text-sm text-muted-foreground">
            {meetings.length} meeting{meetings.length === 1 ? "" : "s"}
          </p>
        </DialogHeader>

        <div className="max-h-[min(50vh,400px)] space-y-3 overflow-y-auto scrollbar-thin px-6 py-4">
          {meetings.map((meeting) => (
            <MeetingDetailCard
              key={meeting.id}
              meeting={meeting}
              onEdit={onEditMeeting}
              onDelete={onDeleteMeeting}
              actionsDisabled={actionsDisabled}
            />
          ))}
        </div>

        <DialogFooter className="border-t border-border px-6 py-4 sm:justify-stretch">
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="w-full">
                <Button
                  type="button"
                  className="w-full gap-1.5"
                  disabled={addMeetingDisabled}
                  onClick={onAddMeeting}
                >
                  <Plus className="h-4 w-4" />
                  Add meeting
                </Button>
              </span>
            </TooltipTrigger>
            {!canAddMeeting ? (
              <TooltipContent>{MEETING_PAST_DATE_MESSAGE}</TooltipContent>
            ) : null}
          </Tooltip>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
