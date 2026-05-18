import type { GetLeadsResponse } from "@/types";
import type { LeadApiModel } from "@/types";

export function parseLeadsListResponse(
  response: GetLeadsResponse,
  fallbackPage: number,
  fallbackLimit: number
): { leads: LeadApiModel[]; page: number; limit: number; total: number } | null {
  if (!response.success || response.data === undefined) return null;
  const d = response.data;
  const p = response.pagination;
  if (Array.isArray(d)) {
    return {
      leads: d,
      page: p?.page ?? fallbackPage,
      limit: p?.limit ?? fallbackLimit,
      total: p?.total ?? d.length
    };
  }
  if (d && typeof d === "object" && Array.isArray(d.leads)) {
    return {
      leads: d.leads,
      page: p?.page ?? d.page ?? fallbackPage,
      limit: p?.limit ?? d.limit ?? fallbackLimit,
      total: p?.total ?? d.total ?? d.leads.length
    };
  }
  return null;
}
