import type { LucideIcon } from "lucide-react";
import { CalendarCheck, MailOpen, MessageSquare, Send } from "lucide-react";
import { formatAnalyticsRatePercent } from "./campaignComparison";
import type { AnalyticsOverviewData } from "@/types/analytics";

export const ANALYTICS_OVERVIEW_KPI_COUNT = 4;

const VS_PREVIOUS_PERIOD = "vs previous period";

export type AnalyticsOverviewKpiItem = {
  label: string;
  value: string;
  hint?: string;
  delta?: { value: string; up?: boolean };
  icon: LucideIcon;
};

function deltaIsUp(value: number): boolean {
  return value >= 0;
}

function formatSignedPercent(value: number): string {
  const abs = Math.abs(value);
  const formatted = Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
  if (value === 0) return "0%";
  return value > 0 ? `+${formatted}%` : `-${formatted}%`;
}

function formatSignedPoints(value: number): string {
  const abs = Math.abs(value);
  const formatted = Number.isInteger(abs) ? String(abs) : abs.toFixed(1);
  if (value === 0) return "0 pts";
  return value > 0 ? `+${formatted} pts` : `-${formatted} pts`;
}

function formatSignedCount(value: number): string {
  if (value === 0) return "0";
  return value > 0 ? `+${value}` : `${value}`;
}

export function buildAnalyticsOverviewKpis(data: AnalyticsOverviewData): AnalyticsOverviewKpiItem[] {
  const { emails_sent, open_rate, reply_rate, meetings_booked, meta } = data;

  const openRateValue =
    open_rate.tracked && open_rate.percent !== null
      ? formatAnalyticsRatePercent(open_rate.percent)
      : "0%";

  const openRateHint = !open_rate.tracked && meta.open_rate_note ? meta.open_rate_note : undefined;

  const openRateDelta =
    open_rate.tracked && open_rate.vs_previous_period_points !== null
      ? {
          value: `${formatSignedPoints(open_rate.vs_previous_period_points)} ${VS_PREVIOUS_PERIOD}`,
          up: deltaIsUp(open_rate.vs_previous_period_points)
        }
      : undefined;

  const replyRateDelta =
    reply_rate.vs_previous_period_points !== null
      ? {
          value: `${formatSignedPoints(reply_rate.vs_previous_period_points)} ${VS_PREVIOUS_PERIOD}`,
          up: deltaIsUp(reply_rate.vs_previous_period_points)
        }
      : undefined;

  return [
    {
      label: "Emails Sent",
      value: emails_sent.count.toLocaleString(),
      delta: {
        value: `${formatSignedPercent(emails_sent.vs_previous_period_percent)} ${VS_PREVIOUS_PERIOD}`,
        up: deltaIsUp(emails_sent.vs_previous_period_percent)
      },
      icon: Send
    },
    {
      label: "Open Rate",
      value: openRateValue,
      hint: openRateHint,
      delta: openRateDelta,
      icon: MailOpen
    },
    {
      label: "Reply Rate",
      value: formatAnalyticsRatePercent(reply_rate.percent),
      delta: replyRateDelta,
      icon: MessageSquare
    },
    {
      label: "Meetings Booked",
      value: meetings_booked.count.toLocaleString(),
      delta: {
        value: `${formatSignedCount(meetings_booked.vs_previous_period)} ${VS_PREVIOUS_PERIOD}`,
        up: deltaIsUp(meetings_booked.vs_previous_period)
      },
      icon: CalendarCheck
    }
  ];
}
