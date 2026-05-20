import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const SKELETON_ITEM_COUNT = 10;

export function DashboardRecentActivityPanelSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn("p-5 shadow-card", className)}>
      <div className="mb-4">
        <Skeleton className="h-5 w-32" />
      </div>
      <ol className="relative space-y-4 border-l border-border pl-6">
        {Array.from({ length: SKELETON_ITEM_COUNT }, (_, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[27px] top-1.5 grid h-3 w-3 rounded-full bg-muted ring-4 ring-background" />
            <div className="flex items-center justify-between gap-4">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-3 w-16 shrink-0" />
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
