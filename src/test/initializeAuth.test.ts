import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AuthUser } from "@/core/types/user.types";
import {
  clearAuthStorage,
  getAuthToken,
  getRefreshToken,
  setAuthToken,
  setRefreshToken,
  setStoredUser
} from "@/utils/authStorage";

const mockRefreshSession = vi.fn();
const mockGetCurrentUser = vi.fn();

vi.mock("@/lib/refreshSession", () => ({
  refreshSession: () => mockRefreshSession()
}));

vi.mock("@/services/user/userServices", () => ({
  getCurrentUser: () => mockGetCurrentUser()
}));

vi.mock("@/lib/apiToast", () => ({
  showApiErrorToast: vi.fn(),
  showApiSuccessToast: vi.fn()
}));

vi.mock("@/services/fcm/fcmPush", () => ({
  syncFcmPushRegistration: vi.fn(),
  unregisterFcmPushToken: vi.fn()
}));

const testUser: AuthUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test User"
};

describe("initializeAuth", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    clearAuthStorage();
    localStorage.clear();
    sessionStorage.clear();
    vi.resetModules();
  });

  it("clears loading when no stored session exists", async () => {
    const { useAuthStore } = await import("@/store/auth/authStore");
    await useAuthStore.getState().initializeAuth();

    const state = useAuthStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(mockRefreshSession).not.toHaveBeenCalled();
  });

  it("refreshes access token before fetching the current user", async () => {
    setStoredUser(testUser);
    setAuthToken("old-access");
    setRefreshToken("refresh-token");
    mockRefreshSession.mockResolvedValue("new-access");
    mockGetCurrentUser.mockResolvedValue({
      success: true,
      data: { user: { id: testUser.id, email: testUser.email, name: testUser.name } }
    });

    const { useAuthStore } = await import("@/store/auth/authStore");
    await useAuthStore.getState().initializeAuth();

    expect(mockRefreshSession).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().token).toBe("new-access");
    expect(useAuthStore.getState().isLoading).toBe(false);
    expect(useAuthStore.getState().isAuthenticated).toBe(true);
  });

  it("clears session when refresh fails", async () => {
    setStoredUser(testUser);
    setAuthToken("old-access");
    setRefreshToken("expired-refresh");
    mockRefreshSession.mockRejectedValue(new Error("Invalid refresh token"));

    const { useAuthStore } = await import("@/store/auth/authStore");
    await useAuthStore.getState().initializeAuth();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(getAuthToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });
});
