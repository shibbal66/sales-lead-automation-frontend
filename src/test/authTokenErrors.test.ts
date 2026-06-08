import type { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import {
  isAuthEndpoint,
  isTokenExpiredError,
  isTokenExpiredPayload,
  shouldRefreshAccessToken,
  TOKEN_EXPIRED_CODE,
} from "../lib/authTokenErrors";

const createAxiosError = (
  status: number,
  url = "/leads",
  code?: string
): AxiosError => {
  return {
    response: {
      status,
      data: { success: false, message: "Unauthorized", ...(code ? { code } : {}) },
    },
    config: { url },
  } as AxiosError;
};

describe("authTokenErrors", () => {
  it("skips refresh for auth endpoints", () => {
    expect(isAuthEndpoint("/auth/login")).toBe(true);
    expect(shouldRefreshAccessToken(createAxiosError(401, "/auth/login"), { url: "/auth/login" })).toBe(
      false
    );
  });

  it("refreshes on 401 with TOKEN_EXPIRED for non-auth endpoints", () => {
    const error = createAxiosError(401, "/leads", TOKEN_EXPIRED_CODE);
    expect(isTokenExpiredError(error)).toBe(true);
    expect(shouldRefreshAccessToken(error, error.config)).toBe(true);
  });

  it("refreshes on HTTP 200 body with TOKEN_EXPIRED for non-auth endpoints", () => {
    const error = createAxiosError(200, "/leads", TOKEN_EXPIRED_CODE);
    expect(isTokenExpiredPayload(error.response?.data)).toBe(true);
    expect(isTokenExpiredError(error)).toBe(true);
    expect(shouldRefreshAccessToken(error, error.config)).toBe(true);
  });

  it("does not refresh on 401 without TOKEN_EXPIRED", () => {
    const error = createAxiosError(401);
    expect(isTokenExpiredError(error)).toBe(false);
    expect(shouldRefreshAccessToken(error, error.config)).toBe(false);
  });

  it("does not refresh on non-token-expired errors", () => {
    const error = createAxiosError(500, "/leads", TOKEN_EXPIRED_CODE);
    expect(shouldRefreshAccessToken(error, error.config)).toBe(false);
  });

  it("does not refresh when skipAuthRefresh is set", () => {
    const error = createAxiosError(401, "/notifications/push/register", TOKEN_EXPIRED_CODE);
    expect(
      shouldRefreshAccessToken(error, { url: "/notifications/push/register", _skipAuthRefresh: true })
    ).toBe(false);
  });
});
