import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SKELETON_ITEM_COUNT = 3;

export function DashboardActiveCampaignsPanelSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("h-auto max-h-[400px] overflow-y-auto scrollbar-thin p-5 shadow-card", className)}>
      <div className="mb-4 space-y-2">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: SKELETON_ITEM_COUNT }, (_, i) => (
          <div key={i} className="rounded-xl border border-border bg-surface/40 p-3">
            <div className="flex items-center justify-between gap-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="mt-2 h-1.5 w-full" />
            <div className="mt-2 flex justify-between">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-6 w-12" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
