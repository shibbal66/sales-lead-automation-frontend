import { createCampaignSchema, type CreateCampaignFormValues } from "@/validators/campaign";
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

export type CampaignDetailStatus = (typeof CAMPAIGN_DETAIL_STATUSES)[number];
export type CampaignDetailRunMode = "automatic" | "manual";
export type CampaignTone = (typeof CAMPAIGN_TONES)[number];

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
};

export type CampaignListCardViewModel = {
  id: string;
  name: string;
  goal: string;
  status: CampaignStatus;
  runMode: CampaignDetailRunMode;
  targetLeads: number;
  emailsSent: number;
  replyRate: number;
};

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

export function mapCampaignApiToDetail(campaign: CampaignApiModel): CampaignDetailViewModel {
  const mailTrainingInstruction = campaign.mail_training_instruction ?? "";

  return {
    id: campaign.id,
    name: campaign.name,
    goal: campaign.goal,
    status: mapApiStatusToDetailStatus(campaign.status),
    runMode: mapApiRunMode(campaign.run_mode),
    targetZone: campaign.target_zone,
    callToAction: campaign.call_to_action,
    leadSource: campaign.lead_source,
    targetTone: campaign.target_tone ?? CAMPAIGN_TONES[0],
    mailTrainingInstruction: mailTrainingInstruction,
    mailTemplateSamples: campaign.mail_template_samples ?? [],
    senderDisplayName: campaign.sender_display_name ?? "",
    senderAddress: campaign.sender_address ?? "",
    senderPhone: campaign.sender_phone ?? "",
    targetLeads: campaign.target_leads,
    createdAt: campaign.created_at,
    updatedAt: campaign.updated_at
  };
}

export function mapCampaignApiToListCard(campaign: CampaignApiModel): CampaignListCardViewModel {
  return {
    id: campaign.id,
    name: campaign.name,
    goal: campaign.goal,
    status: mapApiStatusToListStatus(campaign.status),
    runMode: mapApiRunMode(campaign.run_mode),
    targetLeads: campaign.target_leads,
    emailsSent: 0,
    replyRate: 0
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
  fields: Array<keyof CampaignDetailFormState> = VALIDATED_CAMPAIGN_DETAIL_FIELDS
): { ok: boolean; fieldErrors: CampaignDetailFormErrors } {
  const parsed = createCampaignSchema.safeParse(campaignDetailFormToCreateValues(form));
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
