export const DEFAULT_CAMPAIGN_COMPARISON_LIMIT = 10;

export const ANALYTICS_CAMPAIGN_COMPARISON_EMPTY_MESSAGE = "No campaigns to compare yet.";

export type ReplySparklineChartPoint = {
  index: number;
  replies: number;
};

export function formatAnalyticsRatePercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${formatted}%`;
}

export function replySparklineToChartData(values: number[] | undefined): ReplySparklineChartPoint[] {
  if (!values?.length) return [];
  return values.map((replies, index) => ({ index, replies }));
}
