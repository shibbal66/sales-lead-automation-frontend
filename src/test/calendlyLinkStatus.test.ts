import { describe, expect, it } from "vitest";
import {
  buildCalendlySettingsReturnPath,
  formatCalendlyCallbackError,
  formatCalendlyCallbackSuccess,
  getCalendlyApiCallbackUrl,
  parseCalendlyOAuthReturn,
  resolveCalendlyIncomingCallback
} from "@/lib/calendlyAuth";
import {
  formatCalendlyLinkDetail,
  parseCalendlyConnectAuthUrl,
  parseCalendlyLinkStatus
} from "@/lib/calendlyLinkStatus";

describe("formatCalendlyCallbackError", () => {
  it("maps known backend error codes", () => {
    expect(formatCalendlyCallbackError("connect_failed")).toBe(
      "Could not connect your Calendly account. Please try again."
    );
    expect(formatCalendlyCallbackError("access_denied")).toBe(
      "Calendly authorization was cancelled."
    );
  });

  it("falls back when message is missing", () => {
    expect(formatCalendlyCallbackError(null)).toBe("Could not connect Calendly account.");
  });
});

describe("parseCalendlyOAuthReturn", () => {
  it("reads connected result from API redirect query params", () => {
    const params = new URLSearchParams({
      tab: "social",
      calendly: "connected",
      message: "Calendly linked successfully"
    });

    expect(parseCalendlyOAuthReturn(params)).toEqual({
      status: "connected",
      message: "Calendly linked successfully"
    });
  });

  it("treats unknown calendly values as errors", () => {
    const params = new URLSearchParams({
      calendly: "failed",
      message: "connect_failed"
    });

    expect(parseCalendlyOAuthReturn(params)).toEqual({
      status: "error",
      message: "connect_failed"
    });
  });
});

describe("resolveCalendlyIncomingCallback", () => {
  it("forwards code and state to the API", () => {
    const params = new URLSearchParams({ code: "abc", state: "jwt" });
    expect(resolveCalendlyIncomingCallback(params)).toEqual({
      type: "forward-api",
      searchParams: params
    });
  });

  it("returns to settings when Calendly denies access", () => {
    const params = new URLSearchParams({ error: "access_denied" });
    expect(resolveCalendlyIncomingCallback(params)).toEqual({
      type: "return-settings",
      returnInfo: { status: "error", message: "access_denied" }
    });
  });
});

describe("buildCalendlySettingsReturnPath", () => {
  it("builds the settings URL the API should redirect to", () => {
    expect(buildCalendlySettingsReturnPath("error", "connect_failed")).toBe(
      "/settings?tab=social&calendly=error&message=connect_failed"
    );
  });
});

describe("formatCalendlyCallbackSuccess", () => {
  it("uses API message when provided", () => {
    expect(formatCalendlyCallbackSuccess("Calendly linked successfully")).toBe(
      "Calendly linked successfully"
    );
  });
});

describe("getCalendlyApiCallbackUrl", () => {
  it("forwards OAuth query params to the API callback path", () => {
    const params = new URLSearchParams({
      code: "abc123",
      state: "jwt-state"
    });

    expect(getCalendlyApiCallbackUrl(params)).toBe(
      `${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "")}/auth/calendly/callback?code=abc123&state=jwt-state`
    );
  });
});

describe("parseCalendlyConnectAuthUrl", () => {
  it("reads authUrl from the connect API response", () => {
    const authUrl =
      "https://auth.calendly.com/oauth/authorize?client_id=test&response_type=code";

    expect(
      parseCalendlyConnectAuthUrl({
        success: true,
        data: { authUrl }
      })
    ).toBe(authUrl);
  });
});

describe("calendlyLinkStatus", () => {
  it("parses disconnected status from the API response", () => {
    expect(
      parseCalendlyLinkStatus({
        success: true,
        data: {
          connected: false,
          email: null,
          schedulingUrl: null,
          webhookActive: false,
          connectedAt: null
        }
      })
    ).toEqual({
      connected: false,
      email: null,
      schedulingUrl: null,
      webhookActive: false,
      connectedAt: null
    });
  });

  it("accepts snake_case fields from the API response", () => {
    expect(
      parseCalendlyLinkStatus({
        success: true,
        data: {
          connected: true,
          email: "user@example.com",
          scheduling_url: "https://calendly.com/user",
          webhook_active: true,
          connected_at: "2026-06-08T15:57:58.073888+00:00"
        } as never
      })
    ).toEqual({
      connected: true,
      email: "user@example.com",
      schedulingUrl: "https://calendly.com/user",
      webhookActive: true,
      connectedAt: "2026-06-08T15:57:58.073888+00:00"
    });
  });

  it("formats connected status details", () => {
    const status = parseCalendlyLinkStatus({
      success: true,
      data: {
        connected: true,
        email: "user@example.com",
        schedulingUrl: "https://calendly.com/user",
        webhookActive: true,
        connectedAt: "2026-06-08T15:57:58.073888+00:00"
      }
    });

    expect(formatCalendlyLinkDetail(status)).toBe(
      "user@example.com · https://calendly.com/user · Webhook active"
    );
  });
});
