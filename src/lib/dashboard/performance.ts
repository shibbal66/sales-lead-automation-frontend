import { format, parseISO } from "date-fns";
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

export const DASHBOARD_PERIOD_OPTIONS: DashboardPeriodOption[] = [
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "this_month", label: "This month" },
  { value: "last_90_days", label: "Last 90 days" },
  { value: "custom", label: "Custom range" }
];

export const DEFAULT_DASHBOARD_PERIOD: DashboardPeriod = "last_30_days";

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
  return DASHBOARD_PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? period;
}

export function buildDashboardPerformanceQuery(
  period: DashboardPeriod,
  customFrom?: string,
  customTo?: string
): DashboardPerformanceQuery {
  if (period === "custom") {
    return {
      period,
      from: customFrom?.trim(),
      to: customTo?.trim()
    };
  }
  return { period };
}

export function isCustomPerformanceRangeValid(from?: string, to?: string): boolean {
  const f = from?.trim();
  const t = to?.trim();
  if (!f || !t) return false;
  return f <= t;
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

export function formatPerformanceDateRange(from: string, to: string): string {
  try {
    const fromLabel = format(parseISO(from), "MMM d, yyyy");
    const toLabel = format(parseISO(to), "MMM d, yyyy");
    return `${fromLabel} – ${toLabel}`;
  } catch {
    return `${from} – ${to}`;
  }
}

const PERFORMANCE_SUBTITLE_SUFFIX = "emails sent, replies, and meetings booked";

export function getPerformanceSubtitle(
  performance: DashboardPerformanceData | null,
  period: DashboardPeriod,
  isLoading: boolean
): string {
  if (performance?.from && performance?.to) {
    return `${formatPerformanceDateRange(performance.from, performance.to)} · ${PERFORMANCE_SUBTITLE_SUFFIX}`;
  }
  if (isLoading) return "Loading…";
  return `${getDashboardPeriodLabel(period)} · ${PERFORMANCE_SUBTITLE_SUFFIX}`;
}
