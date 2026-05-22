import { describe, expect, it } from "vitest";
import {
  buildNotificationHref,
  buildNotificationsListQuery,
  mapNotificationToViewModel,
  notificationUiCategory
} from "@/lib/notifications";
import type { NotificationItem } from "@/types/notifications";

const baseItem: NotificationItem = {
  id: "n1",
  type: "reply_received",
  title: "New reply",
  body: "lead@example.com replied.",
  read: false,
  readAt: null,
  campaignId: "camp-1",
  campaignLeadId: "lead-1",
  meetingId: null,
  metadata: { leadEmail: "lead@example.com" },
  createdAt: "2026-05-19T14:30:00.000Z"
};

describe("notifications presentation", () => {
  it("maps API types to UI categories", () => {
    expect(notificationUiCategory("reply_received")).toBe("reply");
    expect(notificationUiCategory("meeting_booked")).toBe("meeting");
    expect(notificationUiCategory("outreach_finished")).toBe("campaign");
    expect(notificationUiCategory("email_failed")).toBe("system");
  });

  it("builds list query from tabs", () => {
    expect(buildNotificationsListQuery("unread", 2)).toEqual({
      page: 2,
      limit: 20,
      unread: true
    });
    expect(buildNotificationsListQuery("reply", 1)).toEqual({
      page: 1,
      limit: 20,
      type: "reply_received"
    });
    expect(buildNotificationsListQuery("all", 1)).toEqual({ page: 1, limit: 20 });
  });

  it("builds navigation href by related entity", () => {
    expect(buildNotificationHref({ ...baseItem, meetingId: "m1" })).toBe("/meetings");
    expect(buildNotificationHref(baseItem)).toBe("/campaigns/camp-1");
    expect(
      buildNotificationHref({
        ...baseItem,
        campaignId: null,
        campaignLeadId: "lead-1"
      })
    ).toBe("/leads");
  });

  it("maps API item to view model", () => {
    const view = mapNotificationToViewModel(baseItem);
    expect(view.type).toBe("reply");
    expect(view.href).toBe("/campaigns/camp-1");
    expect(view.at).not.toBe("—");
  });
});
