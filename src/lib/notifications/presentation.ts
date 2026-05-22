import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CalendarCheck,
  Megaphone,
  MessageSquare
} from "lucide-react";
import { formatRelativeDate } from "@/lib/dateFormatting";
import type {
  GetNotificationsQuery,
  NotificationApiType,
  NotificationItem
} from "@/types/notifications";

export type NotificationUiCategory = "reply" | "meeting" | "campaign" | "system";

export type NotificationListTab =
  | "all"
  | "unread"
  | "reply"
  | "meeting"
  | "campaign"
  | "system";

export const NOTIFICATION_LIST_TABS: { id: NotificationListTab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "reply", label: "Replies" },
  { id: "meeting", label: "Meetings" },
  { id: "campaign", label: "Campaigns" },
  { id: "system", label: "System" }
];

export const DEFAULT_NOTIFICATIONS_PAGE_SIZE = 20;

const API_TYPE_BY_TAB: Partial<Record<NotificationListTab, NotificationApiType>> = {
  reply: "reply_received",
  meeting: "meeting_booked",
  campaign: "outreach_finished",
  system: "email_failed"
};

const UI_CATEGORY_BY_API_TYPE: Record<NotificationApiType, NotificationUiCategory> = {
  reply_received: "reply",
  meeting_booked: "meeting",
  outreach_finished: "campaign",
  email_failed: "system"
};

export const notificationIconByCategory: Record<
  NotificationUiCategory,
  { Icon: LucideIcon; tone: string }
> = {
  reply: { Icon: MessageSquare, tone: "bg-primary/15 text-primary" },
  meeting: { Icon: CalendarCheck, tone: "bg-success/15 text-success" },
  campaign: { Icon: Megaphone, tone: "bg-info/15 text-info" },
  system: { Icon: AlertTriangle, tone: "bg-warning/15 text-warning" }
};

export interface NotificationViewModel {
  id: string;
  type: NotificationUiCategory;
  apiType: NotificationApiType;
  title: string;
  body: string;
  at: string;
  read: boolean;
  href?: string;
}

export function notificationUiCategory(apiType: NotificationApiType): NotificationUiCategory {
  return UI_CATEGORY_BY_API_TYPE[apiType];
}

export function notificationApiTypeForTab(
  tab: NotificationListTab
): NotificationApiType | undefined {
  return API_TYPE_BY_TAB[tab];
}

export function buildNotificationsListQuery(
  tab: NotificationListTab,
  page: number,
  limit = DEFAULT_NOTIFICATIONS_PAGE_SIZE
): GetNotificationsQuery {
  const query: GetNotificationsQuery = { page, limit };

  if (tab === "unread") {
    query.unread = true;
  } else {
    const apiType = API_TYPE_BY_TAB[tab];
    if (apiType) {
      query.type = apiType;
    }
  }

  return query;
}

export function buildNotificationHref(item: NotificationItem): string | undefined {
  if (item.meetingId) {
    return "/meetings";
  }
  if (item.campaignId) {
    return `/campaigns/${item.campaignId}`;
  }
  if (item.campaignLeadId || item.type === "reply_received" || item.type === "email_failed") {
    return "/leads";
  }
  return undefined;
}

export function mapNotificationToViewModel(item: NotificationItem): NotificationViewModel {
  return {
    id: item.id,
    type: notificationUiCategory(item.type),
    apiType: item.type,
    title: item.title,
    body: item.body,
    at: formatRelativeDate(item.createdAt),
    read: item.read,
    href: buildNotificationHref(item)
  };
}

export function mapNotificationsToViewModels(items: NotificationItem[]): NotificationViewModel[] {
  return items.map(mapNotificationToViewModel);
}
