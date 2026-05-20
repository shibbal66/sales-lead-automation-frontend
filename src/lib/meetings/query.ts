import type { MeetingsListQuery } from "@/types/meeting";

export const DEFAULT_MEETINGS_LIMIT = 20;

export function buildMeetingsQueryParams(query: MeetingsListQuery = {}): Record<string, string | number> {
  const params: Record<string, string | number> = {
    page: query.page ?? 1,
    limit: query.limit ?? DEFAULT_MEETINGS_LIMIT
  };
  if (query.status) params.status = query.status;
  if (query.campaign_id) params.campaign_id = query.campaign_id;
  if (query.from) params.from = query.from;
  if (query.to) params.to = query.to;
  return params;
}
