import type { Pagination } from "@/types/pagination";

export type NotificationApiType =
  | "reply_received"
  | "email_failed"
  | "meeting_booked"
  | "outreach_finished";

export interface NotificationMetadata {
  leadEmail?: string;
  message?: string;
  startAt?: string;
  endAt?: string;
  attendeeEmail?: string;
  sent?: number;
  sendFailed?: number;
  sendSkipped?: number;
  templatesGenerated?: number;
  templateFailures?: number;
  dailyLimitReached?: boolean;
  [key: string]: unknown;
}

export interface NotificationItem {
  id: string;
  type: NotificationApiType;
  title: string;
  body: string;
  read: boolean;
  readAt: string | null;
  campaignId: string | null;
  campaignLeadId: string | null;
  meetingId: string | null;
  metadata: NotificationMetadata | null;
  createdAt: string;
}

export interface GetNotificationsQuery {
  page?: number;
  limit?: number;
  unread?: boolean;
  type?: NotificationApiType;
}

export interface GetNotificationsResponse {
  success: boolean;
  message?: string;
  data?: {
    items: NotificationItem[];
    pagination: Pagination;
  };
}

export interface NotificationUnreadCountData {
  unreadCount: number;
}

export interface GetNotificationUnreadCountResponse {
  success: boolean;
  message?: string;
  data?: NotificationUnreadCountData;
}

export interface MarkAllNotificationsReadResponse {
  success: boolean;
  message?: string;
  data?: NotificationUnreadCountData;
}

export interface MarkNotificationReadResponse {
  success: boolean;
  message?: string;
  data?: string;
}
