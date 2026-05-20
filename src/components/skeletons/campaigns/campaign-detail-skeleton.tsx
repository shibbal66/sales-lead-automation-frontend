import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CampaignDetailSkeleton() {
  return (
    <div className="space-y-6 p-6" aria-busy="true" aria-label="Loading campaign">
      <Skeleton className="h-9 w-40" />
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-md" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="space-y-4 p-5 shadow-card">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </Card>
        <Card className="space-y-4 p-5 shadow-card">
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </Card>
      </div>
      <Card className="p-5 shadow-card">
        <Skeleton className="h-5 w-36" />
        <div className="mt-4 space-y-3">
          {Array.from({ length: 3 }, (_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </Card>
    </div>
  );
}
