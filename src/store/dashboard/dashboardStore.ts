import { create } from "zustand";
import {
  getDashboardActiveCampaigns,
  getDashboardPerformance,
  getDashboardRecentActivity,
  getDashboardSummary
} from "@/services/dashboard/dashboardServices";
import {
  buildDashboardPerformanceQuery,
  DEFAULT_ACTIVE_CAMPAIGNS_LIMIT,
  DEFAULT_DASHBOARD_PERIOD,
  DEFAULT_RECENT_ACTIVITY_LIMIT,
  isCustomPerformanceRangeValid,
  parseDashboardPerformanceData
} from "@/lib/dashboard";
import { showApiErrorToast } from "@/lib/apiToast";
import type {
  DashboardActiveCampaign,
  DashboardPerformanceData,
  DashboardPeriod,
  DashboardRecentActivityItem,
  DashboardSummaryData
} from "@/types/dashboard";

interface DashboardStoreState {
  summary: DashboardSummaryData | null;
  isFetchingSummary: boolean;
  performance: DashboardPerformanceData | null;
  performancePeriod: DashboardPeriod;
  performanceCustomFrom: string;
  performanceCustomTo: string;
  isFetchingPerformance: boolean;
  activeCampaigns: DashboardActiveCampaign[];
  totalRunning: number;
  activeCampaignsPage: number;
  activeCampaignsTotalPages: number;
  isFetchingActiveCampaigns: boolean;
  recentActivity: DashboardRecentActivityItem[];
  isFetchingRecentActivity: boolean;
  fetchSummary: () => Promise<void>;
  fetchPerformance: () => Promise<void>;
  fetchActiveCampaigns: (options?: { page?: number; append?: boolean }) => Promise<void>;
  fetchRecentActivity: () => Promise<void>;
  setPerformancePeriod: (period: DashboardPeriod) => void;
  setPerformanceCustomRange: (from: string, to: string) => void;
}

export const useDashboardStore = create<DashboardStoreState>((set, get) => ({
  summary: null,
  isFetchingSummary: false,
  performance: null,
  performancePeriod: DEFAULT_DASHBOARD_PERIOD,
  performanceCustomFrom: "",
  performanceCustomTo: "",
  isFetchingPerformance: false,
  activeCampaigns: [],
  totalRunning: 0,
  activeCampaignsPage: 1,
  activeCampaignsTotalPages: 0,
  isFetchingActiveCampaigns: false,
  recentActivity: [],
  isFetchingRecentActivity: false,

  fetchSummary: async () => {
    set({ isFetchingSummary: true });
    try {
      const response = await getDashboardSummary();
      if (!response.success || !response.data) {
        showApiErrorToast(response);
        return;
      }
      set({ summary: response.data });
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      set({ isFetchingSummary: false });
    }
  },

  fetchPerformance: async () => {
    const { performancePeriod, performanceCustomFrom, performanceCustomTo } = get();
    if (
      performancePeriod === "custom" &&
      !isCustomPerformanceRangeValid(performanceCustomFrom, performanceCustomTo)
    ) {
      return;
    }

    set({ isFetchingPerformance: true });
    try {
      const query = buildDashboardPerformanceQuery(
        performancePeriod,
        performanceCustomFrom,
        performanceCustomTo
      );
      const response = await getDashboardPerformance(query);
      if (!response.success || !response.data) {
        showApiErrorToast(response);
        return;
      }
      const performance = parseDashboardPerformanceData(response.data);
      if (!performance) {
        showApiErrorToast(response.message);
        return;
      }
      set({ performance });
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      set({ isFetchingPerformance: false });
    }
  },

  fetchActiveCampaigns: async (options = {}) => {
    const page = options.page ?? 1;
    const append = options.append ?? false;

    set({ isFetchingActiveCampaigns: true });
    try {
      const response = await getDashboardActiveCampaigns({
        page,
        limit: DEFAULT_ACTIVE_CAMPAIGNS_LIMIT
      });
      if (!response.success || !response.data) {
        showApiErrorToast(response);
        return;
      }
      const { total_running, campaigns, pagination } = response.data;
      set((state) => ({
        totalRunning: total_running,
        activeCampaignsPage: pagination.page,
        activeCampaignsTotalPages: pagination.totalPages,
        activeCampaigns: append ? [...state.activeCampaigns, ...campaigns] : campaigns
      }));
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      set({ isFetchingActiveCampaigns: false });
    }
  },

  fetchRecentActivity: async () => {
    set({ isFetchingRecentActivity: true });
    try {
      const response = await getDashboardRecentActivity({
        page: 1,
        limit: DEFAULT_RECENT_ACTIVITY_LIMIT
      });
      if (!response.success || !response.data) {
        showApiErrorToast(response);
        return;
      }
      set({ recentActivity: response.data.slice(0, DEFAULT_RECENT_ACTIVITY_LIMIT) });
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      set({ isFetchingRecentActivity: false });
    }
  },

  setPerformancePeriod: (period) => {
    set({ performancePeriod: period });
    if (period !== "custom") {
      void get().fetchPerformance();
    }
  },

  setPerformanceCustomRange: (from, to) => {
    set({
      performancePeriod: "custom",
      performanceCustomFrom: from,
      performanceCustomTo: to
    });
    if (isCustomPerformanceRangeValid(from, to)) {
      void get().fetchPerformance();
    }
  }
}));
