import { format, parseISO } from "date-fns";

/** Shared API period query values (analytics + similar endpoints). */
export const PERIOD_QUERY_VALUES = [
  "last_7_days",
  "last_30_days",
  "last_month",
  "last_90_days",
  "this_month",
  "custom"
] as const;

export type PeriodQuery = (typeof PERIOD_QUERY_VALUES)[number];

/** Dashboard performance API supports a subset (no `last_month`). */
export const DASHBOARD_PERIOD_QUERY_VALUES = [
  "last_7_days",
  "last_30_days",
  "this_month",
  "last_90_days",
  "custom"
] as const satisfies readonly PeriodQuery[];

export type DashboardPeriodQuery = (typeof DASHBOARD_PERIOD_QUERY_VALUES)[number];

export type PeriodQueryOption = {
  value: PeriodQuery;
  label: string;
};

export const PERIOD_QUERY_OPTIONS: PeriodQueryOption[] = [
  { value: "last_7_days", label: "Last 7 days" },
  { value: "last_30_days", label: "Last 30 days" },
  { value: "last_month", label: "Last month" },
  { value: "this_month", label: "This month" },
  { value: "last_90_days", label: "Last 90 days" },
  { value: "custom", label: "Custom range" }
];

export const DASHBOARD_PERIOD_QUERY_OPTIONS: PeriodQueryOption[] = PERIOD_QUERY_OPTIONS.filter(
  (option): option is PeriodQueryOption & { value: DashboardPeriodQuery } =>
    (DASHBOARD_PERIOD_QUERY_VALUES as readonly string[]).includes(option.value)
);

export const DEFAULT_PERIOD_QUERY: PeriodQuery = "last_30_days";
export const DEFAULT_DASHBOARD_PERIOD_QUERY: DashboardPeriodQuery = "last_30_days";

export function getPeriodQueryLabel(period: PeriodQuery | DashboardPeriodQuery): string {
  return PERIOD_QUERY_OPTIONS.find((o) => o.value === period)?.label ?? period;
}

export function isCustomPeriodRangeValid(from?: string, to?: string): boolean {
  const f = from?.trim();
  const t = to?.trim();
  if (!f || !t) return false;
  return f <= t;
}

export function buildPeriodQuery(
  period: PeriodQuery | DashboardPeriodQuery,
  customFrom?: string,
  customTo?: string
): { period: PeriodQuery | DashboardPeriodQuery; from?: string; to?: string } {
  if (period === "custom") {
    return {
      period,
      from: customFrom?.trim(),
      to: customTo?.trim()
    };
  }
  return { period };
}

export function buildPeriodQueryKey(
  period: PeriodQuery | DashboardPeriodQuery,
  customFrom: string,
  customTo: string
): string {
  return `${period}|${customFrom}|${customTo}`;
}

export function formatPeriodDateRange(from: string, to: string): string {
  try {
    const fromLabel = format(parseISO(from), "MMM d, yyyy");
    const toLabel = format(parseISO(to), "MMM d, yyyy");
    return `${fromLabel} – ${toLabel}`;
  } catch {
    return `${from} – ${to}`;
  }
}

export function buildPeriodQueryParams(period: PeriodQuery | DashboardPeriodQuery, from?: string, to?: string) {
  const params: Record<string, string> = { period };
  if (period === "custom") {
    if (from) params.from = from;
    if (to) params.to = to;
  }
  return params;
}

export function getPeriodQuerySubtitle(
  from: string | undefined,
  to: string | undefined,
  period: PeriodQuery | DashboardPeriodQuery,
  isLoading: boolean,
  suffix: string
): string {
  if (from && to) {
    return `${formatPeriodDateRange(from, to)} · ${suffix}`;
  }
  if (isLoading) return "Loading…";
  return `${getPeriodQueryLabel(period)} · ${suffix}`;
}
