import { format, parseISO } from "date-fns";
import {
  buildPeriodQuery,
  DEFAULT_DASHBOARD_PERIOD_QUERY,
  DASHBOARD_PERIOD_QUERY_OPTIONS,
  getPeriodQueryLabel,
  isCustomPeriodRangeValid
} from "@/lib/periodQuery";
import type {
  DashboardPerformanceData,
  DashboardPerformanceQuery,
  DashboardPerformanceSeriesPoint,
  DashboardPeriod
} from "@/types/dashboard";

export type DashboardPeriodOption = {
  value: DashboardPeriod;
  label: string;
};

export const DASHBOARD_PERIOD_OPTIONS = DASHBOARD_PERIOD_QUERY_OPTIONS as DashboardPeriodOption[];

export const DEFAULT_DASHBOARD_PERIOD: DashboardPeriod = DEFAULT_DASHBOARD_PERIOD_QUERY;

export const DASHBOARD_PERFORMANCE_CHART_TITLE = "Emails & meetings";

/** Legend labels for chart series (API: sent, replies, bookings). */
export const DASHBOARD_PERFORMANCE_SERIES_LABELS = {
  sent: "Emails sent",
  replies: "Email replies",
  bookings: "Meetings booked"
} as const;

export const DASHBOARD_PERFORMANCE_EMPTY_MESSAGE =
  "No email or meeting activity for this period.";

export function getDashboardPeriodLabel(period: DashboardPeriod): string {
  return getPeriodQueryLabel(period);
}

export function buildDashboardPerformanceQuery(
  period: DashboardPeriod,
  customFrom?: string,
  customTo?: string
): DashboardPerformanceQuery {
  return buildPeriodQuery(period, customFrom, customTo) as DashboardPerformanceQuery;
}

export function isCustomPerformanceRangeValid(from?: string, to?: string): boolean {
  return isCustomPeriodRangeValid(from, to);
}

export type DashboardChartPoint = DashboardPerformanceSeriesPoint & {
  label: string;
};

export function isDashboardPerformanceData(
  data: unknown
): data is DashboardPerformanceData {
  return (
    !!data &&
    typeof data === "object" &&
    Array.isArray((data as DashboardPerformanceData).series)
  );
}

/** Coerce API payload; returns null when `series` is missing (e.g. KPI-only summary). */
export function parseDashboardPerformanceData(data: unknown): DashboardPerformanceData | null {
  if (!isDashboardPerformanceData(data)) return null;
  const raw = data as DashboardPerformanceData;
  return {
    period: raw.period,
    from: raw.from ?? "",
    to: raw.to ?? "",
    series: raw.series,
    totals: raw.totals ?? { sent: 0, replies: 0, bookings: 0 }
  };
}

export function performanceSeriesToChartData(
  series: DashboardPerformanceSeriesPoint[] | null | undefined
): DashboardChartPoint[] {
  return (series ?? []).map((point) => {
    let label = point.date;
    try {
      label = format(parseISO(point.date), "MMM d");
    } catch {
      /* keep raw date */
    }
    return { ...point, label };
  });
}

const PERFORMANCE_SUBTITLE = "Emails sent, replies, and meetings booked";

export function getPerformanceSubtitle(
  _performance: DashboardPerformanceData | null,
  _period: DashboardPeriod,
  isLoading: boolean
): string {
  if (isLoading) return "Loading…";
  return PERFORMANCE_SUBTITLE;
}
