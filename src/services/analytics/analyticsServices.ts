import apiInvoker from "@/lib/apiInvoker";
import { END_POINT } from "@/lib/apiURL";
import { DEFAULT_CAMPAIGN_COMPARISON_LIMIT, DEFAULT_SENT_VS_REPLIES_WEEKS } from "@/lib/analytics";
import { buildPeriodQueryParams } from "@/lib/periodQuery";
import type {
  AnalyticsCampaignChartQuery,
  AnalyticsCampaignComparisonQuery,
  AnalyticsOverviewQuery,
  AnalyticsReplyBreakdownQuery,
  AnalyticsSentVsRepliesQuery,
  GetAnalyticsCampaignChartResponse,
  GetAnalyticsCampaignComparisonResponse,
  GetAnalyticsOverviewResponse,
  GetAnalyticsReplyBreakdownResponse,
  GetAnalyticsSentVsRepliesResponse
} from "@/types/analytics";

export function getAnalyticsOverview({ period, from, to }: AnalyticsOverviewQuery) {
  return apiInvoker<GetAnalyticsOverviewResponse>(
    END_POINT.analytics.overview,
    "GET",
    undefined,
    buildPeriodQueryParams(period, from, to)
  );
}

export function getAnalyticsSentVsReplies({
  weeks = DEFAULT_SENT_VS_REPLIES_WEEKS
}: AnalyticsSentVsRepliesQuery = {}) {
  return apiInvoker<GetAnalyticsSentVsRepliesResponse>(
    END_POINT.analytics.sentVsReplies,
    "GET",
    undefined,
    { weeks }
  );
}

export function getAnalyticsReplyBreakdown({ period, from, to }: AnalyticsReplyBreakdownQuery) {
  return apiInvoker<GetAnalyticsReplyBreakdownResponse>(
    END_POINT.analytics.replyBreakdown,
    "GET",
    undefined,
    buildPeriodQueryParams(period, from, to)
  );
}

export function getAnalyticsCampaignComparison({
  page = 1,
  limit = DEFAULT_CAMPAIGN_COMPARISON_LIMIT
}: AnalyticsCampaignComparisonQuery = {}) {
  return apiInvoker<GetAnalyticsCampaignComparisonResponse>(
    END_POINT.analytics.campaignComparison,
    "GET",
    undefined,
    { page, limit }
  );
}

export function getAnalyticsCampaignChart({ period, from, to }: AnalyticsCampaignChartQuery) {
  return apiInvoker<GetAnalyticsCampaignChartResponse>(
    END_POINT.analytics.campaignChart,
    "GET",
    undefined,
    buildPeriodQueryParams(period, from, to)
  );
}
