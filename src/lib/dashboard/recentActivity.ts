import { formatDistanceToNow, parseISO } from "date-fns";
import type { DashboardRecentActivityItem } from "@/types/dashboard";

export const DEFAULT_RECENT_ACTIVITY_LIMIT = 10;

export const DASHBOARD_RECENT_ACTIVITY_EMPTY_MESSAGE = "No recent activity yet.";

export function formatRecentActivityText(item: DashboardRecentActivityItem): string {
  const title = item.title?.trim();
  const campaign = item.campaign_name?.trim();
  if (title && campaign) return `${title} · ${campaign}`;
  return title || campaign || "Activity";
}

export function formatRecentActivityTime(occurredAt: string): string {
  try {
    return formatDistanceToNow(parseISO(occurredAt), { addSuffix: true });
  } catch {
    return occurredAt;
  }
}
