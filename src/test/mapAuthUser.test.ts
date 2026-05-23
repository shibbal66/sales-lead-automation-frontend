import { describe, expect, it } from "vitest";
import { avatarSourcesMatch, mapApiUserToAuthUser, normalizeAvatarSource } from "@/lib/mapAuthUser";
import type { ApiUserProfile } from "@/types/user";

const apiUser: ApiUserProfile = {
  id: "1669e2b0-5d0f-4586-a0c6-ed5595a5d51b",
  email: "axadishaq@gmail.com",
  isVerified: true,
  createdAt: "2026-05-18T12:55:56.558508+00:00",
  name: "Test",
  profilePic:
    "https://mpddrowbaynfwjjkpjxf.supabase.co/storage/v1/object/public/lead_generation_bucket/1669e2b0-5d0f-4586-a0c6-ed5595a5d51b/avatar.png",
  address: "string",
  contact: "+920000001",
  timezone: "America/New_York",
  notificationsEnabled: false,
  role: "user"
};

describe("mapApiUserToAuthUser", () => {
  it("maps profilePic to avatarUrl", () => {
    const user = mapApiUserToAuthUser(apiUser);
    expect(user.avatarUrl).toBe(apiUser.profilePic);
    expect(user.notificationsEnabled).toBe(false);
  });

  it("cache-busts when bustAvatar is true", () => {
    const user = mapApiUserToAuthUser(apiUser, true);
    expect(user.avatarUrl).toMatch(/[?&]v=\d+$/);
    expect(user.avatarUrl).not.toBe(apiUser.profilePic);
  });

  it("returns no avatarUrl when profilePic is empty", () => {
    const user = mapApiUserToAuthUser({ ...apiUser, profilePic: null });
    expect(user.avatarUrl).toBeUndefined();
  });

  it("treats cache-busted URLs as the same source", () => {
    const busted = `${apiUser.profilePic}?v=1234567890`;
    expect(avatarSourcesMatch(apiUser.profilePic, busted)).toBe(true);
    expect(normalizeAvatarSource(busted)).toBe(apiUser.profilePic);
  });
});
