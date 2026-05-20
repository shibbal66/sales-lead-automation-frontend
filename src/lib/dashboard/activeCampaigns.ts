export const DEFAULT_ACTIVE_CAMPAIGNS_LIMIT = 10;

export const DASHBOARD_ACTIVE_CAMPAIGNS_EMPTY_MESSAGE = "No active campaigns right now.";

export function formatActiveCampaignStatusForPill(status: string): string {
  if (status === "active") return "running";
  return status;
}

export function formatActiveCampaignLeadsLine(sent: number, totalLeads: number): string {
  return `${sent.toLocaleString()} / ${totalLeads.toLocaleString()} leads sent`;
}

export function clampCampaignProgress(progress: number): number {
  if (!Number.isFinite(progress)) return 0;
  return Math.min(100, Math.max(0, Math.round(progress)));
}

export function runningCampaignsSubtitle(totalRunning: number): string {
  const n = totalRunning;
  return `${n} running`;
}
