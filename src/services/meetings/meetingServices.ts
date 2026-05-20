import apiInvoker from "@/lib/apiInvoker";
import { END_POINT } from "@/lib/apiURL";
import { buildMeetingsQueryParams } from "@/lib/meetings/query";
import type {
  CreateMeetingRequest,
  CreateMeetingResponse,
  GetMeetingsResponse,
  MeetingMutationResponse,
  MeetingsListQuery,
  UpdateMeetingRequest
} from "@/types/meeting";

export function getMeetings(query: MeetingsListQuery = {}) {
  return apiInvoker<GetMeetingsResponse>(
    END_POINT.meeting.list,
    "GET",
    undefined,
    buildMeetingsQueryParams(query)
  );
}

export function createMeeting(payload: CreateMeetingRequest) {
  return apiInvoker<CreateMeetingResponse>(END_POINT.meeting.create, "POST", payload);
}

export function updateMeeting(id: string, payload: UpdateMeetingRequest) {
  return apiInvoker<MeetingMutationResponse>(END_POINT.meeting.byId(id), "PATCH", payload);
}

export function cancelMeeting(id: string) {
  return apiInvoker<MeetingMutationResponse>(END_POINT.meeting.byId(id), "DELETE");
}
