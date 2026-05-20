import { Skeleton } from "@/components/ui/skeleton";
import { TableRowsSkeleton } from "@/components/skeletons/shared/table-rows-skeleton";

const BULK_ASSIGN_ROW_CELLS = [
  { content: <Skeleton className="h-4 w-4 rounded" />, className: "w-10" },
  {
    content: (
      <div className="flex min-w-[140px] items-center gap-2">
        <Skeleton className="h-7 w-7 shrink-0 rounded-full" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    )
  },
  { width: "w-24" },
  { width: "w-32" },
  { content: <Skeleton className="h-6 w-16 rounded-full" /> },
  { width: "w-28" }
];

export function BulkAssignLeadsTableSkeleton({ rows = 8 }: { rows?: number }) {
  return <TableRowsSkeleton rows={rows} cells={BULK_ASSIGN_ROW_CELLS} />;
}
