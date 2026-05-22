import type { LucideIcon } from "lucide-react";
import { CalendarCheck, CalendarDays, Percent } from "lucide-react";
import type { MeetingStatsData } from "@/types/meetingStats";

export const MEETING_STATS_KPI_COUNT = 3;

export type MeetingStatsKpiItem = {
  label: string;
  value: string;
  hint?: string;
  delta?: { value: string; up?: boolean };
  icon: LucideIcon;
};

function deltaIsUp(value: number): boolean {
  return value >= 0;
}

function formatSignedCount(value: number): string {
  if (value === 0) return "0";
  return value > 0 ? `+${value}` : `${value}`;
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
  if (value === 0) return "0%";
  return value > 0 ? `+${formatted}%` : `-${formatted}%`;
}

function formatConversionPercent(percent: number): string {
  const formatted = Number.isInteger(percent) ? String(percent) : percent.toFixed(1);
  return `${formatted}%`;
}

export function buildMeetingStatsKpis(data: MeetingStatsData): MeetingStatsKpiItem[] {
  const { meetings_this_week, meetings_this_month, conversion_rate } = data;

  return [
    {
      label: "Meetings This Week",
      value: meetings_this_week.count.toLocaleString(),
      delta: {
        value: `${formatSignedCount(meetings_this_week.vs_last_week)} vs last week`,
        up: deltaIsUp(meetings_this_week.vs_last_week)
      },
      icon: CalendarCheck
    },
    {
      label: "Meetings This Month",
      value: meetings_this_month.count.toLocaleString(),
      delta: {
        value: `${formatSignedPercent(meetings_this_month.vs_last_month_percent)} vs last month`,
        up: deltaIsUp(meetings_this_month.vs_last_month_percent)
      },
      icon: CalendarDays
    },
    {
      label: "Conversion Rate",
      value: formatConversionPercent(conversion_rate.percent),
      delta: {
        value: `${formatSignedPoints(conversion_rate.vs_last_month_points)} vs last month`,
        up: deltaIsUp(conversion_rate.vs_last_month_points)
      },
      icon: Percent
    }
  ];
}
