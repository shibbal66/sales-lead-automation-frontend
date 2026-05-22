import { PeriodQuerySelect } from "@/components/shared/period-query-select";
import { DASHBOARD_PERIOD_QUERY_OPTIONS } from "@/lib/periodQuery";
import type { DashboardPeriodQuery } from "@/lib/periodQuery";

type DashboardPerformancePeriodSelectProps = {
  period: DashboardPeriodQuery;
  customFrom: string;
  customTo: string;
  disabled?: boolean;
  onPeriodChange: (period: DashboardPeriodQuery) => void;
  onCustomRangeApply: (from: string, to: string) => void;
};

export function DashboardPerformancePeriodSelect(props: DashboardPerformancePeriodSelectProps) {
  return (
    <PeriodQuerySelect
      {...props}
      options={DASHBOARD_PERIOD_QUERY_OPTIONS}
      idPrefix="performance"
    />
  );
}
