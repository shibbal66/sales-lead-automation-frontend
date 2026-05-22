import { describe, expect, it } from "vitest";
import {
  campaignChartToLineChartData,
  hasCampaignChartActivity
} from "@/lib/analytics/campaignChart";
import type { AnalyticsCampaignChartData } from "@/types/analytics";

describe("campaignChartToLineChartData", () => {
  it("aligns sparse campaign series to full date_keys with zero fill", () => {
    const data: AnalyticsCampaignChartData = {
      period: "last_90_days",
      from: "2026-02-21",
      to: "2026-05-21",
      date_keys: ["2026-04-18", "2026-04-19", "2026-04-20", "2026-05-18", "2026-05-19"],
      campaigns: [
        {
          campaign_id: "8342fcc0-562f-4e3f-91ad-9e1ba9c9bb35",
          campaign_name: "Q2 Outreach",
          total_replies: 14,
          series: [
            { date: "2026-04-19", replies: 0 },
            { date: "2026-04-20", replies: 2 },
            { date: "2026-05-19", replies: 1 }
          ]
        }
      ]
    };

    const { points, campaigns } = campaignChartToLineChartData(data);

    expect(campaigns).toHaveLength(1);
    expect(campaigns[0]?.totalReplies).toBe(14);
    expect(points).toHaveLength(5);

    const byDate = Object.fromEntries(points.map((p) => [p.date, p["Q2 Outreach"]]));
    expect(byDate["2026-04-18"]).toBe(0);
    expect(byDate["2026-04-19"]).toBe(0);
    expect(byDate["2026-04-20"]).toBe(2);
    expect(byDate["2026-05-18"]).toBe(0);
    expect(byDate["2026-05-19"]).toBe(1);
  });

  it("treats total_replies > 0 as chart activity", () => {
    expect(
      hasCampaignChartActivity({
        period: "last_90_days",
        from: "2026-02-21",
        to: "2026-05-21",
        date_keys: ["2026-05-19"],
        campaigns: [
          {
            campaign_id: "1",
            campaign_name: "Q2 Outreach",
            total_replies: 14,
            series: [{ date: "2026-05-19", replies: 1 }]
          }
        ]
      })
    ).toBe(true);
  });
});
