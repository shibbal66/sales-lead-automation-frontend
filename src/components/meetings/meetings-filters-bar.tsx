import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/datetime-picker";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  isoToDateFilterInput,
  MEETINGS_FILTER_ALL,
  MEETING_STATUS_FILTER_OPTIONS,
  statusQueryToFilter,
  type MeetingsFilterDraft
} from "@/lib/meetings/filters";
import type { MeetingsViewMode } from "@/lib/meetings";
import type { MeetingReadStatus } from "@/types/meeting";
import type { CampaignApiModel } from "@/types/campaign";

export type { MeetingsFilterDraft };

type MeetingsFiltersBarProps = {
  view: MeetingsViewMode;
  draft: MeetingsFilterDraft;
  campaigns: CampaignApiModel[];
  disabled?: boolean;
  onDraftChange: (patch: Partial<MeetingsFilterDraft>) => void;
  onNewMeeting: () => void;
};

export function meetingsFiltersFromStore(filters: {
  status?: MeetingReadStatus;
  campaign_id?: string;
  from?: string;
  to?: string;
}): MeetingsFilterDraft {
  return {
    status: statusQueryToFilter(filters.status),
    campaignId: filters.campaign_id ?? MEETINGS_FILTER_ALL,
    fromDate: isoToDateFilterInput(filters.from),
    toDate: isoToDateFilterInput(filters.to)
  };
}

export function MeetingsFiltersBar({
  view,
  draft,
  campaigns,
  disabled,
  onDraftChange,
  onNewMeeting
}: MeetingsFiltersBarProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 border-b border-border bg-muted/15 px-5 py-4">
      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Status</Label>
        <Select
          value={draft.status}
          disabled={disabled}
          onValueChange={(status) => onDraftChange({ status })}
        >
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MEETING_STATUS_FILTER_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs text-muted-foreground">Campaign</Label>
        <Select
          value={draft.campaignId}
          disabled={disabled}
          onValueChange={(campaignId) => onDraftChange({ campaignId })}
        >
          <SelectTrigger className="h-9 w-[180px]">
            <SelectValue placeholder="All campaigns" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={MEETINGS_FILTER_ALL}>All campaigns</SelectItem>
            {campaigns.map((c) =>
              c.id ? (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ) : null
            )}
          </SelectContent>
        </Select>
      </div>

      {view === "list" ? (
        <>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">From</Label>
            <DatePicker
              value={draft.fromDate}
              onChange={(fromDate) => onDraftChange({ fromDate })}
              placeholder="Any date"
              disabled={disabled}
              className="h-9 w-[160px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">To</Label>
            <DatePicker
              value={draft.toDate}
              onChange={(toDate) => onDraftChange({ toDate })}
              placeholder="Any date"
              disabled={disabled}
              className="h-9 w-[160px]"
            />
          </div>
        </>
      ) : null}

      <Button
        type="button"
        className="ml-auto h-9 shrink-0 gap-1.5"
        disabled={disabled}
        onClick={onNewMeeting}
      >
        <Plus className="h-4 w-4" />
        New meeting
      </Button>
    </div>
  );
}
