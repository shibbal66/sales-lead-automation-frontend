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

/** Coerces API values (including null) to a trimmed string. */
export function normalizeLeadText(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

export function mapApiStatusToPresentation(
  outreachStatus: string | null | undefined,
  replyReceived: string | null | undefined
): LeadPresentationStatus {
  const status = normalizeLeadText(outreachStatus).toLowerCase();
  const replied = normalizeLeadText(replyReceived).toLowerCase() === "yes";
  if (replied || status.includes("reply")) return "replied";
  if (status.includes("book")) return "booked";
  if (status.includes("unsub")) return "unsubscribed";
  if (status.includes("sent") || status.includes("contact")) return "contacted";
  return "new";
}

/** e.g. `master_operations` → `Master Operations` */
export function formatSnakeCaseLabel(value: string | null | undefined): string {
  const trimmed = normalizeLeadText(value);
  if (!trimmed) return trimmed;

  return trimmed
    .split("_")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function mapLeadApiToListRow(lead: LeadApiModel): LeadListRowViewModel {
  const nameFromParts = normalizeLeadText(`${lead.firstName ?? ""} ${lead.lastName ?? ""}`);

  return {
    id: String(lead.id),
    name: normalizeLeadText(lead.fullName) || nameFromParts || "—",
    company: normalizeLeadText(lead.company) || "—",
    email: normalizeLeadText(lead.email),
    title: normalizeLeadText(lead.title) || "—",
    website: normalizeLeadText(lead.domain) || "—",
    phone: normalizeLeadText(lead.companyPhone) || "—",
    status: mapApiStatusToPresentation(lead.outreachStatus, lead.replyReceived),
    fitScore: normalizeLeadText(lead.fitScore) || "—",
    lastContacted: formatRelativeDate(lead.emailSentDate || lead.created_at)
  };
}
