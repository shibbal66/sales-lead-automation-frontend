import apiInvoker from "@/lib/apiInvoker";
import { END_POINT } from "@/lib/apiURL";
import type {
  GetNotificationsQuery,
  GetNotificationsResponse,
  GetNotificationUnreadCountResponse,
  MarkAllNotificationsReadResponse,
  MarkNotificationReadResponse
} from "@/types/notifications";

export function getNotifications(query: GetNotificationsQuery = {}) {
  const params: Record<string, string | number | boolean> = {};
  if (query.page !== undefined) params.page = query.page;
  if (query.limit !== undefined) params.limit = query.limit;
  if (query.unread !== undefined) params.unread = query.unread;
  if (query.type !== undefined) params.type = query.type;

  return apiInvoker<GetNotificationsResponse>(
    END_POINT.notifications.list,
    "GET",
    undefined,
    params
  );
}

export function getNotificationUnreadCount() {
  return apiInvoker<GetNotificationUnreadCountResponse>(
    END_POINT.notifications.unreadCount,
    "GET"
  );
}

export function markAllNotificationsRead() {
  return apiInvoker<MarkAllNotificationsReadResponse>(
    END_POINT.notifications.readAll,
    "POST"
  );
}

export function markNotificationRead(id: string) {
  return apiInvoker<MarkNotificationReadResponse>(
    END_POINT.notifications.readById(id),
    "PATCH"
  );
}
