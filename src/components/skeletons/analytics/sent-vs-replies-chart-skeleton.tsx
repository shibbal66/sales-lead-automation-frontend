import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsSentVsRepliesChartSkeleton() {
  return (
    <>
      <div className="space-y-2">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-3 w-64" />
      </div>
      <Skeleton className="mt-4 h-[280px] w-full rounded-lg" />
    </>
  );
}
