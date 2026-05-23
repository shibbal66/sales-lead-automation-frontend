import { create } from "zustand";
import { getLeadById as getLeadByIdApi, getLeads as getLeadsApi } from "@/services/lead/leadServices";
import { showApiErrorToast } from "@/lib/apiToast";
import { parseLeadsListResponse } from "@/lib/parseLeadsListResponse";
import type { GetLeadByIdResponse, GetLeadsQuery, LeadApiModel } from "@/types";

function leadFromByIdData(data: NonNullable<GetLeadByIdResponse["data"]>): LeadApiModel | null {
  if ("lead" in data && data.lead) return data.lead;
  return data as LeadApiModel;
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
    const page = query.page ?? currentPage;
    const limit = query.limit ?? currentLimit;
    set({ isFetching: true });
    try {
      const response = await getLeadsApi({
        ...query,
        page,
        limit,
      });
      if (!response.success) {
        showApiErrorToast(response);
        return;
      }
      const parsed = parseLeadsListResponse(response, page, limit);
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
