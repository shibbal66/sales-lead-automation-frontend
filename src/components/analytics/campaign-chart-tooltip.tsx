import { ChartTooltipRow, ChartTooltipShell } from "@/components/charts/chart-tooltip";
import { formatPeriodDateRange } from "@/lib/periodQuery";
import type { CampaignChartPoint } from "@/lib/analytics";

type TooltipPayloadItem = {
  value?: number;
  name?: string;
  payload?: CampaignChartPoint;
};

interface CampaignChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

export function CampaignChartTooltip({ active, payload, label }: CampaignChartTooltipProps) {
  if (!active || !payload?.length) return null;

  const date = payload[0]?.payload?.date;
  const title = date ? formatPeriodDateRange(date, date) : label;

  return (
    <ChartTooltipShell title={title}>
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
