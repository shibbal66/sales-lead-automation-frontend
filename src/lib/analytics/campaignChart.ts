import { format, parseISO } from "date-fns";
import type { AnalyticsCampaignChartData } from "@/types/analytics";

export const ANALYTICS_CAMPAIGN_CHART_COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--brand-deep))",
  "hsl(var(--muted-foreground))",
  "hsl(var(--info))",
  "hsl(var(--border))",
  "hsl(var(--warning))",
  "hsl(var(--success))"
] as const;

export const ANALYTICS_CAMPAIGN_CHART_EMPTY_MESSAGE =
  "No reply activity for campaigns in this period.";

export type CampaignChartMeta = {
  id: string;
  name: string;
  color: string;
  totalReplies: number;
};

export type CampaignChartPoint = {
  day: string;
  date: string;
  [campaignName: string]: number | string;
};

/** X-axis label for a single day (used when `date_keys` is long, e.g. 90 days). */
export function formatCampaignChartAxisDate(date: string): string {
  try {
    return format(parseISO(date), "MMM d");
  } catch {
    return date;
  }
}

/**
 * API contract: `date_keys` is the full timeline; each campaign `series` may be sparse.
 * Missing dates are filled with 0 so lines align on the same x-axis.
 */

export function campaignChartToLineChartData(data: AnalyticsCampaignChartData | null): {
  points: CampaignChartPoint[];
  campaigns: CampaignChartMeta[];
} {
  if (!data?.date_keys?.length || !data.campaigns?.length) {
    return { points: [], campaigns: [] };
  }

  const campaigns: CampaignChartMeta[] = data.campaigns.map((campaign, index) => ({
    id: campaign.campaign_id,
    name: campaign.campaign_name,
    color: ANALYTICS_CAMPAIGN_CHART_COLORS[index % ANALYTICS_CAMPAIGN_CHART_COLORS.length],
    totalReplies: campaign.total_replies
  }));

  const repliesByName = new Map<string, Map<string, number>>();
  for (const campaign of data.campaigns) {
    const byDate = new Map<string, number>();
    for (const point of campaign.series) {
      byDate.set(point.date, point.replies);
    }
    repliesByName.set(campaign.campaign_name, byDate);
  }

  const points: CampaignChartPoint[] = data.date_keys.map((date) => {
    const point: CampaignChartPoint = {
      day: formatCampaignChartAxisDate(date),
      date
    };
    for (const meta of campaigns) {
      point[meta.name] = repliesByName.get(meta.name)?.get(date) ?? 0;
    }
    return point;
  });

  return { points, campaigns };
}

export function hasCampaignChartActivity(data: AnalyticsCampaignChartData | null): boolean {
  if (!data?.campaigns?.length) return false;
  return data.campaigns.some((c) => c.total_replies > 0);
}

