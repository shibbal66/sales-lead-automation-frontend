import { useCallback, useEffect, useState } from "react";
import { useLeadStore } from "@/store/lead/leadStore";
import { clampPage, getTotalPages } from "@/lib/listPagination";
import {
  EMPTY_LEADS_BROWSE_FILTERS,
  leadsBrowseFiltersToQuery,
  type LeadsBrowseFilters,
} from "@/lib/leads/query";
import type { LeadSortBy, LeadSortOrder } from "@/types";

export function useLeadsPage() {
  const page = useLeadStore((state) => state.page);
  const limit = useLeadStore((state) => state.limit);
  const total = useLeadStore((state) => state.total);
  const isFetching = useLeadStore((state) => state.isFetching);
  const fetchLeads = useLeadStore((state) => state.fetchLeads);
  const setPage = useLeadStore((state) => state.setPage);

  const [draftFilters, setDraftFilters] = useState<LeadsBrowseFilters>(
    EMPTY_LEADS_BROWSE_FILTERS,
  );
  const [appliedFilters, setAppliedFilters] = useState<LeadsBrowseFilters>(
    EMPTY_LEADS_BROWSE_FILTERS,
  );
  const [sortBy, setSortBy] = useState<LeadSortBy>("created_at");
  const [sortOrder, setSortOrder] = useState<LeadSortOrder>("desc");

  const loadLeads = useCallback(() => {
    void fetchLeads(
      leadsBrowseFiltersToQuery(appliedFilters, {
        page,
        limit,
        sortBy,
        sortOrder,
      }),
    );
  }, [appliedFilters, fetchLeads, limit, page, sortBy, sortOrder]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const totalPages = getTotalPages(total, limit);

  useEffect(() => {
    if (isFetching || total === 0) return;
    const nextPage = clampPage(page, totalPages);
    if (nextPage !== page) {
      setPage(nextPage);
    }
  }, [isFetching, page, setPage, total, totalPages]);

  const handlePageChange = useCallback(
    (nextPage: number) => {
      setPage(clampPage(nextPage, totalPages));
    },
    [setPage, totalPages],
  );

  const updateDraftFilter = useCallback(
    <K extends keyof LeadsBrowseFilters>(key: K, value: LeadsBrowseFilters[K]) => {
      setDraftFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters({ ...draftFilters });
    setPage(1);
  }, [draftFilters, setPage]);

  const handleResetFilters = useCallback(() => {
    setDraftFilters(EMPTY_LEADS_BROWSE_FILTERS);
    setAppliedFilters(EMPTY_LEADS_BROWSE_FILTERS);
    setSortBy("created_at");
    setSortOrder("desc");
    setPage(1);
  }, [setPage]);

  const handleSortByChange = useCallback(
    (value: LeadSortBy) => {
      setSortBy(value);
      setPage(1);
    },
    [setPage],
  );

  const handleSortOrderChange = useCallback(
    (value: LeadSortOrder) => {
      setSortOrder(value);
      setPage(1);
    },
    [setPage],
  );

  const hasActiveFilters =
    Object.values(appliedFilters).some((value) => value.trim().length > 0) ||
    sortBy !== "created_at" ||
    sortOrder !== "desc";

  return {
    draftFilters,
    updateDraftFilter,
    handleApplyFilters,
    handleResetFilters,
    sortBy,
    sortOrder,
    handleSortByChange,
    handleSortOrderChange,
    hasActiveFilters,
    currentPage: page,
    totalPages,
    total,
    isFetching,
    handlePageChange,
  };
}
