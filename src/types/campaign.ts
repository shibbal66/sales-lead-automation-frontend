export type CampaignRunMode = "auto" | "manual";

export const CAMPAIGN_LEAD_SOURCE_VALUES = ["new", "old", "both"] as const;
export type CampaignLeadSource = (typeof CAMPAIGN_LEAD_SOURCE_VALUES)[number];
export type CampaignStatus = "draft" | "running" | "active" | "paused" | "completed";

/** Pagination returned with list endpoints (e.g. GET `/campaigns`). */
export interface ApiPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MailTemplateSample {
  subject: string;
  body: string;
  html: string;
  text: string;
}

export interface CreateCampaignRequest {
  name: string;
  goal: string;
  target_zone: string;
  call_to_action: string;
  run_mode: CampaignRunMode;
  target_tone: string;
  mail_training_instruction: string;
  mail_template_samples: MailTemplateSample[];
  target_leads: number;
  lead_source: CampaignLeadSource;
  sender_display_name: string;
  sender_address: string;
  sender_phone: string;
  status: CampaignStatus;
}

export interface CampaignApiModel {
  id: string;
  user_id: string;
  name: string;
  goal: string;
  target_zone: string;
  call_to_action: string;
  run_mode: CampaignRunMode;
  lead_source: CampaignLeadSource;
  target_tone: string;
  mail_training_instruction: string | null;
  mail_template_samples: MailTemplateSample[] | null;
  sender_display_name: string | null;
  sender_address: string | null;
  sender_phone: string | null;
  target_leads: number;
  status: CampaignStatus;
  /** Present on list responses (GET `/campaigns`). */
  total_leads?: number;
  pending_count?: number;
  failed_count?: number;
  sent_count?: number;
  reply_rate?: number;
  reply_rate_percent?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCampaignResponse {
  success: boolean;
  message: string;
  code?: string;
  data?: {
    campaign: CampaignApiModel;
  };
}

export type UpdateCampaignRequest = Partial<CreateCampaignRequest>;

export interface UpdateCampaignResponse {
  success: boolean;
  message?: string;
  code?: string;
  data?: {
    campaign: CampaignApiModel;
  };
}

export interface DeleteCampaignResponse {
  success: boolean;
  message?: string;
  code?: string;
}

/** GET `/campaigns`: success `{ data: CampaignApiModel[], pagination }`; errors `{ message, code? }`. */
export interface GetCampaignsResponse {
  success: boolean;
  message?: string;
  code?: string;
  data?: CampaignApiModel[];
  pagination?: ApiPagination;
}

export interface GetCampaignByIdResponse {
  success: boolean;
  message?: string;
  code?: string;
  /** Either a single campaign object or `{ campaign }` (both accepted). */
  data?: CampaignApiModel | { campaign: CampaignApiModel };
}

export interface CampaignLeadApiModel {
  id: string;
  user_id: string;
  campaign_id: string;
  lead_data_id: string;
  mail_template: string | null;
  status: string;
  sent_at: string | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
  lead_name?: string | null;
  lead_email?: string | null;
  lead_company?: string | null;
}

export interface GetCampaignLeadsQuery {
  page?: number;
  limit?: number;
  status?: CampaignLeadStatus;
}

export interface GetCampaignLeadsResponse {
  success: boolean;
  message?: string;
  code?: string;
  /** Success: either a flat list or legacy `{ leads, page, limit, total }`. */
  data?: CampaignLeadApiModel[] | {
    leads: CampaignLeadApiModel[];
    page?: number;
    limit?: number;
    total?: number;
  };
  pagination?: ApiPagination;
}

export interface AddCampaignLeadRequest {
  lead_data_id: string;
  mail_template: string;
}

export interface AddCampaignLeadResponse {
  success: boolean;
  message?: string;
  code?: string;
  data?: {
    lead: CampaignLeadApiModel;
  };
}

export interface BulkAddCampaignLeadItem {
  lead_data_id: string;
}

export interface BulkAddCampaignLeadsRequest {
  leads: BulkAddCampaignLeadItem[];
}

export interface BulkAddCampaignLeadsResponse {
  success: boolean;
  message?: string;
  code?: string;
  data?: unknown;
}

/** Allowed campaign-assignment lead statuses (API + edit dialog). */
export const CAMPAIGN_LEAD_STATUSES = [
  "pending",
  "template_generated",
  "sent",
  "failed",
] as const;
export type CampaignLeadStatus = (typeof CAMPAIGN_LEAD_STATUSES)[number];

/** User-facing labels for campaign lead statuses. */
export const CAMPAIGN_LEAD_STATUS_LABELS: Record<CampaignLeadStatus, string> = {
  pending: "Pending",
  template_generated: "Email drafted",
  sent: "Sent",
  failed: "Failed",
};

export const CAMPAIGN_LEAD_STATUS_OPTIONS: { value: CampaignLeadStatus; label: string }[] =
  CAMPAIGN_LEAD_STATUSES.map((value) => ({
    value,
    label: CAMPAIGN_LEAD_STATUS_LABELS[value],
  }));

export function getCampaignLeadStatusLabel(status: CampaignLeadStatus | string): string {
  if ((CAMPAIGN_LEAD_STATUSES as readonly string[]).includes(status)) {
    return CAMPAIGN_LEAD_STATUS_LABELS[status as CampaignLeadStatus];
  }
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export type CampaignLeadsStatusFilter = "all" | CampaignLeadStatus;

export interface UpdateCampaignLeadRequest {
  status: CampaignLeadStatus;
  sent_at: string | null;
  mail_template: string;
}

export interface UpdateCampaignLeadResponse {
  success: boolean;
  message?: string;
  code?: string;
  data?: {
    lead: CampaignLeadApiModel;
  };
}

export interface DeleteCampaignLeadResponse {
  success: boolean;
  message?: string;
  code?: string;
}

export interface CampaignFollowUpApiModel {
  id: string;
  campaign_id: string;
  name: string;
  waiting_days: number;
  body_template: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCampaignFollowUpRequest {
  name: string;
  waiting_days: number;
  body_template: string;
}

export type UpdateCampaignFollowUpRequest = CreateCampaignFollowUpRequest;

export interface GetCampaignFollowUpsResponse {
  success: boolean;
  message?: string;
  code?: string;
  data?: {
    followUps: CampaignFollowUpApiModel[];
  };
}

export interface CreateCampaignFollowUpResponse {
  success: boolean;
  message?: string;
  code?: string;
  data?: {
    followUp: CampaignFollowUpApiModel;
  };
}

export interface UpdateCampaignFollowUpResponse {
  success: boolean;
  message?: string;
  code?: string;
  data?: {
    followUp: CampaignFollowUpApiModel;
  };
}

export interface DeleteCampaignFollowUpResponse {
  success: boolean;
  message?: string;
  code?: string;
  data?: string;
}

/** POST `/campaigns/:id/leads/run` — process pending leads (manual run mode). */
export interface RunCampaignLeadsResponse {
  success: boolean;
  message?: string;
  code?: string;
  data?: unknown;
}

export interface SendCampaignLeadEmailsRequest {
  campaign_lead_id: string;
}

export interface SendCampaignLeadEmailResult {
  campaignLeadId: string;
  status: string;
  to: string;
  subject: string;
  messageId?: string;
}

export interface SendCampaignLeadEmailsData {
  sent: number;
  failed: number;
  skipped: number;
  tokensRefreshed?: number;
  total: number;
  dailyLimitReached: boolean;
  alreadySentToday: number;
  totalSentToday: number;
  dailyLimit: number;
  results: SendCampaignLeadEmailResult[];
}

/** POST `/campaigns/:id/leads/send-emails` — send email for one campaign lead. */
export interface SendCampaignLeadEmailsResponse {
  success: boolean;
  message?: string;
  code?: string;
  data?: SendCampaignLeadEmailsData;
}

