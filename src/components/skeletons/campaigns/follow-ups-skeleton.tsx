import { Skeleton } from "@/components/ui/skeleton";

export function FollowUpsSkeleton({ count = 3 }: { count?: number }) {
  return (
    <ol className="mt-4 space-y-2" aria-busy="true" aria-label="Loading follow-ups">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="rounded-xl border border-border bg-surface/40 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Skeleton className="h-5 w-28" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
          <Skeleton className="mt-3 h-10 w-32" />
          <Skeleton className="mt-3 h-20 w-full" />
        </li>
      ))}
    </ol>
  );
}
