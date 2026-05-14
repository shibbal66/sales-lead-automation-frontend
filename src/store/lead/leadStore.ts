import { create } from "zustand";
import { getLeadById as getLeadByIdApi, getLeads as getLeadsApi } from "@/services/lead/leadServices";
import { showApiErrorToast } from "@/lib/apiToast";
import type { GetLeadByIdResponse, GetLeadsQuery, GetLeadsResponse, LeadApiModel } from "@/types";

function leadFromByIdData(data: NonNullable<GetLeadByIdResponse["data"]>): LeadApiModel | null {
  if ("lead" in data && data.lead) return data.lead;
  return data as LeadApiModel;
}

function parseLeadsListSuccess(
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

interface LeadStoreState {
  leads: LeadApiModel[];
  selectedLead: LeadApiModel | null;
  page: number;
  limit: number;
  total: number;
  isFetching: boolean;
  isFetchingDetail: boolean;
  fetchLeads: (query?: GetLeadsQuery) => Promise<void>;
  setPage: (page: number) => void;
  fetchLeadById: (leadId: number | string) => Promise<LeadApiModel>;
  clearSelectedLead: () => void;
}

export const useLeadStore = create<LeadStoreState>((set, get) => ({
  leads: [],
  selectedLead: null,
  page: 1,
  limit: 20,
  total: 0,
  isFetching: false,
  isFetchingDetail: false,

  setPage: (page) => set({ page }),

  fetchLeads: async (query = {}) => {
    const { page: currentPage, limit: currentLimit } = get();
    const { page = currentPage, limit = currentLimit, search, country, industry } = query;
    set({ isFetching: true });
    try {
      const response = await getLeadsApi({ page, limit, search, country, industry });
      if (!response.success) {
        showApiErrorToast(response);
        return;
      }
      const parsed = parseLeadsListSuccess(response, page, limit);
      if (!parsed) {
        showApiErrorToast(response);
        return;
      }
      set({
        leads: parsed.leads,
        page: parsed.page,
        limit: parsed.limit,
        total: parsed.total
      });
    } finally {
      set({ isFetching: false });
    }
  },

  fetchLeadById: async (leadId) => {
    set({ isFetchingDetail: true });
    try {
      const response = await getLeadByIdApi(leadId);
      const lead = response.data ? leadFromByIdData(response.data) : null;
      if (!response.success || !lead) {
        showApiErrorToast(response);
        return Promise.reject(response);
      }
      set({ selectedLead: lead });
      return lead;
    } finally {
      set({ isFetchingDetail: false });
    }
  },

  clearSelectedLead: () => set({ selectedLead: null })
}));
