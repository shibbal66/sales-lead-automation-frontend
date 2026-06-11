import { format, parseISO } from "date-fns";
import { formatRelativeDate } from "@/lib/dateFormatting";
import type { Meeting, MeetingApiModel, MeetingReadStatus } from "@/types/meeting";

export function normalizeMeetingApiStatus(status: string): MeetingReadStatus {
  const normalized = status.trim().toLowerCase();
  if (normalized === "completed") return "completed";
  if (normalized === "cancelled" || normalized === "canceled") return "cancelled";
  return "scheduled";
}

export function mapMeetingStatusForPill(status: string): string {
  const normalized = status.trim().toLowerCase();
  if (normalized === "scheduled" || normalized === "upcoming") return "Upcoming";
  if (normalized === "completed") return "Completed";
  if (normalized === "cancelled" || normalized === "canceled") return "Cancelled";
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatMeetingRange(startAt: string, endAt: string): string {
  try {
    const start = parseISO(startAt);
    const end = parseISO(endAt);
    const sameDay =
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate();
    if (sameDay) {
      return `${format(start, "EEE, MMM d · h:mm a")} – ${format(end, "h:mm a")}`;
    }
    return `${format(start, "MMM d, h:mm a")} – ${format(end, "MMM d, h:mm a")}`;
  } catch {
    return `${startAt} – ${endAt}`;
  }
}

export function mapMeetingApiToListItem(
  meeting: MeetingApiModel,
  options?: { campaignName?: string }
): Meeting {
  return {
    id: meeting.id,
    leadName: meeting.title,
    company: meeting.attendeeEmail,
    campaign: options?.campaignName ?? (meeting.campaignId ? "Campaign" : "—"),
    date: formatMeetingRange(meeting.startAt, meeting.endAt),
    meetingAt: meeting.startAt,
    endAt: meeting.endAt,
    bookedAt: formatRelativeDate(meeting.createdAt),
    status: mapMeetingStatusForPill(meeting.status),
    apiStatus: normalizeMeetingApiStatus(meeting.status),
    description: meeting.description,
    meetLink: meeting.meetLink
  };
}

export function mapMeetingsApiToListItems(
  meetings: MeetingApiModel[],
  campaignNameById?: Map<string, string>
): Meeting[] {
  return meetings
    .map((m) =>
      mapMeetingApiToListItem(m, {
        campaignName: m.campaignId ? campaignNameById?.get(m.campaignId) : undefined
      })
    )
    .sort((a, b) => new Date(b.meetingAt).getTime() - new Date(a.meetingAt).getTime());
}
