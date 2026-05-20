import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function LeadDetailSheetSkeleton() {
  return (
    <div className="flex h-full flex-col bg-background" aria-busy="true" aria-label="Loading lead details">
      <div className="flex items-start gap-4 border-b border-border bg-muted/25 p-6">
        <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-56" />
          <Skeleton className="h-4 w-40" />
          <div className="flex gap-2 pt-1">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        </div>
      </div>
      <div className="mx-4 mt-3 grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 sm:mx-6 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-8 w-full rounded-md" />
        ))}
      </div>
      <div className="flex-1 space-y-4 p-4 sm:p-6">
        <Card className="space-y-3 border-border bg-card p-4 shadow-card">
          <Skeleton className="h-4 w-20" />
          <div className="grid gap-2 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </Card>
        <Card className="space-y-3 border-border bg-card p-4 shadow-card">
          <Skeleton className="h-4 w-16" />
          <div className="grid gap-2 sm:grid-cols-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
