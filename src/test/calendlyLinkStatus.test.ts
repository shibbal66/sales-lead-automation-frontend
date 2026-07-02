import { describe, expect, it } from "vitest";
import { formatCalendlyCallbackError } from "@/lib/calendlyAuth";
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
  });

  it("falls back when message is missing", () => {
    expect(formatCalendlyCallbackError(null)).toBe("Could not connect Calendly account.");
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
