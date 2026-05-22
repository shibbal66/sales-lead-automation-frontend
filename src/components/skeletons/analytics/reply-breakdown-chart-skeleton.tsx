import { Skeleton } from "@/components/ui/skeleton";

export function AnalyticsReplyBreakdownChartSkeleton() {
  return (
    <>
      <div className="space-y-2">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3 w-52" />
      </div>
      <Skeleton className="mt-4 h-[280px] w-full rounded-lg" />
    </>
  );
}
