import { ChartTooltipRow, ChartTooltipShell } from "@/components/charts/chart-tooltip";
import type { ReplyBreakdownChartPoint } from "@/lib/analytics";

type TooltipPayloadItem = {
  value?: number;
  name?: string;
  payload?: ReplyBreakdownChartPoint;
};

interface ReplyBreakdownTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

export function ReplyBreakdownTooltip({ active, payload }: ReplyBreakdownTooltipProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <ChartTooltipShell title={point.name}>
      <ChartTooltipRow label="Count" value={(point.value ?? 0).toLocaleString()} />
      <ChartTooltipRow label="Share" value={`${point.percent}%`} />
    </ChartTooltipShell>
  );
}
