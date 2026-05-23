import { Skeleton } from "@/components/ui/skeleton";

export function FollowUpsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <ol className="mt-4 space-y-2" aria-busy="true" aria-label="Loading follow-ups">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="rounded-lg border border-border bg-surface/40 p-3">
          <div className="flex items-start gap-3">
            <Skeleton className="h-8 w-8 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-4 w-28" />
                <div className="flex gap-1">
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                  <Skeleton className="h-8 w-8 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
