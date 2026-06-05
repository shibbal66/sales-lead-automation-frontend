import { describe, expect, it } from "vitest";
import { buildAnalyticsOverviewKpis } from "@/lib/analytics/overview";
import type { AnalyticsOverviewData } from "@/types/analytics";

const baseOverview: AnalyticsOverviewData = {
  period: "last_30_days",
  from: "2026-04-19",
  to: "2026-05-19",
  emails_sent: { count: 120, vs_previous_period_percent: 15.5 },
  open_rate: { percent: null, vs_previous_period_points: null, tracked: false },
  reply_rate: { percent: 18.3, vs_previous_period_points: 2.1 },
  meetings_booked: { count: 5, vs_previous_period: 2 },
  meta: {
    open_rate_note: "Open tracking is not stored yet.",
    previous_period: { from: "2026-03-20", to: "2026-04-18" }
  }
};

describe("buildAnalyticsOverviewKpis", () => {
  it("formats count, rate, and delta metrics", () => {
    const kpis = buildAnalyticsOverviewKpis(baseOverview);

    expect(kpis).toHaveLength(4);
    expect(kpis[0]?.value).toBe("120");
    expect(kpis[0]?.delta?.value).toContain("+15.5%");
    expect(kpis[1]?.value).toBe("0%");
    expect(kpis[1]?.hint).toBe("Open tracking is not stored yet.");
    expect(kpis[1]?.delta).toBeUndefined();
    expect(kpis[2]?.value).toBe("18.3%");
    expect(kpis[3]?.value).toBe("5");
    expect(kpis[3]?.delta?.value).toContain("+2");
  });

  it("shows open rate delta when tracked", () => {
    const kpis = buildAnalyticsOverviewKpis({
      ...baseOverview,
      open_rate: { percent: 62.8, vs_previous_period_points: 1.4, tracked: true }
    });

    expect(kpis[1]?.value).toBe("62.8%");
    expect(kpis[1]?.delta?.value).toContain("+1.4 pts");
  });
});
