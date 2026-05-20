import { Skeleton } from "@/components/ui/skeleton";
import { TableRowsSkeleton } from "@/components/skeletons/shared/table-rows-skeleton";

const LEADS_ROW_CELLS = [
  { content: <Skeleton className="h-4 w-4 rounded" />, className: "w-10" },
  {
    content: (
      <div className="flex items-center gap-2.5">
        <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    )
  },
  { width: "w-24" },
  { width: "w-36" },
  { content: <Skeleton className="h-6 w-16 rounded-full" /> },
  { width: "w-20" },
  { content: <Skeleton className="h-6 w-14 rounded-full" /> },
  { width: "w-20" },
  {
    className: "text-right",
    content: (
      <div className="flex justify-end gap-1">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    )
  }
];

export function LeadsTableSkeleton({ rows = 10 }: { rows?: number }) {
  return <TableRowsSkeleton rows={rows} cells={LEADS_ROW_CELLS} />;
}
