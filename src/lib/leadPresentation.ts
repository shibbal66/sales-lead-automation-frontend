import { formatRelativeDate } from "@/lib/dateFormatting";
import type { LeadApiModel, LeadPresentationStatus } from "@/types";

export type LeadListRowViewModel = {
  id: string;
  name: string;
  company: string;
  email: string;
  title: string;
  website: string;
  phone: string;
  status: LeadPresentationStatus;
  campaignName?: string;
  fitScore: string;
  lastContacted: string;
};

export function mapApiStatusToPresentation(
  outreachStatus: string,
  replyReceived: string
): LeadPresentationStatus {
  const status = outreachStatus.toLowerCase();
  const replied = replyReceived.toLowerCase() === "yes";
  if (replied || status.includes("reply")) return "replied";
  if (status.includes("book")) return "booked";
  if (status.includes("unsub")) return "unsubscribed";
  if (status.includes("sent") || status.includes("contact")) return "contacted";
  return "new";
}

/** e.g. `master_operations` → `Master Operations` */
export function formatSnakeCaseLabel(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;

  return trimmed
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function mapLeadApiToListRow(lead: LeadApiModel): LeadListRowViewModel {
  return {
    id: String(lead.id),
    name: lead.fullName || `${lead.firstName} ${lead.lastName}`.trim(),
    company: lead.company,
    email: lead.email,
    title: lead.title || "—",
    website: lead.domain || "—",
    phone: lead.companyPhone || "—",
    status: mapApiStatusToPresentation(lead.outreachStatus || "", lead.replyReceived || ""),
    fitScore: lead.fitScore || "—",
    lastContacted: formatRelativeDate(lead.emailSentDate || lead.created_at)
  };
}
