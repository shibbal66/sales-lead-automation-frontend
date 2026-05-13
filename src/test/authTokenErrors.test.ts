import type { AxiosError } from "axios";
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  EXPIRED_TOKEN_RESPONSE_MESSAGE,
  canAttemptTokenRefresh,
  isAuthEndpoint,
  isExpiredTokenError,
  isExpiredTokenResponse,
} from "../lib/authTokenErrors";

vi.mock("@/utils/authSorage", () => ({
  getAuthToken: vi.fn(() => "access-token"),
  getRefreshToken: vi.fn(() => "refresh-token"),
}));

const createAxiosError = (status: number, data: unknown): AxiosError => {
  return {
    response: { status, data },
    config: { url: "/leads" },
  } as AxiosError;
};

describe("authTokenErrors", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("matches the backend expired-token envelope", () => {
    const error = createAxiosError(500, {
      success: false,
      message: EXPIRED_TOKEN_RESPONSE_MESSAGE,
    });

    expect(isExpiredTokenResponse(error)).toBe(true);
    expect(isExpiredTokenError(error, error.config)).toBe(true);
  });

  it("does not treat other failure envelopes as expired-token responses", () => {
    const error = createAxiosError(500, {
      success: false,
      message: "Validation failed",
    });

    expect(isExpiredTokenResponse(error)).toBe(false);
    expect(isExpiredTokenError(error, error.config)).toBe(true);
  });

  it("skips refresh for auth endpoints", () => {
    expect(isAuthEndpoint("/auth/login")).toBe(true);
    expect(canAttemptTokenRefresh({ url: "/auth/login" } as AxiosError["config"])).toBe(false);
  });

  it("treats 401 responses as refreshable auth failures", () => {
    const error = createAxiosError(401, { success: false, message: "Unauthorized" });

    expect(isExpiredTokenError(error, error.config)).toBe(true);
  });
});
