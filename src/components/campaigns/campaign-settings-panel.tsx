import { useLayoutEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Bot, Hand, Pencil } from "lucide-react";
import {
  type CampaignDetailFormErrors,
  type CampaignDetailRunMode,
  type CampaignDetailStatus,
  type CampaignDetailViewModel,
  type CampaignTone,
} from "@/lib/campaignPresentation";
import type { CampaignLeadSource } from "@/types";
import { sanitizeCampaignCallToActionInput, sanitizeCampaignTargetZoneInput, CALL_TO_ACTION_MAX_LENGTH, CAMPAIGN_GOAL_MAX_LENGTH, TARGET_ZONE_MAX_LENGTH } from "@/validators";

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
  errors: CampaignDetailFormErrors;
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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-xs text-destructive">{message}</p>;
}

export function CampaignSettingsPanel({
  name,
  goal,
  targetZone,
  callToAction,
  leadSource,
  runMode,
  tone,
  targetLeads,
  status,
  errors,
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
  onStatusChange,
}: CampaignSettingsPanelProps) {
  const nameRef = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [name]);

  return (
    <Card className="p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <textarea
          ref={nameRef}
          rows={1}
          value={name}
          aria-label="Campaign name"
          onChange={(event) => onNameChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
          className="w-full resize-none overflow-hidden break-words border-0 bg-transparent p-0 font-display text-lg font-bold outline-none ring-0 focus:outline-none focus:ring-0"
        />
      </div>
      <FieldError message={errors.name} />

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
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {option}
              </button>
            ))}
          </div>
          <FieldError message={errors.status} />
        </div>

        <div className="space-y-2">
          <Label>Run Mode</Label>
          <div className="grid grid-cols-2 rounded-lg bg-muted p-1">
            {(
              [
                { id: "automatic", label: "Automatic", icon: Bot },
                { id: "manual", label: "Manual", icon: Hand },
              ] as const
            ).map((modeOption) => {
              const Icon = modeOption.icon;
              const selected = runMode === modeOption.id;
              return (
                <button
                  key={modeOption.id}
                  type="button"
                  onClick={() => onRunModeChange(modeOption.id)}
                  className={cn(
                    "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all",
                    selected &&
                      (modeOption.id === "automatic"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "bg-warning text-warning-foreground shadow-sm"),
                    !selected && "text-muted-foreground hover:text-foreground",
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
          <FieldError message={errors.runMode} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="goal">Campaign Goal</Label>
          <Textarea
            id="goal"
            rows={3}
            value={goal}
            maxLength={CAMPAIGN_GOAL_MAX_LENGTH}
            aria-invalid={!!errors.goal}
            onChange={(event) => onGoalChange(event.target.value)}
          />
          <FieldError message={errors.goal} />
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
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {toneOption}
              </button>
            ))}
          </div>
          <FieldError message={errors.tone} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="cta">Call to Action</Label>
          <Input
            id="cta"
            value={callToAction}
            maxLength={CALL_TO_ACTION_MAX_LENGTH}
            aria-invalid={!!errors.callToAction}
            onChange={(event) => onCallToActionChange(sanitizeCampaignCallToActionInput(event.target.value))}
          />
          <FieldError message={errors.callToAction} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="target-zone">Target zone</Label>
          <Input
            id="target-zone"
            value={targetZone}
            maxLength={TARGET_ZONE_MAX_LENGTH}
            aria-invalid={!!errors.targetZone}
            onChange={(event) => onTargetZoneChange(sanitizeCampaignTargetZoneInput(event.target.value))}
          />
          <FieldError message={errors.targetZone} />
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
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {option}
              </button>
            ))}
          </div>
          <FieldError message={errors.leadSource} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="target-leads" className="text-base font-semibold">
            Target leads
          </Label>
          <Input
            id="target-leads"
            type="number"
            min={1}
            value={targetLeads}
            className="px-4 py-3 font-display text-base font-semibold [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
            onChange={(event) =>
              onTargetLeadsChange(Number(event.target.value) || 0)
            }
          />
          <FieldError message={errors.targetLeads} />
        </div>
      </div>
    </Card>
  );
}

