import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Meeting } from "@/types/meeting";

type MeetingRowActionsProps = {
  meeting: Meeting;
  onEdit?: (meeting: Meeting) => void;
  onDelete?: (meeting: Meeting) => void;
  disabled?: boolean;
  className?: string;
};

export function MeetingRowActions({
  meeting,
  onEdit,
  onDelete,
  disabled,
  className
}: MeetingRowActionsProps) {
  const isCancelled = meeting.apiStatus === "cancelled";

  return (
    <div
      className={`flex shrink-0 flex-wrap items-center gap-1 ${className ?? ""}`}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      {onEdit && !isCancelled ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1 px-2.5"
          disabled={disabled}
          onClick={() => onEdit(meeting)}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      ) : null}
      {onDelete && !isCancelled ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1 px-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          disabled={disabled}
          onClick={() => onDelete(meeting)}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ) : null}
    </div>
  );
}
