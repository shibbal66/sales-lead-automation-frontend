import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  formatLeadSortByLabel,
  LEAD_SORT_BY_VALUES,
  type LeadsBrowseFilters,
} from "@/lib/leads/query";
import type { LeadSortBy, LeadSortOrder } from "@/types";
import { ChevronDown, RotateCcw, Search } from "lucide-react";

type LeadsFiltersBarProps = {
  draftFilters: LeadsBrowseFilters;
  sortBy: LeadSortBy;
  sortOrder: LeadSortOrder;
  isFetching: boolean;
  hasActiveFilters?: boolean;
  onDraftFilterChange: <K extends keyof LeadsBrowseFilters>(
    key: K,
    value: LeadsBrowseFilters[K],
  ) => void;
  onSortByChange: (value: LeadSortBy) => void;
  onSortOrderChange: (value: LeadSortOrder) => void;
  onApply: () => void;
  onReset: () => void;
};

export function LeadsFiltersBar({
  draftFilters,
  sortBy,
  sortOrder,
  isFetching,
  hasActiveFilters,
  onDraftFilterChange,
  onSortByChange,
  onSortOrderChange,
  onApply,
  onReset,
}: LeadsFiltersBarProps) {
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="leads-filter-search"
            value={draftFilters.search}
            onChange={(event) => onDraftFilterChange("search", event.target.value)}
            placeholder="Search by name, email, company..."
            className="pl-9"
            onKeyDown={(event) => {
              if (event.key === "Enter") onApply();
            }}
          />
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setMoreFiltersOpen((open) => !open)}
            aria-expanded={moreFiltersOpen}
          >
            More filters
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                moreFiltersOpen && "rotate-180",
              )}
              aria-hidden
            />
            {!moreFiltersOpen && hasActiveFilters ? (
              <span className="ml-1 rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-brand-text">
                Active
              </span>
            ) : null}
          </Button>
          <Button type="button" onClick={onApply} disabled={isFetching}>
            Apply filters
          </Button>
        </div>
      </div>

      <Collapsible open={moreFiltersOpen}>
        <CollapsibleContent className="space-y-4 border-t border-border pt-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="leads-filter-email-status">Email status</Label>
              <Input
                id="leads-filter-email-status"
                value={draftFilters.emailStatus}
                onChange={(event) => onDraftFilterChange("emailStatus", event.target.value)}
                placeholder="Email status"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="leads-filter-outreach-status">Outreach status</Label>
              <Input
                id="leads-filter-outreach-status"
                value={draftFilters.outreachStatus}
                onChange={(event) => onDraftFilterChange("outreachStatus", event.target.value)}
                placeholder="Outreach status"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="leads-filter-fit-tag">Fit tag</Label>
              <Input
                id="leads-filter-fit-tag"
                value={draftFilters.fitTag}
                onChange={(event) => onDraftFilterChange("fitTag", event.target.value)}
                placeholder="Fit tag"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="leads-filter-company">Company</Label>
              <Input
                id="leads-filter-company"
                value={draftFilters.company}
                onChange={(event) => onDraftFilterChange("company", event.target.value)}
                placeholder="Company"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="leads-filter-industry">Industry</Label>
              <Input
                id="leads-filter-industry"
                value={draftFilters.industry}
                onChange={(event) => onDraftFilterChange("industry", event.target.value)}
                placeholder="Industry"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="leads-filter-seniority">Seniority</Label>
              <Input
                id="leads-filter-seniority"
                value={draftFilters.seniority}
                onChange={(event) => onDraftFilterChange("seniority", event.target.value)}
                placeholder="Seniority"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="leads-filter-department">Department</Label>
              <Input
                id="leads-filter-department"
                value={draftFilters.department}
                onChange={(event) => onDraftFilterChange("department", event.target.value)}
                placeholder="Department"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="leads-filter-country">Country</Label>
              <Input
                id="leads-filter-country"
                value={draftFilters.country}
                onChange={(event) => onDraftFilterChange("country", event.target.value)}
                placeholder="Country"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="leads-filter-state">State</Label>
              <Input
                id="leads-filter-state"
                value={draftFilters.state}
                onChange={(event) => onDraftFilterChange("state", event.target.value)}
                placeholder="State"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="leads-filter-city">City</Label>
              <Input
                id="leads-filter-city"
                value={draftFilters.city}
                onChange={(event) => onDraftFilterChange("city", event.target.value)}
                placeholder="City"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5">
              <Label>Sort by</Label>
              <Select value={sortBy} onValueChange={(value) => onSortByChange(value as LeadSortBy)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_SORT_BY_VALUES.map((value) => (
                    <SelectItem key={value} value={value}>
                      {formatLeadSortByLabel(value)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Order</Label>
              <Select
                value={sortOrder}
                onValueChange={(value) => onSortOrderChange(value as LeadSortOrder)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="ml-auto"
              onClick={onReset}
            >
              <RotateCcw className="h-4 w-4" /> Reset
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
