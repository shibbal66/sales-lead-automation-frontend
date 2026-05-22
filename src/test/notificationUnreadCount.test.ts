import { describe, expect, it } from "vitest";
import { formatNotificationUnreadBadge } from "@/lib/notifications/unreadCount";

describe("formatNotificationUnreadBadge", () => {
  it("formats counts up to 99", () => {
    expect(formatNotificationUnreadBadge(0)).toBe("0");
    expect(formatNotificationUnreadBadge(5)).toBe("5");
    expect(formatNotificationUnreadBadge(99)).toBe("99");
  });

  it("caps display at 99+", () => {
    expect(formatNotificationUnreadBadge(100)).toBe("99+");
  });
});
