import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { TablePagination } from "@/components/layout/table-pagination";
import { UserProfileAvatar } from "@/components/user-profile-avatar";
import { BulkAssignLeadsTableSkeleton } from "@/components/skeletons/leads/bulk-assign-leads-table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";
import { getLeads } from "@/services/lead/leadServices";
import { parseLeadsListResponse } from "@/lib/parseLeadsListResponse";
import { mapLeadApiToListRow } from "@/lib/leadPresentation";
import { showApiErrorToast } from "@/lib/apiToast";
import {
  getCampaignLeadCapacity,
  getCurrentPlanName,
  getMaxLeadsPerCampaign
} from "@/lib/billing";
import { useBillingStore } from "@/store/billing/billingStore";
import { buildBulkLeadAddCountSchema } from "@/validators/campaign";
import { clampPage, getTotalPages } from "@/lib/listPagination";
import { cn } from "@/lib/utils";
import type { LeadApiModel } from "@/types";
import {
  EMPTY_LEADS_BROWSE_FILTERS,
  leadsBrowseFiltersToQuery,
  type LeadsBrowseFilters,
} from "@/lib/leads/query";
import { ChevronDown, Plus, RotateCcw, Search } from "lucide-react";

const PAGE_LIMIT = 20;

type BulkAssignLeadsSheetProps = {
  open: boolean;
  assignedLeadDataIds: Set<string>;
  campaignLeadCount: number;
  campaignTargetLeads: number;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onAssign: (leadDataIds: string[]) => Promise<boolean>;
};

export function BulkAssignLeadsSheet({
  open,
  assignedLeadDataIds,
  campaignLeadCount,
  campaignTargetLeads,
  isSubmitting,
  onOpenChange,
  onAssign
}: BulkAssignLeadsSheetProps) {
  const subscription = useBillingStore((state) => state.subscription);
  const fetchSubscription = useBillingStore((state) => state.fetchSubscription);
  const maxLeadsPerCampaign = getMaxLeadsPerCampaign(subscription);
  const planName = getCurrentPlanName(subscription);
  const { maxAllowed, remainingSlots } = useMemo(
    () =>
      getCampaignLeadCapacity({
        maxLeadsPerCampaign,
        currentLeadCount: campaignLeadCount,
        campaignTargetLeads
      }),
    [campaignLeadCount, campaignTargetLeads, maxLeadsPerCampaign]
  );
  const bulkAddSchema = useMemo(
    () =>
      buildBulkLeadAddCountSchema({
        maxLeadsPerCampaign,
        currentLeadCount: campaignLeadCount,
        campaignTargetLeads
      }),
    [campaignLeadCount, campaignTargetLeads, maxLeadsPerCampaign]
  );

  const [draftFilters, setDraftFilters] = useState<LeadsBrowseFilters>(EMPTY_LEADS_BROWSE_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<LeadsBrowseFilters>(EMPTY_LEADS_BROWSE_FILTERS);
  const [leads, setLeads] = useState<LeadApiModel[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [assignmentError, setAssignmentError] = useState("");

  useEffect(() => {
    if (open) {
      void fetchSubscription();
    }
  }, [fetchSubscription, open]);

  useEffect(() => {
    if (selected.size <= remainingSlots) {
      setAssignmentError("");
    }
  }, [remainingSlots, selected.size]);

  const totalPages = getTotalPages(total, PAGE_LIMIT);

  const rows = useMemo(() => leads.map(mapLeadApiToListRow), [leads]);

  const selectableRows = useMemo(
    () => rows.filter((row) => !assignedLeadDataIds.has(row.id)),
    [assignedLeadDataIds, rows]
  );

  const loadLeads = useCallback(async (filters: LeadsBrowseFilters, nextPage: number) => {
    setIsFetching(true);
    try {
      const response = await getLeads(
        leadsBrowseFiltersToQuery(filters, {
          page: nextPage,
          limit: PAGE_LIMIT,
          sortBy: "created_at",
          sortOrder: "desc",
        }),
      );
      const parsed = parseLeadsListResponse(response, nextPage, PAGE_LIMIT);
      if (!parsed) {
        showApiErrorToast(response);
        return;
      }
      setLeads(parsed.leads);
      setPage(parsed.page);
      setTotal(parsed.total);
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      setIsFetching(false);
    }
  }, []);

  const resetSheetState = useCallback(() => {
    setDraftFilters(EMPTY_LEADS_BROWSE_FILTERS);
    setAppliedFilters(EMPTY_LEADS_BROWSE_FILTERS);
    setSelected(new Set());
    setPage(1);
    setFiltersOpen(true);
    setAssignmentError("");
  }, []);

  useEffect(() => {
    if (!open) return;
    resetSheetState();
    void loadLeads(EMPTY_LEADS_BROWSE_FILTERS, 1);
  }, [loadLeads, open, resetSheetState]);

  useEffect(() => {
    if (!open || isFetching || total === 0) return;
    const nextPage = clampPage(page, totalPages);
    if (nextPage !== page) {
      void loadLeads(appliedFilters, nextPage);
    }
  }, [appliedFilters, isFetching, loadLeads, open, page, total, totalPages]);

  const updateDraftFilter = (key: keyof LeadsBrowseFilters, value: string) => {
    setDraftFilters((previous) => ({ ...previous, [key]: value }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters(draftFilters);
    setSelected(new Set());
    void loadLeads(draftFilters, 1);
  };

  const handleResetFilters = () => {
    setDraftFilters(EMPTY_LEADS_BROWSE_FILTERS);
    setAppliedFilters(EMPTY_LEADS_BROWSE_FILTERS);
    setSelected(new Set());
    void loadLeads(EMPTY_LEADS_BROWSE_FILTERS, 1);
  };

  const handlePageChange = (nextPage: number) => {
    void loadLeads(appliedFilters, clampPage(nextPage, totalPages));
  };

  const allSelectableChecked =
    selectableRows.length > 0 && selectableRows.every((row) => selected.has(row.id));

  const atSelectionLimit = selected.size >= remainingSlots;

  const toggleAll = () => {
    setSelected((previous) => {
      const next = new Set(previous);
      if (allSelectableChecked) {
        selectableRows.forEach((row) => next.delete(row.id));
        setAssignmentError("");
      } else {
        selectableRows.forEach((row) => {
          if (next.size < remainingSlots) {
            next.add(row.id);
          }
        });
        if (selectableRows.length > remainingSlots - previous.size && remainingSlots > 0) {
          setAssignmentError(
            `Only ${remainingSlots.toLocaleString()} lead slot${remainingSlots === 1 ? "" : "s"} remaining on your plan.`
          );
        }
      }
      return next;
    });
  };

  const toggleOne = (id: string) => {
    if (assignedLeadDataIds.has(id)) return;
    setSelected((previous) => {
      const next = new Set(previous);
      if (next.has(id)) {
        next.delete(id);
        setAssignmentError("");
      } else {
        if (next.size >= remainingSlots) {
          setAssignmentError(
            remainingSlots === 0
              ? `This campaign already has the maximum of ${maxAllowed.toLocaleString()} leads allowed on your plan.`
              : `You can only add ${remainingSlots.toLocaleString()} more lead${remainingSlots === 1 ? "" : "s"}.`
          );
          return previous;
        }
        next.add(id);
        setAssignmentError("");
      }
      return next;
    });
  };

  const handleAssign = async () => {
    const parsed = bulkAddSchema.safeParse(selected.size);
    if (!parsed.success) {
      setAssignmentError(parsed.error.errors[0]?.message ?? "Invalid selection.");
      return;
    }

    setAssignmentError("");
    const ok = await onAssign([...selected]);
    if (ok) {
      setSelected(new Set());
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl flex-col gap-0 overflow-hidden p-0 sm:w-full">
        <DialogHeader className="border-b border-border px-6 py-5 text-left">
          <DialogTitle>Add leads to campaign</DialogTitle>
          <DialogDescription>
            Filter leads, select rows, then add them to this campaign.
          </DialogDescription>
          <p className="pt-2 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{planName}</span> ·{" "}
            {campaignLeadCount.toLocaleString()} / {maxAllowed.toLocaleString()} leads in campaign ·{" "}
            <span className="font-medium text-foreground">{remainingSlots.toLocaleString()}</span>{" "}
            slot{remainingSlots === 1 ? "" : "s"} remaining
          </p>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4 scrollbar-thin">
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <button
              type="button"
              onClick={() => setFiltersOpen((open) => !open)}
              className="flex w-full items-center justify-between gap-2 text-left"
              aria-expanded={filtersOpen}
              aria-controls="bulk-assign-leads-filters"
            >
              <span className="text-sm font-semibold">Filters</span>
              <ChevronDown
                className={cn(
                  "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  filtersOpen && "rotate-180",
                )}
                aria-hidden
              />
            </button>
            <Collapsible open={filtersOpen}>
              <CollapsibleContent id="bulk-assign-leads-filters" className="space-y-4 pt-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="lead-filter-search">Search</Label>
                    <div className="relative">
                      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="lead-filter-search"
                        value={draftFilters.search}
                        onChange={(event) => updateDraftFilter("search", event.target.value)}
                        placeholder="Name, company, email..."
                        className="pl-9"
                        onKeyDown={(event) => {
                          if (event.key === "Enter") handleApplyFilters();
                        }}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lead-filter-email-status">Email status</Label>
                    <Input
                      id="lead-filter-email-status"
                      value={draftFilters.emailStatus}
                      onChange={(event) => updateDraftFilter("emailStatus", event.target.value)}
                      placeholder="e.g. sent"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lead-filter-country">Country</Label>
                    <Input
                      id="lead-filter-country"
                      value={draftFilters.country}
                      onChange={(event) => updateDraftFilter("country", event.target.value)}
                      placeholder="Country"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lead-filter-state">State</Label>
                    <Input
                      id="lead-filter-state"
                      value={draftFilters.state}
                      onChange={(event) => updateDraftFilter("state", event.target.value)}
                      placeholder="State"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="lead-filter-city">City</Label>
                    <Input
                      id="lead-filter-city"
                      value={draftFilters.city}
                      onChange={(event) => updateDraftFilter("city", event.target.value)}
                      placeholder="City"
                    />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="lead-filter-industry">Industry</Label>
                    <Input
                      id="lead-filter-industry"
                      value={draftFilters.industry}
                      onChange={(event) => updateDraftFilter("industry", event.target.value)}
                      placeholder="Industry"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={handleResetFilters}>
                    <RotateCcw className="h-4 w-4" /> Reset
                  </Button>
                  <Button type="button" size="sm" onClick={handleApplyFilters} disabled={isFetching}>
                    Apply filters
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="mt-4 flex items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">
              {isFetching ? (
                <Skeleton className="inline-block h-4 w-32" />
              ) : (
                `${total} lead${total === 1 ? "" : "s"} found`
              )}
            </p>
            {selected.size > 0 ? (
              <p className="text-sm font-medium">
                {selected.size} selected
                {remainingSlots > 0 ? ` · ${remainingSlots - selected.size} slot${remainingSlots - selected.size === 1 ? "" : "s"} left` : null}
              </p>
            ) : null}
          </div>

          {assignmentError ? (
            <p className="mt-2 text-xs text-destructive">{assignmentError}</p>
          ) : null}

          {remainingSlots === 0 ? (
            <p className="mt-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              This campaign has reached the maximum of {maxAllowed.toLocaleString()} leads allowed on your{" "}
              {planName} plan.
            </p>
          ) : null}

          <div className="mt-3 overflow-hidden rounded-xl border border-border">
            <div className="overflow-x-auto scrollbar-thin">
            <Table className="w-full min-w-[36rem]">
              <TableHeader>
                <TableRow className="bg-muted/40 hover:bg-muted/40">
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allSelectableChecked}
                      disabled={selectableRows.length === 0 || isFetching || remainingSlots === 0}
                      onCheckedChange={toggleAll}
                      aria-label="Select all leads on this page"
                    />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isFetching && rows.length === 0 ? <BulkAssignLeadsTableSkeleton /> : null}
                {!isFetching && rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                      No leads match your filters.
                    </TableCell>
                  </TableRow>
                ) : null}
                {rows.map((row) => {
                  const lead = leads.find((item) => String(item.id) === row.id);
                  const isAssigned = assignedLeadDataIds.has(row.id);
                  const location = [lead?.city, lead?.state, lead?.country].filter(Boolean).join(", ");

                  return (
                    <TableRow key={row.id} className={isAssigned ? "opacity-60" : undefined}>
                      <TableCell>
                        <Checkbox
                          checked={selected.has(row.id)}
                          disabled={
                            isAssigned ||
                            isFetching ||
                            (!selected.has(row.id) && (remainingSlots === 0 || atSelectionLimit))
                          }
                          onCheckedChange={() => toggleOne(row.id)}
                          aria-label={`Select ${row.name}`}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex min-w-[140px] items-center gap-2">
                          <UserProfileAvatar name={row.name} size={28} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">{row.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{row.title}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[120px] truncate text-sm">{row.company}</TableCell>
                      <TableCell className="max-w-[160px] truncate text-sm text-muted-foreground">
                        {row.email}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {lead?.emailStatus?.trim() || "—"}
                      </TableCell>
                      <TableCell className="max-w-[140px] truncate text-sm text-muted-foreground">
                        {isAssigned ? (
                          <span className="text-xs font-medium text-primary">Already assigned</span>
                        ) : (
                          location || "—"
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
            </div>
            <TablePagination currentPage={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </div>
        </div>

        <DialogFooter className="flex-row justify-between gap-2 border-t border-border px-6 py-4 sm:space-x-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleAssign()}
            disabled={isSubmitting || selected.size === 0 || remainingSlots === 0}
          >
            <Plus className="h-4 w-4" />
            {isSubmitting
              ? "Adding..."
              : selected.size > 0
                ? `Add ${selected.size} lead${selected.size === 1 ? "" : "s"}`
                : "Add to campaign"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
