import type { GetLeadsQuery, LeadSortBy, LeadSortOrder } from "@/types";

export type { LeadSortBy, LeadSortOrder };
export { LEAD_SORT_BY_VALUES } from "@/types";

export type LeadsBrowseFilters = {
  search: string;
  emailStatus: string;
  country: string;
  state: string;
  city: string;
  industry: string;
  seniority: string;
  department: string;
  company: string;
  outreachStatus: string;
  fitTag: string;
};

export const EMPTY_LEADS_BROWSE_FILTERS: LeadsBrowseFilters = {
  search: "",
  emailStatus: "",
  country: "",
  state: "",
  city: "",
  industry: "",
  seniority: "",
  department: "",
  company: "",
  outreachStatus: "",
  fitTag: "",
};

const LEAD_SORT_BY_LABELS: Record<LeadSortBy, string> = {
  created_at: "Created",
  fullName: "Name",
  email: "Email",
  company: "Company",
  country: "Country",
  fitScore: "Fit score",
  dateAdded: "Date added",
};

export function formatLeadSortByLabel(sortBy: LeadSortBy): string {
  return LEAD_SORT_BY_LABELS[sortBy];
}

export function leadsBrowseFiltersToQuery(
  filters: LeadsBrowseFilters,
  options: {
    page: number;
    limit: number;
    sortBy: LeadSortBy;
    sortOrder: LeadSortOrder;
  },
): GetLeadsQuery {
  const trim = (value: string) => value.trim() || undefined;

  return {
    page: options.page,
    limit: options.limit,
    sortBy: options.sortBy,
    sortOrder: options.sortOrder,
    search: trim(filters.search),
    emailStatus: trim(filters.emailStatus),
    country: trim(filters.country),
    state: trim(filters.state),
    city: trim(filters.city),
    industry: trim(filters.industry),
    seniority: trim(filters.seniority),
    department: trim(filters.department),
    company: trim(filters.company),
    outreachStatus: trim(filters.outreachStatus),
    fitTag: trim(filters.fitTag),
  };
}
