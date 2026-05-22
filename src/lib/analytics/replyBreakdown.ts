import type {
  AnalyticsPeriod,
  AnalyticsReplyBreakdownSegment
} from "@/types/analytics";
import {
  buildAnalyticsPeriodQuery,
  buildAnalyticsPeriodQueryKey,
  DEFAULT_ANALYTICS_PERIOD,
} from "./period";

export {
  ANALYTICS_PERIOD_OPTIONS,
  DEFAULT_ANALYTICS_PERIOD as DEFAULT_ANALYTICS_REPLY_BREAKDOWN_PERIOD,
  getAnalyticsPeriodLabel,
  isCustomAnalyticsRangeValid,
  type AnalyticsPeriodOption
} from "./period";

export const ANALYTICS_REPLY_BREAKDOWN_EMPTY_MESSAGE =
  "No outreach activity for this period.";

export type ReplyBreakdownChartPoint = {
  name: string;
  value: number;
  color: string;
  percent: number;
  key: string;
};

export function buildAnalyticsReplyBreakdownQuery(
  period: AnalyticsPeriod,
  customFrom?: string,
  customTo?: string
) {
  return buildAnalyticsPeriodQuery(period, customFrom, customTo);
}

export function buildReplyBreakdownQueryKey(
  period: AnalyticsPeriod,
  customFrom: string,
  customTo: string
): string {
  return buildAnalyticsPeriodQueryKey(period, customFrom, customTo);
}

export function replyBreakdownSegmentsToChartData(
  segments: AnalyticsReplyBreakdownSegment[] | undefined
): ReplyBreakdownChartPoint[] {
  if (!segments?.length) return [];
  return segments.map((segment) => ({
    name: segment.label,
    value: segment.count,
    color: segment.color,
    percent: segment.percent,
    key: segment.key
  }));
}

