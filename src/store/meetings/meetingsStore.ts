import { create } from "zustand";
import { getMeetingStats } from "@/services/dashboard/dashboardServices";
import {
  cancelMeeting as cancelMeetingApi,
  createMeeting as createMeetingApi,
  getMeetings,
  updateMeeting as updateMeetingApi
} from "@/services/meetings/meetingServices";
import type { MeetingsFilterDraft } from "@/lib/meetings/filters";
import { mapMeetingApiToListItem, mapMeetingsApiToListItems } from "@/lib/meetings/mapMeeting";
import { DEFAULT_MEETINGS_LIMIT } from "@/lib/meetings/query";
import {
  campaignFilterToQuery,
  dateFilterToIsoFrom,
  dateFilterToIsoTo,
  statusFilterToQuery
} from "@/lib/meetings/filters";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import { useCampaignStore } from "@/store/campaign/campaignStore";
import type {
  CreateMeetingRequest,
  Meeting,
  MeetingsListQuery,
  UpdateMeetingRequest
} from "@/types/meeting";
import type { MeetingStatsData } from "@/types/meetingStats";

type MeetingsFetchMode = "list" | "calendar";

export type MeetingsStoreFilters = Pick<
  MeetingsListQuery,
  "status" | "campaign_id" | "from" | "to"
>;

function getCampaignNameByIdMap(): Map<string, string> {
  const map = new Map<string, string>();
  for (const c of useCampaignStore.getState().campaigns) {
    if (c.id) map.set(c.id, c.name);
  }
  return map;
}

function draftToStoreFilters(draft: MeetingsFilterDraft): MeetingsStoreFilters {
  return {
    status: statusFilterToQuery(draft.status),
    campaign_id: campaignFilterToQuery(draft.campaignId),
    from: draft.fromDate ? dateFilterToIsoFrom(draft.fromDate) : undefined,
    to: draft.toDate ? dateFilterToIsoTo(draft.toDate) : undefined
  };
}

function replaceMeetingInLists(meeting: Meeting) {
  return (state: {
    meetings: Meeting[];
    calendarMeetings: Meeting[];
  }) => ({
    meetings: state.meetings.map((m) => (m.id === meeting.id ? meeting : m)),
    calendarMeetings: state.calendarMeetings.map((m) => (m.id === meeting.id ? meeting : m))
  });
}

interface MeetingsStoreState {
  meetings: Meeting[];
  calendarMeetings: Meeting[];
  meetingStats: MeetingStatsData | null;
  page: number;
  total: number;
  totalPages: number;
  isFetching: boolean;
  isFetchingCalendar: boolean;
  isFetchingMeetingStats: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isCancelling: boolean;
  fetchMode: MeetingsFetchMode;
  listHydrated: boolean;
  calendarHydrated: boolean;
  meetingStatsHydrated: boolean;
  filters: MeetingsStoreFilters;
  fetchMeetings: (options?: { page?: number; force?: boolean }) => Promise<void>;
  fetchCalendarMeetings: (options?: { force?: boolean }) => Promise<void>;
  fetchMeetingStats: (options?: { force?: boolean }) => Promise<void>;
  applyFilters: (draft: MeetingsFilterDraft) => Promise<void>;
  createMeeting: (
    payload: CreateMeetingRequest,
    options?: { campaignName?: string }
  ) => Promise<Meeting | null>;
  updateMeeting: (
    id: string,
    payload: UpdateMeetingRequest,
    options?: { campaignName?: string }
  ) => Promise<Meeting | null>;
  cancelMeeting: (id: string) => Promise<Meeting | null>;
  refetchCurrent: () => Promise<void>;
  /** Call when leaving Meetings page so the next visit refetches. */
  invalidateCache: () => void;
}

export const useMeetingsStore = create<MeetingsStoreState>((set, get) => ({
  meetings: [],
  calendarMeetings: [],
  meetingStats: null,
  page: 1,
  total: 0,
  totalPages: 0,
  isFetching: false,
  isFetchingCalendar: false,
  isFetchingMeetingStats: false,
  isCreating: false,
  isUpdating: false,
  isCancelling: false,
  fetchMode: "list",
  listHydrated: false,
  calendarHydrated: false,
  meetingStatsHydrated: false,
  filters: {},

  fetchMeetingStats: async (options = {}) => {
    if (!options.force && get().meetingStatsHydrated) {
      return;
    }

    set({ isFetchingMeetingStats: true });
    try {
      const response = await getMeetingStats();
      if (!response.success || !response.data) {
        showApiErrorToast(response);
        return;
      }
      set({ meetingStats: response.data, meetingStatsHydrated: true });
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      set({ isFetchingMeetingStats: false });
    }
  },

  fetchMeetings: async (options = {}) => {
    const page = options.page ?? get().page ?? 1;
    const isPagination = options.page !== undefined;
    if (!options.force && !isPagination && get().listHydrated) {
      set({ fetchMode: "list" });
      return;
    }

    const { filters } = get();
    set({ isFetching: true, fetchMode: "list", page });
    try {
      const response = await getMeetings({
        ...filters,
        page,
        limit: DEFAULT_MEETINGS_LIMIT
      });
      if (!response.success || !response.data) {
        showApiErrorToast(response);
        return;
      }
      const meetings = mapMeetingsApiToListItems(response.data, getCampaignNameByIdMap());
      const p = response.pagination;
      set({
        meetings,
        listHydrated: true,
        page: p?.page ?? page,
        total: p?.total ?? meetings.length,
        totalPages: p?.totalPages ?? 1
      });
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      set({ isFetching: false });
    }
  },

  fetchCalendarMeetings: async (options = {}) => {
    if (!options.force && get().calendarHydrated) {
      set({ fetchMode: "calendar" });
      return;
    }

    set({ isFetchingCalendar: true, fetchMode: "calendar" });
    try {
      const response = await getMeetings({ page: 1, limit: DEFAULT_MEETINGS_LIMIT });
      if (!response.success || !response.data) {
        showApiErrorToast(response);
        return;
      }
      set({
        calendarMeetings: mapMeetingsApiToListItems(response.data, getCampaignNameByIdMap()),
        calendarHydrated: true
      });
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      set({ isFetchingCalendar: false });
    }
  },

  applyFilters: async (draft) => {
    set({
      filters: draftToStoreFilters(draft),
      page: 1,
      listHydrated: false
    });
    await get().fetchMeetings({ page: 1, force: true });
  },

  invalidateCache: () => {
    set({ listHydrated: false, calendarHydrated: false, meetingStatsHydrated: false });
  },

  refetchCurrent: async () => {
    const { fetchMode, page } = get();
    get().invalidateCache();
    if (fetchMode === "calendar") {
      await get().fetchCalendarMeetings({ force: true });
    } else {
      await get().fetchMeetings({ page, force: true });
    }
  },

  createMeeting: async (payload, options) => {
    set({ isCreating: true });
    try {
      const response = await createMeetingApi(payload);
      if (!response.success || !response.data?.meeting) {
        showApiErrorToast(response);
        return null;
      }
      const meeting = mapMeetingApiToListItem(response.data.meeting, {
        campaignName: options?.campaignName
      });
      showApiSuccessToast(response.message || "Meeting created successfully.");
      get().invalidateCache();
      await Promise.all([get().refetchCurrent(), get().fetchMeetingStats({ force: true })]);
      return meeting;
    } catch (error) {
      showApiErrorToast(error);
      return null;
    } finally {
      set({ isCreating: false });
    }
  },

  updateMeeting: async (id, payload, options) => {
    set({ isUpdating: true });
    try {
      const response = await updateMeetingApi(id, payload);
      if (!response.success || !response.data?.meeting) {
        showApiErrorToast(response);
        return null;
      }
      const meeting = mapMeetingApiToListItem(response.data.meeting, {
        campaignName: options?.campaignName
      });
      showApiSuccessToast(response.message || "Meeting updated successfully.");
      set(replaceMeetingInLists(meeting));
      return meeting;
    } catch (error) {
      showApiErrorToast(error);
      return null;
    } finally {
      set({ isUpdating: false });
    }
  },

  cancelMeeting: async (id) => {
    set({ isCancelling: true });
    try {
      const response = await cancelMeetingApi(id);
      if (!response.success || !response.data?.meeting) {
        showApiErrorToast(response);
        return null;
      }
      const meeting = mapMeetingApiToListItem(response.data.meeting, {
        campaignName: getCampaignNameByIdMap().get(response.data.meeting.campaignId ?? "") ?? undefined
      });
      showApiSuccessToast(response.message || "Meeting cancelled successfully.");
      set(replaceMeetingInLists(meeting));
      void get().fetchMeetingStats({ force: true });
      return meeting;
    } catch (error) {
      showApiErrorToast(error);
      return null;
    } finally {
      set({ isCancelling: false });
    }
  }
}));
