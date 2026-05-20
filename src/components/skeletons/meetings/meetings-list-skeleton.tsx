import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableRowsSkeleton } from "@/components/skeletons/shared/table-rows-skeleton";

const MEETING_ROW_CELLS = [
  { width: "w-32" },
  { width: "w-40" },
  { width: "w-24" },
  { width: "w-36" },
  { width: "w-16" },
  {
    content: <Skeleton className="h-6 w-20 rounded-full" />
  },
  {
    className: "text-right",
    content: (
      <div className="flex justify-end gap-1">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-20" />
      </div>
    )
  }
];

type MeetingsListSkeletonProps = {
  showActions?: boolean;
};

export function MeetingsListSkeleton({ showActions = true }: MeetingsListSkeletonProps) {
  const cells = showActions ? MEETING_ROW_CELLS : MEETING_ROW_CELLS.slice(0, -1);

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/40 hover:bg-muted/40">
          <TableHead>Title</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Campaign</TableHead>
          <TableHead>Meeting Date & Time</TableHead>
          <TableHead>Booked At</TableHead>
          <TableHead>Status</TableHead>
          {showActions ? <TableHead className="w-[180px] text-right">Actions</TableHead> : null}
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRowsSkeleton rows={8} cells={cells} />
      </TableBody>
    </Table>
  );
}
