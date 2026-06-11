import type { ApiPagination } from "@/types/campaign";

export type MeetingApiStatus = "scheduled" | "completed";

/** Status values returned from the API (includes server-side cancelled). */
export type MeetingReadStatus = MeetingApiStatus | "cancelled";

export interface MeetingsListQuery {
  status?: MeetingReadStatus;
  campaign_id?: string;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

/** UI list/calendar row for a booked meeting. */
export interface Meeting {
  id: string;
  leadName: string;
  company: string;
  campaign: string;
  date: string;
  meetingAt: string;
  endAt: string;
  bookedAt: string;
  status: string;
  /** Raw API status (cancelled is read-only; use cancel meeting to cancel). */
  apiStatus: MeetingReadStatus;
  description?: string | null;
  meetLink?: string | null;
}

export interface MeetingApiModel {
  id: string;
  campaignId: string | null;
  campaignLeadId: string | null;
  title: string;
  description: string | null;
  attendeeEmail: string;
  startAt: string;
  endAt: string;
  meetLink: string | null;
  googleEventId: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateMeetingRequest {
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  attendee_email: string;
  campaign_id?: string;
  campaign_lead_id?: string;
  sync_google?: boolean;
  add_google_meet?: boolean;
}

export interface CreateMeetingResponse {
  success: boolean;
  message?: string;
  data?: {
    meeting: MeetingApiModel;
  };
}

export interface UpdateMeetingRequest {
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  attendee_email: string;
  status: MeetingApiStatus;
}

export interface MeetingMutationResponse {
  success: boolean;
  message?: string;
  data?: {
    meeting: MeetingApiModel;
  };
}

/** GET `/meetings` */
export interface GetMeetingsResponse {
  success: boolean;
  message?: string;
  data?: MeetingApiModel[];
  pagination?: ApiPagination;
}
