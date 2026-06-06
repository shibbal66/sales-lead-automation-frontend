import { create } from "zustand";
import {
  addCampaignLead as addCampaignLeadApi,
  bulkAddCampaignLeads as bulkAddCampaignLeadsApi,
  createCampaign as createCampaignApi,
  deleteCampaign as deleteCampaignApi,
  deleteCampaignLead as deleteCampaignLeadApi,
  getCampaignById as getCampaignByIdApi,
  getCampaignLeads as getCampaignLeadsApi,
  getCampaigns as getCampaignsApi,
  updateCampaign as updateCampaignApi,
  updateCampaignLead as updateCampaignLeadApi
} from "@/services/campaign/campaignServices";
import { useBillingStore } from "@/store/billing/billingStore";
import type {
  AddCampaignLeadRequest,
  BulkAddCampaignLeadsRequest,
  CampaignApiModel,
  CampaignLeadApiModel,
  CampaignLeadStatus,
  CampaignStatus,
  CreateCampaignRequest,
  GetCampaignByIdResponse,
  GetCampaignLeadsQuery,
  GetCampaignLeadsResponse,
  UpdateCampaignLeadRequest,
  UpdateCampaignRequest
} from "@/types";
import { showApiErrorOrPlanLimitDialog } from "@/lib/planLimit";
import { showApiErrorToast } from "@/lib/apiToast";

function campaignFromByIdData(data: NonNullable<GetCampaignByIdResponse["data"]>): CampaignApiModel | null {
  if ("campaign" in data && data.campaign) return data.campaign;
  return data as CampaignApiModel;
}

function parseCampaignLeadsSuccess(
  response: GetCampaignLeadsResponse,
  fallbackPage: number,
  fallbackLimit: number
): { leads: CampaignLeadApiModel[]; page: number; limit: number; total: number } | null {
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

interface CampaignStoreState {
  campaigns: CampaignApiModel[];
  selectedCampaign: CampaignApiModel | null;
  total: number;
  totalPages: number;
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
  campaignLeadsStatusFilter: CampaignLeadStatus | undefined;
  isFetchingCampaignLeads: boolean;
  isAddingCampaignLead: boolean;
  isBulkAddingCampaignLeads: boolean;
  isUpdatingCampaignLead: boolean;
  isDeletingCampaignLead: boolean;
  createCampaign: (payload: CreateCampaignRequest) => Promise<{ campaign: CampaignApiModel; message: string }>;
  updateCampaign: (campaignId: string, payload: UpdateCampaignRequest) => Promise<CampaignApiModel>;
  deleteCampaign: (campaignId: string) => Promise<string>;
  fetchCampaigns: (page?: number, limit?: number, status?: CampaignStatus) => Promise<void>;
  fetchCampaignById: (campaignId: string) => Promise<CampaignApiModel>;
  fetchCampaignLeads: (campaignId: string, query?: GetCampaignLeadsQuery) => Promise<void>;
  setCampaignLeadsPage: (page: number) => void;
  setCampaignLeadsStatusFilter: (status: CampaignLeadStatus | undefined) => void;
  addCampaignLead: (campaignId: string, payload: AddCampaignLeadRequest) => Promise<CampaignLeadApiModel>;
  bulkAddCampaignLeads: (campaignId: string, payload: BulkAddCampaignLeadsRequest) => Promise<string>;
  updateCampaignLead: (
    campaignId: string,
    campaignLeadId: string,
    payload: UpdateCampaignLeadRequest
  ) => Promise<void>;
  deleteCampaignLead: (campaignId: string, campaignLeadId: string) => Promise<void>;
  clearSelectedCampaign: () => void;
  clearCampaignLeads: () => void;
}

export const useCampaignStore = create<CampaignStoreState>((set, get) => ({
  campaigns: [],
  selectedCampaign: null,
  total: 0,
  totalPages: 1,
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
  campaignLeadsStatusFilter: undefined,
  isFetchingCampaignLeads: false,
  isAddingCampaignLead: false,
  isBulkAddingCampaignLeads: false,
  isUpdatingCampaignLead: false,
  isDeletingCampaignLead: false,
  createCampaign: async (
    payload
  ): Promise<{ campaign: CampaignApiModel; message: string }> => {
    set({ isCreating: true });
    try {
      const response = await createCampaignApi(payload);
      if (!response.success || !response.data?.campaign) {
        throw response;
      }

      const campaign = response.data.campaign;
      set((state) => ({ campaigns: [campaign, ...state.campaigns], total: state.total + 1 }));
      void useBillingStore.getState().fetchBillingQuota();
      return {
        campaign,
        message: response.message ?? "Campaign created successfully."
      };
    } catch (error) {
      showApiErrorOrPlanLimitDialog(error);
      throw error;
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
      void useBillingStore.getState().fetchBillingQuota();
      return response.message ?? "Campaign deleted successfully.";
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
      if (!response.success) {
        showApiErrorToast(response);
        return;
      }
      const list = Array.isArray(response.data) ? response.data : [];
      const p = response.pagination;
      const total = p?.total ?? list.length;
      const limitResolved = p?.limit ?? limit;
      const totalPages =
        p?.totalPages ?? Math.max(1, Math.ceil(total / Math.max(limitResolved, 1)));
      set({
        campaigns: list,
        total,
        totalPages,
        page: p?.page ?? page,
        limit: limitResolved,
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
      const campaign = response.data ? campaignFromByIdData(response.data) : null;
      if (!response.success || !campaign) {
        showApiErrorToast(response);
        return Promise.reject(response);
      }
      set({ selectedCampaign: campaign });
      return campaign;
    } finally {
      set({ isFetchingDetail: false });
    }
  },

  fetchCampaignLeads: async (campaignId, query = {}) => {
    const { campaignLeadsPage, campaignLeadsLimit, campaignLeadsStatusFilter } = get();
    const page = query.page ?? campaignLeadsPage;
    const limit = query.limit ?? campaignLeadsLimit;
    const status = query.status ?? campaignLeadsStatusFilter;
    set({ isFetchingCampaignLeads: true });
    try {
      const response = await getCampaignLeadsApi(campaignId, {
        page,
        limit,
        ...(status ? { status } : {}),
      });
      const parsed = parseCampaignLeadsSuccess(response, page, limit);
      if (!parsed) {
        showApiErrorToast(response);
        return;
      }
      set({
        campaignLeads: parsed.leads,
        campaignLeadsTotal: parsed.total,
        campaignLeadsPage: parsed.page,
        campaignLeadsLimit: parsed.limit
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
      void useBillingStore.getState().fetchBillingQuota();
      return response.data.lead;
    } finally {
      set({ isAddingCampaignLead: false });
    }
  },

  bulkAddCampaignLeads: async (campaignId, payload) => {
    set({ isBulkAddingCampaignLeads: true });
    try {
      const response = await bulkAddCampaignLeadsApi(campaignId, payload);
      if (!response.success) {
        showApiErrorToast(response);
        return Promise.reject(response);
      }
      void useBillingStore.getState().fetchBillingQuota();
      return response.message ?? "Leads added to campaign.";
    } finally {
      set({ isBulkAddingCampaignLeads: false });
    }
  },

  updateCampaignLead: async (campaignId, campaignLeadId, payload) => {
    set({ isUpdatingCampaignLead: true });
    try {
      const response = await updateCampaignLeadApi(campaignId, campaignLeadId, payload);
      if (!response.success) {
        showApiErrorToast(response);
        return Promise.reject(response);
      }
      if (response.data?.lead) {
        set((state) => ({
          campaignLeads: state.campaignLeads.map((l) => (l.id === campaignLeadId ? response.data!.lead! : l))
        }));
      } else {
        set((state) => ({
          campaignLeads: state.campaignLeads.map((l) =>
            l.id === campaignLeadId
              ? {
                  ...l,
                  status: payload.status,
                  sent_at: payload.sent_at,
                  mail_template: payload.mail_template,
                }
              : l
          )
        }));
      }
    } finally {
      set({ isUpdatingCampaignLead: false });
    }
  },

  deleteCampaignLead: async (campaignId, campaignLeadId) => {
    set({ isDeletingCampaignLead: true });
    try {
      const response = await deleteCampaignLeadApi(campaignId, campaignLeadId);
      if (!response.success) {
        showApiErrorToast(response);
        return Promise.reject(response);
      }
      set((state) => ({
        campaignLeads: state.campaignLeads.filter((l) => l.id !== campaignLeadId),
        campaignLeadsTotal: Math.max(0, state.campaignLeadsTotal - 1)
      }));
      void useBillingStore.getState().fetchBillingQuota();
    } finally {
      set({ isDeletingCampaignLead: false });
    }
  },

  setCampaignLeadsPage: (page) => set({ campaignLeadsPage: page }),

  setCampaignLeadsStatusFilter: (status) => set({ campaignLeadsStatusFilter: status }),

  clearSelectedCampaign: () => set({ selectedCampaign: null }),

  clearCampaignLeads: () =>
    set({
      campaignLeads: [],
      campaignLeadsTotal: 0,
      campaignLeadsPage: 1,
      campaignLeadsLimit: 20,
      campaignLeadsStatusFilter: undefined,
    })
}));
