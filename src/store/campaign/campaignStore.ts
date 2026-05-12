import { create } from "zustand";
import {
  addCampaignLead as addCampaignLeadApi,
  createCampaign as createCampaignApi,
  deleteCampaign as deleteCampaignApi,
  getCampaignById as getCampaignByIdApi,
  getCampaignLeads as getCampaignLeadsApi,
  getCampaigns as getCampaignsApi,
  updateCampaign as updateCampaignApi
} from "@/services/campaign/campaignServices";
import type {
  AddCampaignLeadRequest,
  CampaignApiModel,
  CampaignLeadApiModel,
  CampaignStatus,
  CreateCampaignRequest,
  GetCampaignLeadsQuery,
  UpdateCampaignRequest
} from "@/types";
import { showApiErrorToast } from "@/lib/apiToast";

interface CampaignStoreState {
  campaigns: CampaignApiModel[];
  selectedCampaign: CampaignApiModel | null;
  total: number;
  page: number;
  limit: number;
  statusFilter: CampaignStatus | undefined;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetching: boolean;
  isFetchingDetail: boolean;
  campaignLeads: CampaignLeadApiModel[];
  campaignLeadsTotal: number;
  campaignLeadsPage: number;
  campaignLeadsLimit: number;
  isFetchingCampaignLeads: boolean;
  isAddingCampaignLead: boolean;
  createCampaign: (payload: CreateCampaignRequest) => Promise<CampaignApiModel>;
  updateCampaign: (campaignId: string, payload: UpdateCampaignRequest) => Promise<CampaignApiModel>;
  deleteCampaign: (campaignId: string) => Promise<string>;
  fetchCampaigns: (page?: number, limit?: number, status?: CampaignStatus) => Promise<void>;
  fetchCampaignById: (campaignId: string) => Promise<CampaignApiModel>;
  fetchCampaignLeads: (campaignId: string, query?: GetCampaignLeadsQuery) => Promise<void>;
  setCampaignLeadsPage: (page: number) => void;
  addCampaignLead: (campaignId: string, payload: AddCampaignLeadRequest) => Promise<CampaignLeadApiModel>;
  clearSelectedCampaign: () => void;
  clearCampaignLeads: () => void;
}

export const useCampaignStore = create<CampaignStoreState>((set, get) => ({
  campaigns: [],
  selectedCampaign: null,
  total: 0,
  page: 1,
  limit: 20,
  statusFilter: undefined,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isFetching: false,
  isFetchingDetail: false,
  campaignLeads: [],
  campaignLeadsTotal: 0,
  campaignLeadsPage: 1,
  campaignLeadsLimit: 20,
  isFetchingCampaignLeads: false,
  isAddingCampaignLead: false,

  createCampaign: async (payload) => {
    set({ isCreating: true });
    try {
      const response = await createCampaignApi(payload);
      if (!response.success || !response.data?.campaign) {
        showApiErrorToast(response);
        return Promise.reject(response);
      }

      const campaign = response.data.campaign;
      set((state) => ({ campaigns: [campaign, ...state.campaigns], total: state.total + 1 }));
      return campaign;
    } finally {
      set({ isCreating: false });
    }
  },

  deleteCampaign: async (campaignId) => {
    set({ isDeleting: true });
    try {
      const response = await deleteCampaignApi(campaignId);
      if (!response.success) {
        showApiErrorToast(response);
        return Promise.reject(response);
      }
      set((state) => ({
        campaigns: state.campaigns.filter((campaign) => campaign.id !== campaignId),
        selectedCampaign: state.selectedCampaign?.id === campaignId ? null : state.selectedCampaign
      }));
      return response.message || "Campaign deleted successfully.";
    } finally {
      set({ isDeleting: false });
    }
  },

  updateCampaign: async (campaignId, payload) => {
    set({ isUpdating: true });
    try {
      const response = await updateCampaignApi(campaignId, payload);
      if (!response.success || !response.data?.campaign) {
        showApiErrorToast(response);
        return Promise.reject(response);
      }
      const updatedCampaign = response.data.campaign;
      set((state) => ({
        campaigns: state.campaigns.map((campaign) =>
          campaign.id === campaignId ? updatedCampaign : campaign
        ),
        selectedCampaign: state.selectedCampaign?.id === campaignId ? updatedCampaign : state.selectedCampaign
      }));
      return updatedCampaign;
    } finally {
      set({ isUpdating: false });
    }
  },

  fetchCampaigns: async (page = 1, limit = 20, status) => {
    set({ isFetching: true });
    try {
      const response = await getCampaignsApi(page, limit, status);
      if (!response.success || !response.data) {
        showApiErrorToast(response);
        return;
      }
      set({
        campaigns: response.data.campaigns ?? [],
        total: response.data.total ?? 0,
        page: response.data.page ?? page,
        limit: response.data.limit ?? limit,
        statusFilter: status
      });
    } finally {
      set({ isFetching: false });
    }
  },

  fetchCampaignById: async (campaignId) => {
    set({ isFetchingDetail: true });
    try {
      const response = await getCampaignByIdApi(campaignId);
      if (!response.success || !response.data?.campaign) {
        showApiErrorToast(response);
        return Promise.reject(response);
      }
      set({ selectedCampaign: response.data.campaign });
      return response.data.campaign;
    } finally {
      set({ isFetchingDetail: false });
    }
  },

  fetchCampaignLeads: async (campaignId, query = {}) => {
    const { campaignLeadsPage, campaignLeadsLimit } = get();
    const page = query.page ?? campaignLeadsPage;
    const limit = query.limit ?? campaignLeadsLimit;
    set({ isFetchingCampaignLeads: true });
    try {
      const response = await getCampaignLeadsApi(campaignId, { page, limit });
      if (!response.success || !response.data?.leads) {
        showApiErrorToast(response);
        return;
      }
      set({
        campaignLeads: response.data.leads,
        campaignLeadsTotal: response.data.total ?? response.data.leads.length,
        campaignLeadsPage: response.data.page ?? page,
        campaignLeadsLimit: response.data.limit ?? limit
      });
    } finally {
      set({ isFetchingCampaignLeads: false });
    }
  },

  addCampaignLead: async (campaignId, payload) => {
    set({ isAddingCampaignLead: true });
    try {
      const response = await addCampaignLeadApi(campaignId, payload);
      if (!response.success || !response.data?.lead) {
        showApiErrorToast(response);
        return Promise.reject(response);
      }
      return response.data.lead;
    } finally {
      set({ isAddingCampaignLead: false });
    }
  },

  setCampaignLeadsPage: (page) => set({ campaignLeadsPage: page }),

  clearSelectedCampaign: () => set({ selectedCampaign: null }),

  clearCampaignLeads: () =>
    set({
      campaignLeads: [],
      campaignLeadsTotal: 0,
      campaignLeadsPage: 1,
      campaignLeadsLimit: 20
    })
}));
