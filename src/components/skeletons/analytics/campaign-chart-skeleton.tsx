import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsCampaignChartSkeleton() {
  return (
    <>
      <div className="space-y-2">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-3 w-64" />
      </div>
      <Skeleton className="mt-4 h-[300px] w-full rounded-lg" />
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={`campaign-chart-stat-${i}`} className="h-20 rounded-lg" />
        ))}
      </div>
    </>
  );
}
