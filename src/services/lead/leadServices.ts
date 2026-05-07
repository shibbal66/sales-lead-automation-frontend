import apiInvoker from "../../lib/apiInvoker";
import { END_POINT } from "../../lib/apiURL";
import type { GetLeadByIdResponse, GetLeadsResponse } from "../../types/lead";

export function getLeads(page = 1, limit = 20) {
  return apiInvoker<GetLeadsResponse>(END_POINT.lead.list, "GET", undefined, { page, limit });
}

export function getLeadById(leadId: number | string) {
  return apiInvoker<GetLeadByIdResponse>(`${END_POINT.lead.list}/${leadId}`, "GET");
}
