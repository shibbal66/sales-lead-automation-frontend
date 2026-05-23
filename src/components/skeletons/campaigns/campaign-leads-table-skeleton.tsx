import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TableRowsSkeleton } from "@/components/skeletons/shared/table-rows-skeleton";

const LEAD_ROW_CELLS = [
  { width: "w-40" },
  { content: <Skeleton className="h-6 w-16 rounded-full" /> },
  { width: "w-48" },
  { width: "w-28" },
  { width: "w-24" },
  { width: "w-28" },
  { content: <Skeleton className="h-8 w-8 rounded-md" />, className: "text-right" },
];

export function CampaignLeadsTableRowsSkeleton({ rows = 6 }: { rows?: number }) {
  return <TableRowsSkeleton rows={rows} cells={LEAD_ROW_CELLS} />;
}

export function CampaignLeadsTableSkeleton() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-9 w-20" />
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Mail Template</TableHead>
            <TableHead>Sent At</TableHead>
            <TableHead>Error</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <CampaignLeadsTableRowsSkeleton />
        </TableBody>
      </Table>
      <div className="flex justify-center border-t border-border py-4">
        <Skeleton className="h-9 w-48" />
      </div>
    </>
  );
}
