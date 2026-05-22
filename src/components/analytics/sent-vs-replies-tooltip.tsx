import { ChartTooltipRow, ChartTooltipShell } from "@/components/charts/chart-tooltip";
import { formatPeriodDateRange } from "@/lib/periodQuery";
import type { SentVsRepliesChartPoint } from "@/lib/analytics";

type TooltipPayloadItem = {
  value?: number;
  name?: string;
  payload?: SentVsRepliesChartPoint;
};

interface SentVsRepliesTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
}

export function SentVsRepliesTooltip({ active, payload }: SentVsRepliesTooltipProps) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <ChartTooltipShell
      title={point.week}
      subtitle={formatPeriodDateRange(point.from, point.to)}
    >
      {payload.map((entry) => (
        <ChartTooltipRow
          key={entry.name}
          label={entry.name}
          value={(entry.value ?? 0).toLocaleString()}
        />
      ))}
    </ChartTooltipShell>
  );
}
