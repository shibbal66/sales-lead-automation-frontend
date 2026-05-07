import { create } from "zustand";
import { getLeadById as getLeadByIdApi, getLeads as getLeadsApi } from "@/services/lead/leadServices";
import { showApiErrorToast } from "@/lib/apiToast";
import type { LeadApiModel } from "@/types";

interface LeadStoreState {
  leads: LeadApiModel[];
  selectedLead: LeadApiModel | null;
  page: number;
  limit: number;
  total: number;
  isFetching: boolean;
  isFetchingDetail: boolean;
  fetchLeads: (page?: number, limit?: number) => Promise<void>;
  fetchLeadById: (leadId: number | string) => Promise<LeadApiModel>;
  clearSelectedLead: () => void;
}

export const useLeadStore = create<LeadStoreState>((set) => ({
  leads: [],
  selectedLead: null,
  page: 1,
  limit: 20,
  total: 0,
  isFetching: false,
  isFetchingDetail: false,

  fetchLeads: async (page = 1, limit = 20) => {
    set({ isFetching: true });
    try {
      const response = await getLeadsApi(page, limit);
      if (!response.success || !response.data?.leads) {
        showApiErrorToast(response);
        return;
      }
      set({
        leads: response.data.leads,
        page: response.data.page ?? page,
        limit: response.data.limit ?? limit,
        total: response.data.total ?? response.data.leads.length
      });
    } finally {
      set({ isFetching: false });
    }
  },

  fetchLeadById: async (leadId) => {
    set({ isFetchingDetail: true });
    try {
      const response = await getLeadByIdApi(leadId);
      if (!response.success || !response.data?.lead) {
        showApiErrorToast(response);
        return Promise.reject(response);
      }
      set({ selectedLead: response.data.lead });
      return response.data.lead;
    } finally {
      set({ isFetchingDetail: false });
    }
  },

  clearSelectedLead: () => set({ selectedLead: null })
}));
