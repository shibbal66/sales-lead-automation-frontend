import { DASHBOARD_KPI_COUNT } from "@/lib/dashboard";
import { DashboardKpiCardSkeleton } from "./kpi-card-skeleton";

type DashboardKpiRowSkeletonProps = {
  count?: number;
};

export function DashboardKpiRowSkeleton({ count = DASHBOARD_KPI_COUNT }: DashboardKpiRowSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <DashboardKpiCardSkeleton key={`dashboard-kpi-skeleton-${i}`} />
      ))}
    </>
  );
}
