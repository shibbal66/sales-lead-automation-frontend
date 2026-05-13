import apiInvoker from "../../lib/apiInvoker";
import { END_POINT } from "../../lib/apiURL";
import type { GetLeadByIdResponse, GetLeadsQuery, GetLeadsResponse } from "@/types";

export function getLeads({ page = 1, limit = 20, search, country, industry }: GetLeadsQuery = {}) {
  return apiInvoker<GetLeadsResponse>(END_POINT.lead.list, "GET", undefined, {
    page,
    limit,
    ...(search ? { search } : {}),
    ...(country ? { country } : {}),
    ...(industry ? { industry } : {})
  });
}

export function getLeadById(leadId: number | string) {
  return apiInvoker<GetLeadByIdResponse>(`${END_POINT.lead.list}/${leadId}`, "GET");
}
