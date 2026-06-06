import { describe, expect, it } from "vitest";
import { AxiosError } from "axios";
import {
  getApiErrorCode,
  getPlanLimitDialogTitle,
  isPlanLimitError,
  PLAN_LIMIT_CAMPAIGNS
} from "@/lib/planLimit";

describe("planLimit", () => {
  it("detects plan limit errors by code prefix", () => {
    expect(
      isPlanLimitError({
        success: false,
        message: "Campaign limit reached (15 on Advanced Plan plan). Upgrade to add more campaigns.",
        code: PLAN_LIMIT_CAMPAIGNS
      })
    ).toBe(true);
    expect(isPlanLimitError({ success: false, message: "Validation failed" })).toBe(false);
  });

  it("detects plan limit errors from 403 Axios responses", () => {
    const error = new AxiosError(
      "Request failed with status code 403",
      "403",
      undefined,
      undefined,
      {
        status: 403,
        statusText: "Forbidden",
        data: {
          success: false,
          message: "Campaign limit reached (15 on Advanced Plan plan). Upgrade to add more campaigns.",
          code: PLAN_LIMIT_CAMPAIGNS
        },
        headers: {},
        config: {} as never
      }
    );

    expect(isPlanLimitError(error)).toBe(true);
    expect(getApiErrorCode(error)).toBe(PLAN_LIMIT_CAMPAIGNS);
  });

  it("reads error code from API-shaped payloads", () => {
    expect(getApiErrorCode({ code: PLAN_LIMIT_CAMPAIGNS })).toBe(PLAN_LIMIT_CAMPAIGNS);
  });

  it("uses a campaign-specific dialog title", () => {
    expect(getPlanLimitDialogTitle(PLAN_LIMIT_CAMPAIGNS)).toBe("Campaign limit reached");
    expect(getPlanLimitDialogTitle("PLAN_LIMIT_LEADS")).toBe("Plan limit reached");
  });
});
