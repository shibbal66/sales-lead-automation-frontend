import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";

export type TableSkeletonCell = {
  width?: string;
  className?: string;
  content?: ReactNode;
};

type TableRowsSkeletonProps = {
  rows?: number;
  cells: TableSkeletonCell[];
};

export function TableRowsSkeleton({ rows = 8, cells }: TableRowsSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, rowIndex) => (
        <TableRow key={`skeleton-row-${rowIndex}`} className="hover:bg-transparent">
          {cells.map((cell, cellIndex) => (
            <TableCell key={`skeleton-cell-${rowIndex}-${cellIndex}`} className={cell.className}>
              {cell.content ?? (
                <Skeleton className={cell.width ? `h-4 ${cell.width}` : "h-4 w-full"} />
              )}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}
