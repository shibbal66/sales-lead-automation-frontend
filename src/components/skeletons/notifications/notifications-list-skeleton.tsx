import { cn } from "@/lib/utils";

export function NotificationsListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <ul className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, index) => (
        <li key={index} className="flex items-start gap-3 px-5 py-4">
          <div className="h-10 w-10 shrink-0 animate-pulse rounded-lg bg-muted" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex justify-between gap-3">
              <div className="h-4 w-2/5 animate-pulse rounded bg-muted" />
              <div className="h-3 w-12 animate-pulse rounded bg-muted" />
            </div>
            <div className={cn("h-3 animate-pulse rounded bg-muted", index % 2 === 0 ? "w-full" : "w-4/5")} />
          </div>
        </li>
      ))}
    </ul>
  );
}
