import { Skeleton } from "@/components/ui/skeleton";
import { WEEKDAY_LABELS } from "@/lib/meetings/calendarGrid";

const GRID_WEEKS = 6;

export function MeetingsCalendarSkeleton() {
  return (
    <div className="flex min-h-[520px] flex-col" aria-busy="true" aria-label="Loading calendar">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-7 w-36" />
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border bg-muted/30">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="border-r border-border px-1 py-2 text-center last:border-r-0"
          >
            <Skeleton className="mx-auto h-3 w-8" />
          </div>
        ))}
      </div>

      <div className="grid min-h-[480px] flex-1 auto-rows-fr grid-cols-7">
        {Array.from({ length: GRID_WEEKS * 7 }, (_, i) => (
          <div
            key={`cal-cell-${i}`}
            className="flex min-h-[88px] flex-col border-b border-r border-border p-1.5 last:border-r-0"
          >
            <Skeleton className="mb-1 ml-auto h-6 w-6 rounded-full" />
            <div className="mt-auto space-y-0.5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
