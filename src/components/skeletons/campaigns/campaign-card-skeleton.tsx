import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CampaignCardSkeleton() {
  return (
    <Card className="flex flex-col gap-3 p-5 shadow-card">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
        <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <Skeleton className="h-2 w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-3 w-28" />
        <Skeleton className="h-8 w-20" />
      </div>
    </Card>
  );
}

export function CampaignsGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <CampaignCardSkeleton key={`campaign-card-skeleton-${i}`} />
      ))}
    </>
  );
}
