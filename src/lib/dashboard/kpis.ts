import type { LucideIcon } from "lucide-react";
import { CalendarCheck, Megaphone, MessageSquare, Send } from "lucide-react";
import type { DashboardSummaryData } from "@/types/dashboard";

export type DashboardKpiItem = {
  label: string;
  value: string;
  icon: LucideIcon;
};

export function buildDashboardKpis(summary: DashboardSummaryData): DashboardKpiItem[] {
  return [
    {
      label: "Total Campaigns",
      value: summary.total_campaigns.toLocaleString(),
      icon: Megaphone
    },
    {
      label: "Emails Sent",
      value: summary.total_emails_sent.toLocaleString(),
      icon: Send
    },
    {
      label: "Reply Rate",
      value: `${summary.reply_rate_percent}%`,
      icon: MessageSquare
    },
    {
      label: "Meetings Booked",
      value: summary.meeting_booking_count.toLocaleString(),
      icon: CalendarCheck
    }
  ];
}

export const DASHBOARD_KPI_COUNT = 4;
