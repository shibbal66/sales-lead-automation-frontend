import { useCallback, useEffect, useState } from "react";
import { useLeadStore } from "@/store/lead/leadStore";
import { clampPage, getTotalPages } from "@/lib/listPagination";

export function useLeadsPage() {
  const page = useLeadStore((state) => state.page);
  const limit = useLeadStore((state) => state.limit);
  const total = useLeadStore((state) => state.total);
  const isFetching = useLeadStore((state) => state.isFetching);
  const fetchLeads = useLeadStore((state) => state.fetchLeads);
  const setPage = useLeadStore((state) => state.setPage);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search.trim()), 400);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadLeads = useCallback(() => {
    void fetchLeads({
      page,
      limit,
      search: debouncedSearch || undefined,
      country: countryFilter === "all" ? undefined : countryFilter,
      industry: industryFilter === "all" ? undefined : industryFilter
    });
  }, [countryFilter, debouncedSearch, fetchLeads, industryFilter, limit, page]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, countryFilter, industryFilter, setPage]);

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
    [setPage, totalPages]
  );

  const handleCountryFilterChange = useCallback(
    (value: string) => {
      setCountryFilter(value);
      setPage(1);
    },
    [setPage]
  );

  const handleIndustryFilterChange = useCallback(
    (value: string) => {
      setIndustryFilter(value);
      setPage(1);
    },
    [setPage]
  );

  return {
    search,
    setSearch,
    countryFilter,
    industryFilter,
    handleCountryFilterChange,
    handleIndustryFilterChange,
    currentPage: page,
    totalPages,
    total,
    isFetching,
    handlePageChange
  };
}
