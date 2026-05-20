import type { AxiosError } from "axios";
import { describe, expect, it } from "vitest";
import { isAuthEndpoint, shouldRefreshAccessToken } from "../lib/authTokenErrors";

const createAxiosError = (status: number, url = "/leads"): AxiosError => {
  return {
    response: { status, data: { success: false, message: "Unauthorized" } },
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

  it("refreshes on 401 for non-auth endpoints", () => {
    const error = createAxiosError(401);
    expect(shouldRefreshAccessToken(error, error.config)).toBe(true);
  });

  it("does not refresh on non-401 errors", () => {
    const error = createAxiosError(500);
    expect(shouldRefreshAccessToken(error, error.config)).toBe(false);
  });
});
