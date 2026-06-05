import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { FollowUpDraft } from "@/lib/followUpDraft";
import type { CampaignFollowUpApiModel } from "@/types";
import { ChevronDown, Pencil, Trash2 } from "lucide-react";

const WAIT_DAY_OPTIONS = [1, 2, 3, 5, 7] as const;

function formatWaitDays(days: number) {
  if (days === 0) return "Same day";
  if (days === 1) return "1 day";
  return `${days} days`;
}

function getWaitDayOptions(current: number) {
  const options = new Set<number>([...WAIT_DAY_OPTIONS, current]);
  return [...options].sort((a, b) => a - b);
}

type FollowUpStepRowProps = {
  step: CampaignFollowUpApiModel;
  index: number;
  draft: FollowUpDraft;
  isDirty: boolean;
  isEditing: boolean;
  isBodyExpanded: boolean;
  isRowBusy: boolean;
  blockOtherEdits: boolean;
  hasFollowUpChanges: boolean;
  onDraftChange: (patch: Partial<FollowUpDraft>) => void;
  onToggleBody: () => void;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onDelete: () => void;
};

export function FollowUpStepRow({
  step,
  index,
  draft,
  isDirty,
  isEditing,
  isBodyExpanded,
  isRowBusy,
  blockOtherEdits,
  hasFollowUpChanges,
  onDraftChange,
  onToggleBody,
  onStartEdit,
  onStopEdit,
  onDelete
}: FollowUpStepRowProps) {
  return (
    <li
      className={cn(
        "space-y-3 rounded-lg border bg-surface/40 p-3",
        isDirty ? "border-primary/40 ring-1 ring-primary/20" : "border-border"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-brand-text">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          {isEditing ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor={`follow-up-name-${step.id}`}>Name</Label>
                <Input
                  id={`follow-up-name-${step.id}`}
                  value={draft.name}
                  className="h-9"
                  disabled={isRowBusy}
                  onChange={(event) => onDraftChange({ name: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`follow-up-days-${step.id}`}>Wait days</Label>
                <select
                  id={`follow-up-days-${step.id}`}
                  value={draft.waiting_days}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  disabled={isRowBusy}
                  onChange={(event) =>
                    onDraftChange({ waiting_days: Number(event.target.value) })
                  }
                >
                  {getWaitDayOptions(draft.waiting_days).map((day) => (
                    <option key={day} value={day}>
                      {formatWaitDays(day)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <p className="truncate text-sm font-medium">{draft.name}</p>
              <p className="text-xs text-muted-foreground">{formatWaitDays(draft.waiting_days)}</p>
            </div>
          )}
          {isEditing ? (
            <div className="space-y-1.5">
              <Label htmlFor={`follow-up-body-${step.id}`}>Body template</Label>
              <Textarea
                id={`follow-up-body-${step.id}`}
                rows={4}
                value={draft.body_template}
                disabled={isRowBusy}
                onChange={(event) => onDraftChange({ body_template: event.target.value })}
                placeholder="Hi, hope you're doing well! Just wanted to gently follow up on my last note — happy to answer any questions when you have a moment."
              />
            </div>
          ) : null}
          {!isEditing && isBodyExpanded ? (
            <div className="rounded-md border border-border bg-muted/30 p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Mail template
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">
                {draft.body_template.trim() || "No template yet."}
              </p>
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-0.5">
          {!isEditing ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={isRowBusy || blockOtherEdits}
              title={isBodyExpanded ? "Hide mail template" : "Show mail template"}
              aria-expanded={isBodyExpanded}
              onClick={onToggleBody}
            >
              <ChevronDown
                className={cn("h-4 w-4 transition-transform", !isBodyExpanded && "-rotate-90")}
              />
            </Button>
          ) : null}
          {isEditing ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              disabled={isRowBusy}
              onClick={onStopEdit}
            >
              Done
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              disabled={isRowBusy || blockOtherEdits}
              title="Edit step"
              onClick={onStartEdit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={isRowBusy || hasFollowUpChanges}
            title={hasFollowUpChanges ? "Save or discard changes before deleting" : "Delete step"}
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </li>
  );
}
