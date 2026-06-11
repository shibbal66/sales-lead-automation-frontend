import apiInvoker from "../../lib/apiInvoker";
import { END_POINT } from "../../lib/apiURL";
import type {
  AddCampaignLeadRequest,
  AddCampaignLeadResponse,
  BulkAddCampaignLeadsRequest,
  BulkAddCampaignLeadsResponse,
  CampaignStatus,
  CreateCampaignFollowUpRequest,
  CreateCampaignFollowUpResponse,
  CreateCampaignRequest,
  CreateCampaignResponse,
  DeleteCampaignFollowUpResponse,
  DeleteCampaignLeadResponse,
  DeleteCampaignResponse,
  GetCampaignByIdResponse,
  GetCampaignFollowUpsResponse,
  GetCampaignLeadsQuery,
  GetCampaignLeadsResponse,
  GetCampaignsResponse,
  UpdateCampaignFollowUpRequest,
  UpdateCampaignFollowUpResponse,
  UpdateCampaignLeadRequest,
  UpdateCampaignLeadResponse,
  UpdateCampaignRequest,
  UpdateCampaignResponse,
  RunCampaignLeadsResponse,
  SendCampaignLeadEmailsRequest,
  SendCampaignLeadEmailsResponse
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

export function getCampaignLeads(
  campaignId: string,
  { page = 1, limit = 20, status }: GetCampaignLeadsQuery = {},
) {
  return apiInvoker<GetCampaignLeadsResponse>(
    `${END_POINT.campaign.create}/${campaignId}/leads`,
    "GET",
    undefined,
    {
      page,
      limit,
      ...(status ? { status } : {}),
    },
  );
}

export function addCampaignLead(campaignId: string, payload: AddCampaignLeadRequest) {
  return apiInvoker<AddCampaignLeadResponse>(
    `${END_POINT.campaign.create}/${campaignId}/leads`,
    "POST",
    payload
  );
}

export function bulkAddCampaignLeads(campaignId: string, payload: BulkAddCampaignLeadsRequest) {
  return apiInvoker<BulkAddCampaignLeadsResponse>(
    `${END_POINT.campaign.create}/${campaignId}/leads/bulk`,
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

export function updateCampaign(campaignId: string, payload: UpdateCampaignRequest) {
  return apiInvoker<UpdateCampaignResponse>(`${END_POINT.campaign.create}/${campaignId}`, "PATCH", payload);
}

export function deleteCampaign(campaignId: string) {
  return apiInvoker<DeleteCampaignResponse>(`${END_POINT.campaign.create}/${campaignId}`, "DELETE");
}

export function getCampaignFollowUps(campaignId: string) {
  return apiInvoker<GetCampaignFollowUpsResponse>(
    `${END_POINT.campaign.create}/${campaignId}/follow-ups`,
    "GET"
  );
}

export function createCampaignFollowUp(campaignId: string, payload: CreateCampaignFollowUpRequest) {
  return apiInvoker<CreateCampaignFollowUpResponse>(
    `${END_POINT.campaign.create}/${campaignId}/follow-ups`,
    "POST",
    payload
  );
}

export function updateCampaignFollowUp(
  campaignId: string,
  followUpId: string,
  payload: UpdateCampaignFollowUpRequest
) {
  return apiInvoker<UpdateCampaignFollowUpResponse>(
    `${END_POINT.campaign.create}/${campaignId}/follow-ups/${followUpId}`,
    "PATCH",
    payload
  );
}

export function deleteCampaignFollowUp(campaignId: string, followUpId: string) {
  return apiInvoker<DeleteCampaignFollowUpResponse>(
    `${END_POINT.campaign.create}/${campaignId}/follow-ups/${followUpId}`,
    "DELETE"
  );
}

export function runCampaignLeads(campaignId: string) {
  return apiInvoker<RunCampaignLeadsResponse>(
    `${END_POINT.campaign.create}/${campaignId}/leads/run`,
    "POST"
  );
}

export function sendCampaignLeadEmails(
  campaignId: string,
  payload: SendCampaignLeadEmailsRequest
) {
  return apiInvoker<SendCampaignLeadEmailsResponse>(
    `${END_POINT.campaign.create}/${campaignId}/leads/send-emails`,
    "POST",
    payload
  );
}
