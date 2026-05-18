import apiInvoker from "../../lib/apiInvoker";
import { END_POINT } from "../../lib/apiURL";
import type { GetLeadByIdResponse, GetLeadsQuery, GetLeadsResponse } from "@/types";

function queryParam(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

export function getLeads({
  page = 1,
  limit = 20,
  search,
  emailStatus,
  country,
  state,
  city,
  industry
}: GetLeadsQuery = {}) {
  return apiInvoker<GetLeadsResponse>(END_POINT.lead.list, "GET", undefined, {
    page,
    limit,
    ...(queryParam(search) ? { search: queryParam(search) } : {}),
    ...(queryParam(emailStatus) ? { emailStatus: queryParam(emailStatus) } : {}),
    ...(queryParam(country) ? { country: queryParam(country) } : {}),
    ...(queryParam(state) ? { state: queryParam(state) } : {}),
    ...(queryParam(city) ? { city: queryParam(city) } : {}),
    ...(queryParam(industry) ? { industry: queryParam(industry) } : {})
  });
}

export function getLeadById(leadId: number | string) {
  return apiInvoker<GetLeadByIdResponse>(`${END_POINT.lead.list}/${leadId}`, "GET");
}
