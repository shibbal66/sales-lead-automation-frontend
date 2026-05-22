import { create } from "zustand";
import {
  DEFAULT_ANALYTICS_PERIOD,
  DEFAULT_CAMPAIGN_COMPARISON_LIMIT,
  isCustomAnalyticsRangeValid,
  periodToSentVsRepliesWeeks
} from "@/lib/analytics";
import { showApiErrorToast } from "@/lib/apiToast";
import {
  getAnalyticsCampaignChart,
  getAnalyticsCampaignComparison,
  getAnalyticsOverview,
  getAnalyticsReplyBreakdown,
  getAnalyticsSentVsReplies
} from "@/services/analytics/analyticsServices";
import type {
  AnalyticsCampaignChartData,
  AnalyticsCampaignComparisonRow,
  AnalyticsOverviewData,
  AnalyticsPeriod,
  AnalyticsReplyBreakdownData,
  AnalyticsSentVsRepliesData
} from "@/types/analytics";
import { createPeriodQuerySliceHandlers } from "./periodQuerySlice";

interface AnalyticsStoreState {
  analyticsPeriod: AnalyticsPeriod;
  analyticsCustomFrom: string;
  analyticsCustomTo: string;

  overview: AnalyticsOverviewData | null;
  overviewQueryKey: string;
  isFetchingOverview: boolean;
  overviewHydrated: boolean;
  fetchOverview: (options?: { force?: boolean }) => Promise<void>;
  invalidateOverview: () => void;

  sentVsReplies: AnalyticsSentVsRepliesData | null;
  sentVsRepliesWeeks: number;
  sentVsRepliesCacheKey: string;
  isFetchingSentVsReplies: boolean;
  sentVsRepliesHydrated: boolean;
  fetchSentVsReplies: (options?: { force?: boolean; weeks?: number }) => Promise<void>;
  invalidateSentVsReplies: () => void;

  replyBreakdown: AnalyticsReplyBreakdownData | null;
  replyBreakdownQueryKey: string;
  isFetchingReplyBreakdown: boolean;
  replyBreakdownHydrated: boolean;
  fetchReplyBreakdown: (options?: { force?: boolean }) => Promise<void>;
  invalidateReplyBreakdown: () => void;

  campaignComparison: AnalyticsCampaignComparisonRow[];
  campaignComparisonPage: number;
  campaignComparisonTotalPages: number;
  campaignComparisonLimit: number;
  isFetchingCampaignComparison: boolean;
  campaignComparisonHydrated: boolean;
  fetchCampaignComparison: (options?: { page?: number; force?: boolean }) => Promise<void>;
  invalidateCampaignComparison: () => void;

  campaignChart: AnalyticsCampaignChartData | null;
  campaignChartQueryKey: string;
  isFetchingCampaignChart: boolean;
  campaignChartHydrated: boolean;
  fetchCampaignChart: (options?: { force?: boolean }) => Promise<void>;
  invalidateCampaignChart: () => void;

  setAnalyticsPeriod: (period: AnalyticsPeriod) => void;
  setAnalyticsCustomRange: (from: string, to: string) => void;
  refetchPeriodScopedAnalytics: () => Promise<void>;
}

const sharedPeriodKeys = {
  period: "analyticsPeriod",
  customFrom: "analyticsCustomFrom",
  customTo: "analyticsCustomTo"
} as const;

const overviewKeys = {
  data: "overview",
  ...sharedPeriodKeys,
  queryKey: "overviewQueryKey",
  isFetching: "isFetchingOverview",
  hydrated: "overviewHydrated"
} as const;

const replyBreakdownKeys = {
  data: "replyBreakdown",
  ...sharedPeriodKeys,
  queryKey: "replyBreakdownQueryKey",
  isFetching: "isFetchingReplyBreakdown",
  hydrated: "replyBreakdownHydrated"
} as const;

const campaignChartKeys = {
  data: "campaignChart",
  ...sharedPeriodKeys,
  queryKey: "campaignChartQueryKey",
  isFetching: "isFetchingCampaignChart",
  hydrated: "campaignChartHydrated"
} as const;

export const useAnalyticsStore = create<AnalyticsStoreState>((set, get) => {
  const overviewSlice = createPeriodQuerySliceHandlers<AnalyticsOverviewData>(
    () => ({
      data: get().overview,
      period: get().analyticsPeriod,
      customFrom: get().analyticsCustomFrom,
      customTo: get().analyticsCustomTo,
      queryKey: get().overviewQueryKey,
      isFetching: get().isFetchingOverview,
      hydrated: get().overviewHydrated
    }),
    set,
    overviewKeys,
    getAnalyticsOverview
  );

  const replyBreakdownSlice = createPeriodQuerySliceHandlers<AnalyticsReplyBreakdownData>(
    () => ({
      data: get().replyBreakdown,
      period: get().analyticsPeriod,
      customFrom: get().analyticsCustomFrom,
      customTo: get().analyticsCustomTo,
      queryKey: get().replyBreakdownQueryKey,
      isFetching: get().isFetchingReplyBreakdown,
      hydrated: get().replyBreakdownHydrated
    }),
    set,
    replyBreakdownKeys,
    getAnalyticsReplyBreakdown
  );

  const campaignChartSlice = createPeriodQuerySliceHandlers<AnalyticsCampaignChartData>(
    () => ({
      data: get().campaignChart,
      period: get().analyticsPeriod,
      customFrom: get().analyticsCustomFrom,
      customTo: get().analyticsCustomTo,
      queryKey: get().campaignChartQueryKey,
      isFetching: get().isFetchingCampaignChart,
      hydrated: get().campaignChartHydrated
    }),
    set,
    campaignChartKeys,
    getAnalyticsCampaignChart
  );

  const resolveSentVsRepliesWeeks = () => {
    const { analyticsPeriod, analyticsCustomFrom, analyticsCustomTo } = get();
    return periodToSentVsRepliesWeeks(analyticsPeriod, analyticsCustomFrom, analyticsCustomTo);
  };

  const refetchPeriodScopedAnalytics = async () => {
    await Promise.all([
      get().fetchOverview({ force: true }),
      get().fetchSentVsReplies({ force: true }),
      get().fetchReplyBreakdown({ force: true }),
      get().fetchCampaignChart({ force: true })
    ]);
  };

  return {
    analyticsPeriod: DEFAULT_ANALYTICS_PERIOD,
    analyticsCustomFrom: "",
    analyticsCustomTo: "",

    overview: null,
    overviewQueryKey: "",
    isFetchingOverview: false,
    overviewHydrated: false,
    fetchOverview: overviewSlice.fetch,
    invalidateOverview: overviewSlice.invalidate,

    sentVsReplies: null,
    sentVsRepliesWeeks: periodToSentVsRepliesWeeks(DEFAULT_ANALYTICS_PERIOD),
    sentVsRepliesCacheKey: "",
    isFetchingSentVsReplies: false,
    sentVsRepliesHydrated: false,

    fetchSentVsReplies: async (options = {}) => {
      const weeks = options.weeks ?? resolveSentVsRepliesWeeks();
      const periodKey = `${get().analyticsPeriod}|${get().analyticsCustomFrom}|${get().analyticsCustomTo}`;
      const cacheKey = `${periodKey}|${weeks}`;

      if (!options.force && get().sentVsRepliesHydrated && cacheKey === get().sentVsRepliesCacheKey) {
        return;
      }

      set({ isFetchingSentVsReplies: true, sentVsRepliesWeeks: weeks, sentVsRepliesCacheKey: cacheKey });
      try {
        const response = await getAnalyticsSentVsReplies({ weeks });
        if (!response.success || !response.data) {
          showApiErrorToast(response);
          return;
        }
        set({
          sentVsReplies: response.data,
          sentVsRepliesHydrated: true
        });
      } catch (error) {
        showApiErrorToast(error);
      } finally {
        set({ isFetchingSentVsReplies: false });
      }
    },

    invalidateSentVsReplies: () => {
      set({ sentVsRepliesHydrated: false, sentVsRepliesCacheKey: "" });
    },

    replyBreakdown: null,
    replyBreakdownQueryKey: "",
    isFetchingReplyBreakdown: false,
    replyBreakdownHydrated: false,
    fetchReplyBreakdown: replyBreakdownSlice.fetch,
    invalidateReplyBreakdown: replyBreakdownSlice.invalidate,

    campaignComparison: [],
    campaignComparisonPage: 1,
    campaignComparisonTotalPages: 0,
    campaignComparisonLimit: DEFAULT_CAMPAIGN_COMPARISON_LIMIT,
    isFetchingCampaignComparison: false,
    campaignComparisonHydrated: false,

    fetchCampaignComparison: async (options = {}) => {
      const page = options.page ?? get().campaignComparisonPage ?? 1;
      const isPagination = options.page !== undefined;

      if (!options.force && !isPagination && get().campaignComparisonHydrated) {
        return;
      }

      set({ isFetchingCampaignComparison: true, campaignComparisonPage: page });
      try {
        const response = await getAnalyticsCampaignComparison({
          page,
          limit: get().campaignComparisonLimit
        });
        if (!response.success || !response.data) {
          showApiErrorToast(response);
          return;
        }
        const { campaigns, pagination } = response.data;
        set({
          campaignComparison: campaigns,
          campaignComparisonHydrated: true,
          campaignComparisonPage: pagination.page,
          campaignComparisonTotalPages: pagination.totalPages
        });
      } catch (error) {
        showApiErrorToast(error);
      } finally {
        set({ isFetchingCampaignComparison: false });
      }
    },

    invalidateCampaignComparison: () => {
      set({ campaignComparisonHydrated: false });
    },

    campaignChart: null,
    campaignChartQueryKey: "",
    isFetchingCampaignChart: false,
    campaignChartHydrated: false,
    fetchCampaignChart: campaignChartSlice.fetch,
    invalidateCampaignChart: campaignChartSlice.invalidate,

    setAnalyticsPeriod: (period) => {
      set({ analyticsPeriod: period });
      if (period !== "custom") {
        void refetchPeriodScopedAnalytics();
      }
    },

    setAnalyticsCustomRange: (from, to) => {
      set({
        analyticsPeriod: "custom",
        analyticsCustomFrom: from,
        analyticsCustomTo: to
      });
      if (isCustomAnalyticsRangeValid(from, to)) {
        void refetchPeriodScopedAnalytics();
      }
    },

    refetchPeriodScopedAnalytics
  };
});
