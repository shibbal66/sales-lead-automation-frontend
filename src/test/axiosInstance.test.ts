import axios, { AxiosError } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TOKEN_EXPIRED_CODE } from "@/lib/authTokenErrors";

const refreshSessionMock = vi.fn();
const unregisterFcmPushTokenMock = vi.fn();
const getAuthTokenMock = vi.fn();
const getRefreshTokenMock = vi.fn();
const clearAuthStorageMock = vi.fn();
const setPendingAuthErrorMock = vi.fn();

vi.mock("@/lib/refreshSession", () => ({
  refreshSession: () => refreshSessionMock()
}));

vi.mock("@/services/fcm/fcmPush", () => ({
  unregisterFcmPushToken: (options?: { skipAuthRefresh?: boolean }) =>
    unregisterFcmPushTokenMock(options)
}));

vi.mock("@/utils/authStorage", () => ({
  getAuthToken: () => getAuthTokenMock(),
  getRefreshToken: () => getRefreshTokenMock(),
  clearAuthStorage: () => clearAuthStorageMock(),
  setPendingAuthError: (message: string) => setPendingAuthErrorMock(message)
}));

vi.mock("@/lib/apiToast", () => ({
  getApiErrorMessage: (error: unknown) =>
    error instanceof Error ? error.message : "Session expired",
  setSuppressApiErrorToasts: vi.fn()
}));

describe("axiosInstance TOKEN_EXPIRED handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    getAuthTokenMock.mockReturnValue("expired-access");
    getRefreshTokenMock.mockReturnValue("valid-refresh");
    refreshSessionMock.mockReset();
    unregisterFcmPushTokenMock.mockResolvedValue(undefined);
    vi.stubGlobal("location", { href: "" });
  });

  it("refreshes and retries billing subscription on TOKEN_EXPIRED", async () => {
    refreshSessionMock.mockResolvedValue("new-access");

    const adapter = vi
      .fn()
      .mockRejectedValueOnce({
        response: {
          status: 401,
          data: {
            success: false,
            message: "Access token expired. Please login again.",
            code: TOKEN_EXPIRED_CODE
          }
        },
        config: { url: "/billing/subscription", headers: {} }
      } as AxiosError)
      .mockResolvedValueOnce({
        data: { success: true, data: { subscription: { id: "sub_1" } } },
        status: 200,
        config: { url: "/billing/subscription" },
        headers: {},
        statusText: "OK"
      });

    const { default: axiosInstance } = await import("@/lib/axiosInstance");
    axiosInstance.defaults.adapter = adapter as typeof axiosInstance.defaults.adapter;

    const response = await axiosInstance.get("/billing/subscription");

    expect(refreshSessionMock).toHaveBeenCalledOnce();
    expect(adapter).toHaveBeenCalledTimes(2);
    expect(response.data.success).toBe(true);
    expect(unregisterFcmPushTokenMock).not.toHaveBeenCalled();
  });

  it("forces logout when refresh token is missing", async () => {
    getRefreshTokenMock.mockReturnValue(null);

    const adapter = vi.fn().mockRejectedValue({
      response: {
        status: 401,
        data: {
          success: false,
          message: "Access token expired. Please login again.",
          code: TOKEN_EXPIRED_CODE
        }
      },
      config: { url: "/billing/subscription", headers: {} }
    } as AxiosError);

    const { default: axiosInstance } = await import("@/lib/axiosInstance");
    axiosInstance.defaults.adapter = adapter as typeof axiosInstance.defaults.adapter;

    await expect(axiosInstance.get("/billing/subscription")).rejects.toBeDefined();

    expect(refreshSessionMock).not.toHaveBeenCalled();
    expect(unregisterFcmPushTokenMock).toHaveBeenCalledWith({ skipAuthRefresh: true });
    expect(clearAuthStorageMock).toHaveBeenCalledOnce();
    expect(window.location.href).toBe("/login");
  });

  it("forces logout after refresh failure without deadlocking on push unregister", async () => {
    refreshSessionMock.mockRejectedValue(new Error("Refresh token expired"));

    const adapter = vi.fn().mockRejectedValue({
      response: {
        status: 401,
        data: {
          success: false,
          message: "Access token expired. Please login again.",
          code: TOKEN_EXPIRED_CODE
        }
      },
      config: { url: "/billing/subscription", headers: {} }
    } as AxiosError);

    const { default: axiosInstance } = await import("@/lib/axiosInstance");
    axiosInstance.defaults.adapter = adapter as typeof axiosInstance.defaults.adapter;

    await expect(axiosInstance.get("/billing/subscription")).rejects.toThrow("Refresh token expired");

    expect(refreshSessionMock).toHaveBeenCalledOnce();
    expect(unregisterFcmPushTokenMock).toHaveBeenCalledWith({ skipAuthRefresh: true });
    expect(clearAuthStorageMock).toHaveBeenCalledOnce();
    expect(window.location.href).toBe("/login");
  });
});
