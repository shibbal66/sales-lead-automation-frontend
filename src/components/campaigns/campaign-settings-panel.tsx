import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Bot, Hand, Pencil } from "lucide-react";
import { formatDateTime } from "@/lib/dateFormatting";
import {
  type CampaignDetailRunMode,
  type CampaignDetailStatus,
  type CampaignDetailViewModel,
  type CampaignTone
} from "@/lib/campaignPresentation";
import type { CampaignLeadSource } from "@/types";

type CampaignSettingsPanelProps = {
  campaign: CampaignDetailViewModel;
  name: string;
  goal: string;
  targetZone: string;
  callToAction: string;
  leadSource: CampaignLeadSource;
  runMode: CampaignDetailRunMode;
  tone: CampaignTone;
  targetLeads: number;
  status: CampaignDetailStatus;
  statusOptions: readonly CampaignDetailStatus[];
  leadSourceOptions: readonly CampaignLeadSource[];
  toneOptions: readonly CampaignTone[];
  onNameChange: (value: string) => void;
  onGoalChange: (value: string) => void;
  onTargetZoneChange: (value: string) => void;
  onCallToActionChange: (value: string) => void;
  onLeadSourceChange: (value: CampaignLeadSource) => void;
  onRunModeChange: (value: CampaignDetailRunMode) => void;
  onToneChange: (value: CampaignTone) => void;
  onTargetLeadsChange: (value: number) => void;
  onStatusChange: (value: CampaignDetailStatus) => void;
};

export function CampaignSettingsPanel({
  campaign,
  name,
  goal,
  targetZone,
  callToAction,
  leadSource,
  runMode,
  tone,
  targetLeads,
  status,
  statusOptions,
  leadSourceOptions,
  toneOptions,
  onNameChange,
  onGoalChange,
  onTargetZoneChange,
  onCallToActionChange,
  onLeadSourceChange,
  onRunModeChange,
  onToneChange,
  onTargetLeadsChange,
  onStatusChange
}: CampaignSettingsPanelProps) {
  return (
    <Card className="p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          className="w-full bg-transparent font-display text-lg font-bold focus:outline-none focus:ring-0"
        />
        <Pencil className="h-4 w-4 shrink-0 text-muted-foreground" />
      </div>

      <div className="mt-4 space-y-4">
        <div className="space-y-2 rounded-lg border border-border p-3">
          <Label>Campaign Status</Label>
          <div className="flex flex-wrap gap-1.5">
            {statusOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onStatusChange(option)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors",
                  status === option
                    ? "border-primary bg-primary/15 text-brand-text"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label>Run Mode</Label>
          <div className="grid grid-cols-2 rounded-lg bg-muted p-1">
            {([
              { id: "automatic", label: "Automatic", icon: Bot },
              { id: "manual", label: "Manual", icon: Hand }
            ] as const).map((modeOption) => {
              const Icon = modeOption.icon;
              const selected = runMode === modeOption.id;
              return (
                <button
                  key={modeOption.id}
                  type="button"
                  onClick={() => onRunModeChange(modeOption.id)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all",
                    selected && (modeOption.id === "automatic"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-warning text-warning-foreground shadow-sm"),
                    !selected && "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" /> {modeOption.label}
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {runMode === "automatic"
              ? "AI sends emails and follow-ups on schedule, no review required."
              : "Each email queued as draft for your review before sending."}
          </p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="goal">Campaign Goal</Label>
          <Textarea id="goal" rows={3} value={goal} onChange={(event) => onGoalChange(event.target.value)} />
        </div>

        <div className="space-y-2">
          <Label>Target Tone</Label>
          <div className="flex flex-wrap gap-1.5">
            {toneOptions.map((toneOption) => (
              <button
                key={toneOption}
                type="button"
                onClick={() => onToneChange(toneOption)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                  tone === toneOption
                    ? "border-primary bg-primary/15 text-brand-text"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {toneOption}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cta">Call to Action</Label>
          <Input id="cta" value={callToAction} onChange={(event) => onCallToActionChange(event.target.value)} />
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <p className="text-xs font-semibold text-muted-foreground">API Campaign Details</p>
          <div className="mt-2 space-y-2 text-xs">
            <div className="space-y-1">
              <Label htmlFor="target-zone">Target zone</Label>
              <Input
                id="target-zone"
                value={targetZone}
                onChange={(event) => onTargetZoneChange(event.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="target-leads">Target leads</Label>
              <Input
                id="target-leads"
                type="number"
                min={0}
                value={targetLeads}
                onChange={(event) => onTargetLeadsChange(Number(event.target.value) || 0)}
              />
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Lead Source</Label>
          <div className="flex flex-wrap gap-1.5">
            {leadSourceOptions.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onLeadSourceChange(option)}
                className={cn(
                  "rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors",
                  leadSource === option
                    ? "border-primary bg-primary/15 text-brand-text"
                    : "border-border text-muted-foreground hover:bg-muted"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-xs text-muted-foreground">Assigned leads</p>
          <div className="mt-1 flex items-center justify-between">
            <p className="font-display text-2xl font-bold">{targetLeads}</p>
          </div>
        </div>

      </div>
    </Card>
  );
}
