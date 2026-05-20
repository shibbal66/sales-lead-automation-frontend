export interface DashboardSummaryData {
  total_campaigns: number;
  total_emails_sent: number;
  reply_rate: number;
  reply_rate_percent: number;
  meeting_booking_count: number;
}

export interface GetDashboardSummaryResponse {
  success: boolean;
  message?: string;
  data?: DashboardSummaryData;
}

export const DASHBOARD_PERIOD_VALUES = [
  "last_7_days",
  "last_30_days",
  "this_month",
  "last_90_days",
  "custom"
] as const;

export type DashboardPeriod = (typeof DASHBOARD_PERIOD_VALUES)[number];

export interface DashboardPerformanceSeriesPoint {
  date: string;
  sent: number;
  replies: number;
  bookings: number;
}

export interface DashboardPerformanceTotals {
  sent: number;
  replies: number;
  bookings: number;
}

export interface DashboardPerformanceData {
  period: DashboardPeriod;
  from: string;
  to: string;
  series?: DashboardPerformanceSeriesPoint[];
  totals: DashboardPerformanceTotals;
}

export interface GetDashboardPerformanceResponse {
  success: boolean;
  message?: string;
  data?: DashboardPerformanceData;
}

export type DashboardPerformanceQuery = {
  period: DashboardPeriod;
  from?: string;
  to?: string;
};

export interface DashboardActiveCampaign {
  id: string;
  name: string;
  status: string;
  total_leads: number;
  sent_count: number;
  reply_count: number;
  progress: number;
}

export interface DashboardPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DashboardActiveCampaignsData {
  total_running: number;
  campaigns: DashboardActiveCampaign[];
  pagination: DashboardPagination;
}

export interface GetDashboardActiveCampaignsResponse {
  success: boolean;
  message?: string;
  data?: DashboardActiveCampaignsData;
}

export type DashboardActiveCampaignsQuery = {
  page?: number;
  limit?: number;
};

export interface DashboardRecentActivityItem {
  id: string;
  type: string;
  campaign_id: string;
  campaign_lead_id: string;
  lead_data_id: string;
  occurred_at: string;
  title: string;
  campaign_name: string;
}

export interface GetDashboardRecentActivityResponse {
  success: boolean;
  message?: string;
  data?: DashboardRecentActivityItem[];
  pagination?: DashboardPagination;
}

export type DashboardRecentActivityQuery = {
  page?: number;
  limit?: number;
};
