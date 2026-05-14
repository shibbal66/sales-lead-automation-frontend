import apiInvoker from "../../lib/apiInvoker";
import { END_POINT } from "../../lib/apiURL";
import type {
  AddCampaignLeadRequest,
  AddCampaignLeadResponse,
  AssignRandomCampaignLeadsResponse,
  CampaignStatus,
  CreateCampaignRequest,
  CreateCampaignResponse,
  DeleteCampaignLeadResponse,
  DeleteCampaignResponse,
  GetCampaignByIdResponse,
  GetCampaignLeadsQuery,
  GetCampaignLeadsResponse,
  GetCampaignsResponse,
  UpdateCampaignLeadRequest,
  UpdateCampaignLeadResponse,
  UpdateCampaignRequest,
  UpdateCampaignResponse
} from "@/types";

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

export function getCampaignLeads(campaignId: string, { page = 1, limit = 20 }: GetCampaignLeadsQuery = {}) {
  return apiInvoker<GetCampaignLeadsResponse>(
    `${END_POINT.campaign.create}/${campaignId}/leads`,
    "GET",
    undefined,
    { page, limit }
  );
}

export function addCampaignLead(campaignId: string, payload: AddCampaignLeadRequest) {
  return apiInvoker<AddCampaignLeadResponse>(
    `${END_POINT.campaign.create}/${campaignId}/leads`,
    "POST",
    payload
  );
}

export function updateCampaignLead(
  campaignId: string,
  campaignLeadId: string,
  payload: UpdateCampaignLeadRequest
) {
  return apiInvoker<UpdateCampaignLeadResponse>(
    `${END_POINT.campaign.create}/${campaignId}/leads/${campaignLeadId}`,
    "PATCH",
    payload
  );
}

export function deleteCampaignLead(campaignId: string, campaignLeadId: string) {
  return apiInvoker<DeleteCampaignLeadResponse>(
    `${END_POINT.campaign.create}/${campaignId}/leads/${campaignLeadId}`,
    "DELETE"
  );
}

export function assignRandomCampaignLeads(campaignId: string) {
  return apiInvoker<AssignRandomCampaignLeadsResponse>(
    `${END_POINT.campaign.create}/${campaignId}/leads/assign-random`,
    "POST"
  );
}

export function updateCampaign(campaignId: string, payload: UpdateCampaignRequest) {
  return apiInvoker<UpdateCampaignResponse>(`${END_POINT.campaign.create}/${campaignId}`, "PATCH", payload);
}

export function deleteCampaign(campaignId: string) {
  return apiInvoker<DeleteCampaignResponse>(`${END_POINT.campaign.create}/${campaignId}`, "DELETE");
}
