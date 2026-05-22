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

export {
  DASHBOARD_PERIOD_QUERY_VALUES as DASHBOARD_PERIOD_VALUES,
  type DashboardPeriodQuery as DashboardPeriod
} from "@/lib/periodQuery";

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

export type { Pagination as DashboardPagination } from "@/types/pagination";
import type { Pagination } from "@/types/pagination";

export interface DashboardActiveCampaignsData {
  total_running: number;
  campaigns: DashboardActiveCampaign[];
  pagination: Pagination;
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
  pagination?: Pagination;
}

export type DashboardRecentActivityQuery = {
  page?: number;
  limit?: number;
};
