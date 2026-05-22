export interface AnalyticsSentVsRepliesPoint {
  label: string;
  from: string;
  to: string;
  sent: number;
  replies: number;
}

export interface AnalyticsSentVsRepliesTotals {
  sent: number;
  replies: number;
}

export interface AnalyticsSentVsRepliesData {
  weeks: number;
  series: AnalyticsSentVsRepliesPoint[];
  totals: AnalyticsSentVsRepliesTotals;
}

export interface GetAnalyticsSentVsRepliesResponse {
  success: boolean;
  message?: string;
  data?: AnalyticsSentVsRepliesData;
}

export type AnalyticsSentVsRepliesQuery = {
  weeks?: number;
};

import type { PeriodQuery } from "@/lib/periodQuery";

export type AnalyticsPeriod = PeriodQuery;
export { PERIOD_QUERY_VALUES as ANALYTICS_PERIOD_VALUES } from "@/lib/periodQuery";

export interface AnalyticsReplyBreakdownSegment {
  key: string;
  label: string;
  count: number;
  color: string;
  percent: number;
}

export interface AnalyticsReplyBreakdownData {
  period: AnalyticsPeriod;
  from: string;
  to: string;
  total: number;
  segments: AnalyticsReplyBreakdownSegment[];
}

export interface GetAnalyticsReplyBreakdownResponse {
  success: boolean;
  message?: string;
  data?: AnalyticsReplyBreakdownData;
}

export type AnalyticsReplyBreakdownQuery = {
  period: AnalyticsPeriod;
  from?: string;
  to?: string;
};

export interface AnalyticsCampaignComparisonRow {
  campaign_id: string;
  campaign_name: string;
  leads: number;
  emails_sent: number;
  open_rate_percent: number | null;
  reply_rate_percent: number;
  reply_sparkline: number[];
  meetings: number;
  status: string;
  status_label: string;
}

export type { Pagination as AnalyticsPagination } from "@/types/pagination";
import type { Pagination } from "@/types/pagination";

export interface AnalyticsCampaignComparisonData {
  campaigns: AnalyticsCampaignComparisonRow[];
  pagination: Pagination;
}

export interface GetAnalyticsCampaignComparisonResponse {
  success: boolean;
  message?: string;
  data?: AnalyticsCampaignComparisonData;
}

export type AnalyticsCampaignComparisonQuery = {
  page?: number;
  limit?: number;
};

export interface AnalyticsCampaignChartSeriesPoint {
  date: string;
  replies: number;
}

export interface AnalyticsCampaignChartCampaign {
  campaign_id: string;
  campaign_name: string;
  total_replies: number;
  series: AnalyticsCampaignChartSeriesPoint[];
}

export interface AnalyticsCampaignChartData {
  period: AnalyticsPeriod;
  from: string;
  to: string;
  date_keys: string[];
  campaigns: AnalyticsCampaignChartCampaign[];
}

export interface GetAnalyticsCampaignChartResponse {
  success: boolean;
  message?: string;
  data?: AnalyticsCampaignChartData;
}

export type AnalyticsCampaignChartQuery = {
  period: AnalyticsPeriod;
  from?: string;
  to?: string;
};

export interface AnalyticsOverviewEmailsSent {
  count: number;
  vs_previous_period_percent: number;
}

export interface AnalyticsOverviewOpenRate {
  percent: number | null;
  vs_previous_period_points: number | null;
  tracked: boolean;
}

export interface AnalyticsOverviewReplyRate {
  percent: number;
  vs_previous_period_points: number | null;
}

export interface AnalyticsOverviewMeetingsBooked {
  count: number;
  vs_previous_period: number;
}

export interface AnalyticsOverviewPreviousPeriod {
  from: string;
  to: string;
}

export interface AnalyticsOverviewMeta {
  open_rate_note?: string;
  previous_period?: AnalyticsOverviewPreviousPeriod;
}

export interface AnalyticsOverviewData {
  period: AnalyticsPeriod;
  from: string;
  to: string;
  emails_sent: AnalyticsOverviewEmailsSent;
  open_rate: AnalyticsOverviewOpenRate;
  reply_rate: AnalyticsOverviewReplyRate;
  meetings_booked: AnalyticsOverviewMeetingsBooked;
  meta: AnalyticsOverviewMeta;
}

export interface GetAnalyticsOverviewResponse {
  success: boolean;
  message?: string;
  data?: AnalyticsOverviewData;
}

export type AnalyticsOverviewQuery = {
  period: AnalyticsPeriod;
  from?: string;
  to?: string;
};
