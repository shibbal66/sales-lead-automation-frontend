import { StatusPill } from "@/components/status-pill";
import { MeetingRowActions } from "@/components/meetings/meeting-row-actions";
import type { Meeting } from "@/types/meeting";

type MeetingDetailCardProps = {
  meeting: Meeting;
  onEdit?: (meeting: Meeting) => void;
  onDelete?: (meeting: Meeting) => void;
  actionsDisabled?: boolean;
};

export function MeetingDetailCard({
  meeting,
  onEdit,
  onDelete,
  actionsDisabled
}: MeetingDetailCardProps) {
  const isCancelled = meeting.apiStatus === "cancelled";
  const showActions =
    (onEdit != null && !isCancelled) || (onDelete != null && !isCancelled);

  return (
    <div className="rounded-xl border border-border bg-surface/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{meeting.leadName}</p>
          <p className="text-sm text-muted-foreground">{meeting.company}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {showActions ? (
            <MeetingRowActions
              meeting={meeting}
              onEdit={onEdit}
              onDelete={onDelete}
              disabled={actionsDisabled}
            />
          ) : null}
          <StatusPill status={meeting.status} />
        </div>
      </div>
      <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Campaign</dt>
          <dd className="mt-0.5">{meeting.campaign}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Meeting</dt>
          <dd className="mt-0.5">{meeting.date}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Booked at</dt>
          <dd className="mt-0.5 text-muted-foreground">{meeting.bookedAt}</dd>
        </div>
      </dl>
    </div>
  );
}
