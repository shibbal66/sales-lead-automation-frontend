import { create } from "zustand";
import {
  buildNotificationsListQuery,
  mapNotificationsToViewModels,
  notificationApiTypeForTab,
  type NotificationListTab,
  type NotificationViewModel
} from "@/lib/notifications";
import {
  getNotifications,
  getNotificationUnreadCount,
  markAllNotificationsRead,
  markNotificationRead as markNotificationReadApi
} from "@/services/notifications/notificationsServices";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";

interface NotificationsStoreState {
  unreadCount: number;
  isFetchingUnreadCount: boolean;
  isMarkingAllRead: boolean;
  unreadCountHydrated: boolean;
  items: NotificationViewModel[];
  page: number;
  totalPages: number;
  total: number;
  isFetchingList: boolean;
  markingReadIds: Record<string, boolean>;
  fetchUnreadCount: (options?: { force?: boolean }) => Promise<void>;
  fetchNotifications: (options: { tab: NotificationListTab; page?: number }) => Promise<void>;
  markAllRead: () => Promise<boolean>;
  markNotificationRead: (id: string) => Promise<boolean>;
  setUnreadCount: (count: number) => void;
  invalidateUnreadCount: () => void;
}

export const useNotificationsStore = create<NotificationsStoreState>((set, get) => ({
  unreadCount: 0,
  isFetchingUnreadCount: false,
  isMarkingAllRead: false,
  unreadCountHydrated: false,
  items: [],
  page: 1,
  totalPages: 1,
  total: 0,
  isFetchingList: false,
  markingReadIds: {},

  fetchUnreadCount: async (options = {}) => {
    if (!options.force && get().unreadCountHydrated) {
      return;
    }

    set({ isFetchingUnreadCount: true });
    try {
      const response = await getNotificationUnreadCount();
      if (!response.success || response.data === undefined) {
        showApiErrorToast(response);
        return;
      }
      set({
        unreadCount: response.data.unreadCount,
        unreadCountHydrated: true
      });
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      set({ isFetchingUnreadCount: false });
    }
  },

  fetchNotifications: async ({ tab, page = 1 }) => {
    set({ isFetchingList: true });
    try {
      const response = await getNotifications(buildNotificationsListQuery(tab, page));
      if (!response.success || !response.data) {
        showApiErrorToast(response);
        return;
      }

      const { items, pagination } = response.data;
      const expectedType = notificationApiTypeForTab(tab);
      let viewItems = mapNotificationsToViewModels(items);
      if (expectedType) {
        viewItems = viewItems.filter((item) => item.apiType === expectedType);
      }
      set({
        items: viewItems,
        page: pagination.page,
        totalPages: Math.max(1, pagination.totalPages),
        total: pagination.total
      });
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      set({ isFetchingList: false });
    }
  },

  markAllRead: async () => {
    if (get().isMarkingAllRead) return false;

    set({ isMarkingAllRead: true });
    try {
      const response = await markAllNotificationsRead();
      if (!response.success || response.data === undefined) {
        showApiErrorToast(response);
        return false;
      }
      set({
        unreadCount: response.data.unreadCount,
        unreadCountHydrated: true,
        items: get().items.map((item) => ({ ...item, read: true }))
      });
      showApiSuccessToast(response.message || "All notifications marked as read.");
      return true;
    } catch (error) {
      showApiErrorToast(error);
      return false;
    } finally {
      set({ isMarkingAllRead: false });
    }
  },

  setUnreadCount: (count) => {
    set({ unreadCount: Math.max(0, count), unreadCountHydrated: true });
  },

  invalidateUnreadCount: () => {
    set({ unreadCountHydrated: false });
  },

  markNotificationRead: async (id) => {
    const item = get().items.find((entry) => entry.id === id);
    if (!item || item.read) return true;
    if (get().markingReadIds[id]) return false;

    set((state) => ({
      markingReadIds: { ...state.markingReadIds, [id]: true }
    }));

    try {
      const response = await markNotificationReadApi(id);
      if (!response.success) {
        showApiErrorToast(response);
        return false;
      }

      set((state) => {
        const wasUnread = state.items.some((entry) => entry.id === id && !entry.read);
        const { [id]: _removed, ...markingReadIds } = state.markingReadIds;
        return {
          markingReadIds,
          items: state.items.map((entry) =>
            entry.id === id ? { ...entry, read: true } : entry
          ),
          unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
        };
      });

      void get().fetchUnreadCount({ force: true });
      return true;
    } catch (error) {
      showApiErrorToast(error);
      return false;
    } finally {
      set((state) => {
        const { [id]: _removed, ...markingReadIds } = state.markingReadIds;
        return { markingReadIds };
      });
    }
  }
}));
