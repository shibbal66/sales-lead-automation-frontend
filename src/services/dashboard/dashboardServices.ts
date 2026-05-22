import apiInvoker from "@/lib/apiInvoker";
import { END_POINT } from "@/lib/apiURL";
import type {
  DashboardActiveCampaignsQuery,
  DashboardPerformanceQuery,
  DashboardRecentActivityQuery,
  GetDashboardActiveCampaignsResponse,
  GetDashboardPerformanceResponse,
  GetDashboardRecentActivityResponse,
  GetDashboardSummaryResponse
} from "@/types/dashboard";
import type { GetMeetingStatsResponse } from "@/types/meetingStats";
import { DEFAULT_ACTIVE_CAMPAIGNS_LIMIT, DEFAULT_RECENT_ACTIVITY_LIMIT } from "@/lib/dashboard";

export function getDashboardSummary() {
  return apiInvoker<GetDashboardSummaryResponse>(END_POINT.dashboard.summary, "GET");
}

export function getDashboardPerformance({ period, from, to }: DashboardPerformanceQuery) {
  const params: Record<string, string> = { period };
  if (period === "custom") {
    if (from) params.from = from;
    if (to) params.to = to;
  }
  return apiInvoker<GetDashboardPerformanceResponse>(
    END_POINT.dashboard.performance,
    "GET",
    undefined,
    params
  );
}

export function getDashboardActiveCampaigns({
  page = 1,
  limit = DEFAULT_ACTIVE_CAMPAIGNS_LIMIT
}: DashboardActiveCampaignsQuery = {}) {
  return apiInvoker<GetDashboardActiveCampaignsResponse>(
    END_POINT.dashboard.activeCampaigns,
    "GET",
    undefined,
    { page, limit }
  );
}

export function getDashboardRecentActivity({
  page = 1,
  limit = DEFAULT_RECENT_ACTIVITY_LIMIT
}: DashboardRecentActivityQuery = {}) {
  return apiInvoker<GetDashboardRecentActivityResponse>(
    END_POINT.dashboard.recentActivity,
    "GET",
    undefined,
    { page, limit }
  );
}

export function getMeetingStats() {
  return apiInvoker<GetMeetingStatsResponse>(END_POINT.dashboard.meetingStats, "GET");
}
