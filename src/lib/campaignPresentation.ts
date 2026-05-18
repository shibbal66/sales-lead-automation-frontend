import type {
  CampaignApiModel,
  CampaignLeadSource,
  CampaignStatus,
  MailTemplateSample,
  UpdateCampaignRequest
} from "@/types";

export const CAMPAIGN_DETAIL_STATUSES = ["draft", "active", "paused", "completed"] as const;
export const CAMPAIGN_TONES = ["Friendly", "Professional", "Direct", "Consultative"] as const;
export const CAMPAIGN_LEAD_SOURCES: CampaignLeadSource[] = ["new", "existing", "both"];

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
};

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
  return payload;
}
