import {
  createCampaignSchema,
  createCampaignSchemaForPlan,
  sanitizeCampaignCallToActionInput,
  sanitizeCampaignNameInput,
  sanitizeCampaignTargetZoneInput,
  type CreateCampaignFormValues
} from "@/validators/campaign";
import type {
  CampaignApiModel,
  CampaignLeadSource,
  CampaignStatus,
  MailTemplateSample,
  UpdateCampaignRequest
} from "@/types";
import { CAMPAIGN_LEAD_SOURCE_VALUES } from "@/types/campaign";
import type { ZodError } from "zod";

export const CAMPAIGN_DETAIL_STATUSES = ["draft", "active", "paused", "completed"] as const;
export const CAMPAIGN_TONES = ["Friendly", "Professional", "Direct", "Consultative"] as const;
export const CAMPAIGN_LEAD_SOURCES: CampaignLeadSource[] = [...CAMPAIGN_LEAD_SOURCE_VALUES];

export const DEFAULT_MAIL_TRAINING_INSTRUCTION =
  "Write in a warm, conversational tone.";

type CampaignApiRaw = CampaignApiModel & {
  targetZone?: string;
  callToAction?: string;
  runMode?: CampaignApiModel["run_mode"];
  targetTone?: string;
  mailTrainingInstruction?: string | null;
  mailTemplateSamples?: MailTemplateSample[] | null;
  leadSource?: CampaignLeadSource;
  senderDisplayName?: string | null;
  senderAddress?: string | null;
  senderPhone?: string | null;
  targetLeads?: number;
};

function firstNonEmptyString(...candidates: Array<string | null | undefined>): string {
  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

/** Merges snake_case and camelCase API shapes so list/detail payloads map consistently. */
export function normalizeCampaignApiModel(campaign: CampaignApiModel): CampaignApiModel {
  const raw = campaign as CampaignApiRaw;
  return {
    ...campaign,
    target_zone: firstNonEmptyString(campaign.target_zone, raw.targetZone),
    call_to_action: firstNonEmptyString(campaign.call_to_action, raw.callToAction),
    run_mode: campaign.run_mode ?? raw.runMode ?? "auto",
    target_tone: firstNonEmptyString(campaign.target_tone, raw.targetTone) || CAMPAIGN_TONES[0],
    mail_training_instruction:
      campaign.mail_training_instruction ?? raw.mailTrainingInstruction ?? null,
    mail_template_samples:
      campaign.mail_template_samples ?? raw.mailTemplateSamples ?? null,
    lead_source: campaign.lead_source ?? raw.leadSource ?? "new",
    sender_display_name: campaign.sender_display_name ?? raw.senderDisplayName ?? null,
    sender_address: campaign.sender_address ?? raw.senderAddress ?? null,
    sender_phone: campaign.sender_phone ?? raw.senderPhone ?? null,
    target_leads: campaign.target_leads ?? raw.targetLeads ?? 1
  };
}

export type CampaignDetailStatus = (typeof CAMPAIGN_DETAIL_STATUSES)[number];
export type CampaignDetailRunMode = "automatic" | "manual";
export type CampaignTone = (typeof CAMPAIGN_TONES)[number];

export type CampaignStatsViewModel = {
  totalLeads: number;
  pendingCount: number;
  failedCount: number;
  sentCount: number;
  replyRate: number;
  replyRatePercent: number;
};

export type CampaignDetailViewModel = {
  id: string;
  name: string;
  goal: string;
  status: CampaignDetailStatus;
  runMode: CampaignDetailRunMode;
  targetZone: string;
  callToAction: string;
  leadSource: CampaignLeadSource;
  targetTone: string;
  mailTrainingInstruction: string;
  mailTemplateSamples: MailTemplateSample[];
  senderDisplayName: string;
  senderAddress: string;
  senderPhone: string;
  targetLeads: number;
  createdAt: string;
  updatedAt: string;
} & CampaignStatsViewModel;

export type CampaignListCardViewModel = {
  id: string;
  name: string;
  goal: string;
  status: CampaignStatus;
  runMode: CampaignDetailRunMode;
  targetLeads: number;
} & CampaignStatsViewModel;

export function formatCampaignListLeadsValue(totalLeads: number, targetLeads: number): string {
  return `${totalLeads.toLocaleString()}/${targetLeads.toLocaleString()}`;
}

export function getCampaignListProgressPercent(totalLeads: number, targetLeads: number): number {
  if (!Number.isFinite(targetLeads) || targetLeads <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((totalLeads / targetLeads) * 100)));
}

export function mapApiRunMode(runMode: CampaignApiModel["run_mode"]): CampaignDetailRunMode {
  return runMode === "auto" ? "automatic" : "manual";
}

export function mapApiStatusToDetailStatus(status: CampaignStatus): CampaignDetailStatus {
  if (status === "running" || status === "active") return "active";
  if (status === "paused" || status === "completed" || status === "draft") return status;
  return "draft";
}

export function mapApiStatusToListStatus(status: CampaignStatus): CampaignStatus {
  return status === "active" ? "running" : status;
}

export function mapCampaignApiToStats(campaign: CampaignApiModel): CampaignStatsViewModel {
  const replyRate = campaign.reply_rate ?? 0;
  const replyRatePercent =
    campaign.reply_rate_percent ??
    (campaign.reply_rate != null && campaign.reply_rate <= 1
      ? Math.round(campaign.reply_rate * 100)
      : campaign.reply_rate ?? 0);

  return {
    totalLeads: campaign.total_leads ?? 0,
    pendingCount: campaign.pending_count ?? 0,
    failedCount: campaign.failed_count ?? 0,
    sentCount: campaign.sent_count ?? 0,
    replyRate,
    replyRatePercent
  };
}

export function mapCampaignApiToDetail(campaign: CampaignApiModel): CampaignDetailViewModel {
  const normalized = normalizeCampaignApiModel(campaign);
  const mailTrainingInstruction = normalized.mail_training_instruction ?? "";

  return {
    id: normalized.id,
    name: normalized.name,
    goal: normalized.goal,
    status: mapApiStatusToDetailStatus(normalized.status),
    runMode: mapApiRunMode(normalized.run_mode),
    targetZone: normalized.target_zone,
    callToAction: normalized.call_to_action,
    leadSource: normalized.lead_source,
    targetTone: normalized.target_tone ?? CAMPAIGN_TONES[0],
    mailTrainingInstruction: mailTrainingInstruction,
    mailTemplateSamples: normalized.mail_template_samples ?? [],
    senderDisplayName: normalized.sender_display_name ?? "",
    senderAddress: normalized.sender_address ?? "",
    senderPhone: normalized.sender_phone ?? "",
    targetLeads: normalized.target_leads,
    createdAt: normalized.created_at,
    updatedAt: normalized.updated_at,
    ...mapCampaignApiToStats(normalized)
  };
}

function resolveCampaignTone(value: string): CampaignTone {
  return (CAMPAIGN_TONES as readonly string[]).includes(value) ? (value as CampaignTone) : CAMPAIGN_TONES[0];
}

/** Build a create payload for duplicating a campaign (draft, validated shape). */
export function mapCampaignApiToDuplicateRequest(
  campaign: CampaignApiModel,
  options?: { name?: string }
): CreateCampaignFormValues {
  const detail = mapCampaignApiToDetail(campaign);
  const duplicatedName = options?.name ?? `${detail.name} Copy`;
  const name = sanitizeCampaignNameInput(duplicatedName) || "Campaign Copy";

  const mailTemplate =
    typeof detail.mailTrainingInstruction === "string" && detail.mailTrainingInstruction.trim()
      ? detail.mailTrainingInstruction.trim()
      : DEFAULT_MAIL_TRAINING_INSTRUCTION;

  const form: CampaignDetailFormState = {
    name,
    goal: detail.goal,
    targetZone: sanitizeCampaignTargetZoneInput(detail.targetZone),
    callToAction: sanitizeCampaignCallToActionInput(detail.callToAction),
    leadSource: detail.leadSource,
    runMode: detail.runMode,
    mailTemplate,
    exampleTraining: "",
    mailTemplateSamples: detail.mailTemplateSamples.map((sample) => ({ ...sample })),
    tone: resolveCampaignTone(detail.targetTone),
    targetLeads: detail.targetLeads,
    status: "draft",
    senderDisplayName: detail.senderDisplayName,
    senderAddress: detail.senderAddress,
    senderPhone: detail.senderPhone
  };
  return { ...campaignDetailFormToCreateValues(form), status: "draft", name: form.name };
}

export function mapCampaignApiToListCard(campaign: CampaignApiModel): CampaignListCardViewModel {
  return {
    id: campaign.id,
    name: campaign.name,
    goal: campaign.goal,
    status: mapApiStatusToListStatus(campaign.status),
    runMode: mapApiRunMode(campaign.run_mode),
    targetLeads: campaign.target_leads,
    ...mapCampaignApiToStats(campaign)
  };
}

export type CampaignDetailFormState = {
  name: string;
  goal: string;
  targetZone: string;
  callToAction: string;
  leadSource: CampaignLeadSource;
  runMode: CampaignDetailRunMode;
  mailTemplate: string;
  exampleTraining: string;
  mailTemplateSamples: MailTemplateSample[];
  tone: CampaignTone;
  targetLeads: number;
  status: CampaignDetailStatus;
  senderDisplayName: string;
  senderAddress: string;
  senderPhone: string;
};

export type CampaignDetailFormErrors = Partial<Record<keyof CampaignDetailFormState, string>>;

export const VALIDATED_CAMPAIGN_DETAIL_FIELDS: Array<keyof CampaignDetailFormState> = [
  "name",
  "goal",
  "targetZone",
  "callToAction",
  "leadSource",
  "runMode",
  "mailTemplate",
  "mailTemplateSamples",
  "tone",
  "targetLeads",
  "status",
  "senderDisplayName",
  "senderAddress",
  "senderPhone"
];

export function campaignDetailFormToCreateValues(
  form: CampaignDetailFormState
): CreateCampaignFormValues {
  return {
    name: form.name,
    goal: form.goal,
    target_zone: form.targetZone,
    call_to_action: form.callToAction,
    run_mode: form.runMode === "automatic" ? "auto" : "manual",
    target_tone: form.tone,
    mail_training_instruction: form.mailTemplate,
    mail_template_samples: form.mailTemplateSamples,
    lead_source: form.leadSource,
    sender_display_name: form.senderDisplayName,
    sender_address: form.senderAddress,
    sender_phone: form.senderPhone,
    target_leads: form.targetLeads,
    status: form.status === "active" ? "running" : form.status
  };
}

export function mapCreateCampaignZodErrors(
  error: ZodError<CreateCampaignFormValues>
): CampaignDetailFormErrors {
  const fieldErrors = error.flatten().fieldErrors;
  return {
    name: fieldErrors.name?.[0],
    goal: fieldErrors.goal?.[0],
    targetZone: fieldErrors.target_zone?.[0],
    callToAction: fieldErrors.call_to_action?.[0],
    runMode: fieldErrors.run_mode?.[0],
    tone: fieldErrors.target_tone?.[0],
    mailTemplate: fieldErrors.mail_training_instruction?.[0],
    mailTemplateSamples: fieldErrors.mail_template_samples?.[0],
    leadSource: fieldErrors.lead_source?.[0],
    senderDisplayName: fieldErrors.sender_display_name?.[0],
    senderAddress: fieldErrors.sender_address?.[0],
    senderPhone: fieldErrors.sender_phone?.[0],
    targetLeads: fieldErrors.target_leads?.[0],
    status: fieldErrors.status?.[0]
  };
}

export function validateCampaignDetailForm(
  form: CampaignDetailFormState,
  fields: Array<keyof CampaignDetailFormState> = VALIDATED_CAMPAIGN_DETAIL_FIELDS,
  options?: { maxLeadsPerCampaign?: number }
): { ok: boolean; fieldErrors: CampaignDetailFormErrors } {
  const schema =
    typeof options?.maxLeadsPerCampaign === "number"
      ? createCampaignSchemaForPlan(options.maxLeadsPerCampaign)
      : createCampaignSchema;
  const parsed = schema.safeParse(campaignDetailFormToCreateValues(form));
  const mapped = parsed.success ? {} : mapCreateCampaignZodErrors(parsed.error);
  const fieldErrors: CampaignDetailFormErrors = {};

  fields.forEach((field) => {
    fieldErrors[field] = parsed.success ? "" : mapped[field] || "";
  });

  return { ok: parsed.success, fieldErrors };
}

export function buildCampaignUpdatePayload(
  current: CampaignDetailFormState,
  initial: CampaignDetailFormState
): UpdateCampaignRequest {
  const payload: UpdateCampaignRequest = {};
  if (current.name !== initial.name) payload.name = current.name;
  if (current.goal !== initial.goal) payload.goal = current.goal;
  if (current.targetZone !== initial.targetZone) payload.target_zone = current.targetZone;
  if (current.callToAction !== initial.callToAction) payload.call_to_action = current.callToAction;
  if (current.leadSource !== initial.leadSource) payload.lead_source = current.leadSource;
  if (current.runMode !== initial.runMode) {
    payload.run_mode = current.runMode === "automatic" ? "auto" : "manual";
  }
  if (current.mailTemplate !== initial.mailTemplate) {
    payload.mail_training_instruction = current.mailTemplate;
  }
  if (JSON.stringify(current.mailTemplateSamples) !== JSON.stringify(initial.mailTemplateSamples)) {
    payload.mail_template_samples = current.mailTemplateSamples;
  }
  if (current.tone !== initial.tone) payload.target_tone = current.tone;
  if (current.targetLeads !== initial.targetLeads) payload.target_leads = current.targetLeads;
  if (current.status !== initial.status) payload.status = current.status;
  if (current.senderDisplayName !== initial.senderDisplayName) {
    payload.sender_display_name = current.senderDisplayName;
  }
  if (current.senderAddress !== initial.senderAddress) {
    payload.sender_address = current.senderAddress;
  }
  if (current.senderPhone !== initial.senderPhone) {
    payload.sender_phone = current.senderPhone;
  }
  return payload;
}
