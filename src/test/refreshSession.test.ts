import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { setRefreshToken, clearAuthStorage } from "@/utils/authStorage";

vi.mock("axios", () => ({
  default: {
    post: vi.fn()
  }
}));

describe("refreshSession", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearAuthStorage();
    localStorage.clear();
    sessionStorage.clear();
  });

  it("stores new tokens and returns the access token on success", async () => {
    setRefreshToken("old-refresh");
    const postMock = vi.mocked(axios.post);
    postMock.mockResolvedValue({
      data: {
        success: true,
        data: {
          accessToken: "new-access",
          refreshToken: "new-refresh"
        }
      }
    });

    const { refreshSession } = await import("@/lib/refreshSession");
    const accessToken = await refreshSession();

    expect(accessToken).toBe("new-access");
    expect(postMock).toHaveBeenCalledOnce();
    const { getAuthToken, getRefreshToken } = await import("@/utils/authStorage");
    expect(getAuthToken()).toBe("new-access");
    expect(getRefreshToken()).toBe("new-refresh");
  });

  it("throws when no refresh token is available", async () => {
    const { refreshSession } = await import("@/lib/refreshSession");
    await expect(refreshSession()).rejects.toThrow("No refresh token available");
  });

  it("throws when the API returns an invalid payload", async () => {
    setRefreshToken("old-refresh");
    vi.mocked(axios.post).mockResolvedValue({
      data: { success: false, message: "Refresh token expired" }
    });

    const { refreshSession } = await import("@/lib/refreshSession");
    await expect(refreshSession()).rejects.toThrow("Refresh token expired");
  });
});
