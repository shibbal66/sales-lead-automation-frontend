import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DashboardPerformanceChartSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-5 shadow-card", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3 w-56" />
        </div>
        <Skeleton className="h-9 w-28 shrink-0" />
      </div>
      <Skeleton className="h-[280px] w-full rounded-lg" />
    </Card>
  );
}
