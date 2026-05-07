import apiInvoker from "../../lib/apiInvoker";
import { END_POINT } from "../../lib/apiURL";
import type {
  CampaignStatus,
  CreateCampaignRequest,
  CreateCampaignResponse,
  GetCampaignByIdResponse,
  GetCampaignsResponse,
  UpdateCampaignRequest,
  UpdateCampaignResponse
} from "../../types/campaign";

type DeleteCampaignResponse = {
  success: boolean;
  message: string;
};

export function createCampaign(payload: CreateCampaignRequest) {
  return apiInvoker<CreateCampaignResponse>(END_POINT.campaign.create, "POST", payload);
}

export function getCampaigns(page = 1, limit = 20, status?: CampaignStatus) {
  return apiInvoker<GetCampaignsResponse>(END_POINT.campaign.create, "GET", undefined, {
    page,
    limit,
    ...(status ? { status } : {})
  });
}

export function getCampaignById(campaignId: string) {
  return apiInvoker<GetCampaignByIdResponse>(`${END_POINT.campaign.create}/${campaignId}`, "GET");
}

export function updateCampaign(campaignId: string, payload: UpdateCampaignRequest) {
  return apiInvoker<UpdateCampaignResponse>(`${END_POINT.campaign.create}/${campaignId}`, "PATCH", payload);
}

export function deleteCampaign(campaignId: string) {
  return apiInvoker<DeleteCampaignResponse>(`${END_POINT.campaign.create}/${campaignId}`, "DELETE");
}
