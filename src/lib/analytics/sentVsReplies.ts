import { differenceInDays, parseISO, startOfMonth } from "date-fns";
import { formatPeriodDateRange, isCustomPeriodRangeValid } from "@/lib/periodQuery";
import type { PeriodQuery } from "@/lib/periodQuery";
import type { AnalyticsSentVsRepliesData, AnalyticsSentVsRepliesPoint } from "@/types/analytics";

export { formatPeriodDateRange as formatSentVsRepliesWeekRange };

export const DEFAULT_SENT_VS_REPLIES_WEEKS = 4;

export const ANALYTICS_SENT_VS_REPLIES_EMPTY_MESSAGE =
  "No emails sent or replies recorded for this period.";

const PERIOD_TO_WEEKS: Record<Exclude<PeriodQuery, "custom">, number> = {
  last_7_days: 2,
  last_30_days: 4,
  last_month: 4,
  last_90_days: 12,
  this_month: 4
};

/** Map page period filter to `weeks` query param for sent-vs-replies (approximate). */
export function periodToSentVsRepliesWeeks(
  period: PeriodQuery,
  customFrom?: string,
  customTo?: string
): number {
  if (period === "custom") {
    if (!isCustomPeriodRangeValid(customFrom, customTo)) {
      return DEFAULT_SENT_VS_REPLIES_WEEKS;
    }
    const from = parseISO(customFrom!.trim());
    const to = parseISO(customTo!.trim());
    const days = differenceInDays(to, from) + 1;
    return Math.min(52, Math.max(1, Math.ceil(days / 7)));
  }

  if (period === "this_month") {
    const now = new Date();
    const days = differenceInDays(now, startOfMonth(now)) + 1;
    return Math.min(52, Math.max(1, Math.ceil(days / 7)));
  }

  return PERIOD_TO_WEEKS[period];
}

export type SentVsRepliesChartPoint = {
  week: string;
  sent: number;
  replies: number;
  from: string;
  to: string;
};

export function sentVsRepliesSeriesToChartData(
  series: AnalyticsSentVsRepliesPoint[] | undefined
): SentVsRepliesChartPoint[] {
  if (!series?.length) return [];
  return series.map((point) => ({
    week: point.label,
    sent: point.sent,
    replies: point.replies,
    from: point.from,
    to: point.to
  }));
}

export function getSentVsRepliesSubtitle(
  data: AnalyticsSentVsRepliesData | null,
  isLoading: boolean
): string {
  const totals = data?.totals;
  if (!totals) {
    if (isLoading) return "Loading…";
    return "By week";
  }
  return `By week · ${totals.sent.toLocaleString()} sent · ${totals.replies.toLocaleString()} replies`;
}
