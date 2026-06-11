import { ChartTooltipRow, ChartTooltipShell } from "@/components/charts/chart-tooltip";
import { getReplySparklinePeriodLabel } from "@/lib/analytics";

type ReplySparklineTooltipProps = {
  values: number[];
  activeIndex: number;
};

export function ReplySparklineTooltip({ values, activeIndex }: ReplySparklineTooltipProps) {
  const value = values[activeIndex];
  if (value === undefined) return null;

  return (
    <ChartTooltipShell title={getReplySparklinePeriodLabel(activeIndex, values.length)}>
      <ChartTooltipRow label="Replies" value={value.toLocaleString()} />
    </ChartTooltipShell>
  );
}
