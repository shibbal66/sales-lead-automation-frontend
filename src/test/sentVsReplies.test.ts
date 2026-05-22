import { describe, expect, it } from "vitest";
import { periodToSentVsRepliesWeeks } from "@/lib/analytics/sentVsReplies";

describe("periodToSentVsRepliesWeeks", () => {
  it("maps preset periods to approximate week counts", () => {
    expect(periodToSentVsRepliesWeeks("last_7_days")).toBe(1);
    expect(periodToSentVsRepliesWeeks("last_30_days")).toBe(4);
    expect(periodToSentVsRepliesWeeks("last_month")).toBe(4);
    expect(periodToSentVsRepliesWeeks("last_90_days")).toBe(13);
  });

  it("derives weeks from custom date range", () => {
    expect(periodToSentVsRepliesWeeks("custom", "2026-05-01", "2026-05-21")).toBe(3);
    expect(periodToSentVsRepliesWeeks("custom", "2026-05-01", "2026-05-07")).toBe(1);
  });

  it("falls back when custom range is invalid", () => {
    expect(periodToSentVsRepliesWeeks("custom", "", "")).toBe(4);
    expect(periodToSentVsRepliesWeeks("custom", "2026-05-10", "")).toBe(4);
  });
});
