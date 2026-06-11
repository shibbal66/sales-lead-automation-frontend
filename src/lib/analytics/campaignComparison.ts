export const DEFAULT_CAMPAIGN_COMPARISON_LIMIT = 10;

export const ANALYTICS_CAMPAIGN_COMPARISON_EMPTY_MESSAGE = "No campaigns to compare yet.";

export type ReplySparklineChartPoint = {
  index: number;
  replies: number;
};

export type ReplySparklinePoint = {
  x: number;
  y: number;
  value: number;
};

export type ReplySparklineGeometry = {
  width: number;
  height: number;
  points: ReplySparklinePoint[];
  linePath: string;
  areaPath: string;
  baselineY: number;
  isSingle: boolean;
  isFlat: boolean;
};

export const REPLY_SPARKLINE_WIDTH = 84;
export const REPLY_SPARKLINE_HEIGHT = 30;

export function formatAnalyticsRatePercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  const formatted = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${formatted}%`;
}

export function replySparklineToChartData(values: number[] | undefined): ReplySparklineChartPoint[] {
  if (!values?.length) return [];
  return values.map((replies, index) => ({ index, replies }));
}

export function formatReplySparklineTooltip(values: number[]): string {
  return values
    .map((value, index) => `${getReplySparklinePeriodLabel(index, values.length)}: ${value}`)
    .join(" → ");
}

export function getReplySparklinePeriodLabel(index: number, total: number): string {
  if (total <= 1) return "Latest period";
  return `Period ${index + 1}`;
}

export function findNearestReplySparklinePointIndex(
  points: ReplySparklinePoint[],
  pointerX: number
): number {
  if (points.length === 0) return 0;
  if (points.length === 1) return 0;

  let nearestIndex = 0;
  let nearestDistance = Number.POSITIVE_INFINITY;

  points.forEach((point, index) => {
    const distance = Math.abs(point.x - pointerX);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

export function buildReplySparklineGeometry(
  values: number[] | undefined,
  width = REPLY_SPARKLINE_WIDTH,
  height = REPLY_SPARKLINE_HEIGHT
): ReplySparklineGeometry | null {
  if (!values?.length) return null;

  const padX = 3;
  const padY = 4;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const isSingle = values.length === 1;
  const isFlat = !isSingle && range === 0;
  const baselineY = padY + innerH / 2;

  const points: ReplySparklinePoint[] = values.map((value, index) => {
    const x = isSingle ? width / 2 : padX + (index / (values.length - 1)) * innerW;
    const normalized = range === 0 ? 0.5 : (value - min) / range;
    const y = padY + innerH * (1 - normalized);
    return { x, y, value };
  });

  const linePath = isSingle
    ? `M ${padX} ${baselineY.toFixed(2)} L ${(width - padX).toFixed(2)} ${baselineY.toFixed(2)}`
    : points
        .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
        .join(" ");

  const areaPath =
    isSingle || points.length < 2
      ? ""
      : `${linePath} L ${points[points.length - 1].x.toFixed(2)} ${(height - padY).toFixed(2)} L ${points[0].x.toFixed(2)} ${(height - padY).toFixed(2)} Z`;

  return {
    width,
    height,
    points,
    linePath,
    areaPath,
    baselineY,
    isSingle,
    isFlat
  };
}
