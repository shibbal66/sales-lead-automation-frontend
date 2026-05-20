import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DashboardKpiCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("relative overflow-hidden p-5 shadow-card", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-9 w-20" />
        </div>
        <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
      </div>
    </Card>
  );
}
