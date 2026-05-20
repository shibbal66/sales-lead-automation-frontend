import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
  className?: string;
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 7,
  className,
}: TablePaginationProps) {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, "...", totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, "...", currentPage, "...", totalPages);
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) return null;

  const controlClassName =
    "flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <div
      className={cn(
        "flex max-w-full flex-wrap items-center justify-center gap-1 overflow-x-auto scrollbar-thin px-2 py-4",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => handlePageChange(1)}
        disabled={currentPage === 1}
        className={controlClassName}
        aria-label="First page"
      >
        <ChevronsLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={controlClassName}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      {getPageNumbers().map((page, index) =>
        typeof page === "number" ? (
          <button
            key={index}
            type="button"
            onClick={() => handlePageChange(page)}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-md text-xs font-semibold transition-colors",
              currentPage === page
                ? "bg-primary text-primary-foreground"
                : "border border-border text-foreground hover:bg-muted",
            )}
          >
            {page}
          </button>
        ) : (
          <span key={index} className="px-1 text-xs text-muted-foreground">
            ...
          </span>
        ),
      )}
      <button
        type="button"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={controlClassName}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => handlePageChange(totalPages)}
        disabled={currentPage === totalPages}
        className={controlClassName}
        aria-label="Last page"
      >
        <ChevronsRight className="h-4 w-4" />
      </button>
    </div>
  );
}
