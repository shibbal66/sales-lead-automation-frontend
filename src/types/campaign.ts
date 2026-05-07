export type CampaignRunMode = "auto" | "manual";
export type CampaignLeadSource = "new" | "existing" | "both";
export type CampaignStatus = "draft" | "running" | "active" | "paused" | "completed";

export interface CreateCampaignRequest {
  name: string;
  goal: string;
  target_zone: string;
  call_to_action: string;
  run_mode: CampaignRunMode;
  lead_source: CampaignLeadSource;
  mail_template: string;
  example_training: string;
  target_leads: number;
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
  mail_template: string;
  example_training: string;
  target_leads: number;
  status: CampaignStatus;
  created_at: string;
  updated_at: string;
}

export interface CreateCampaignResponse {
  success: boolean;
  message: string;
  data?: {
    campaign: CampaignApiModel;
  };
}

export type UpdateCampaignRequest = Partial<CreateCampaignRequest>;

export interface UpdateCampaignResponse {
  success: boolean;
  message: string;
  data?: {
    campaign: CampaignApiModel;
  };
}

export interface DeleteCampaignResponse {
  success: boolean;
  message: string;
}

export interface GetCampaignsResponse {
  success: boolean;
  data?: {
    campaigns: CampaignApiModel[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface GetCampaignByIdResponse {
  success: boolean;
  data?: {
    campaign: CampaignApiModel;
  };
}
