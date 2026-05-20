import apiInvoker from "@/lib/apiInvoker";
import { END_POINT } from "@/lib/apiURL";
import type {
  GetCurrentUserResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse
} from "@/types/user";

export function getCurrentUser() {
  return apiInvoker<GetCurrentUserResponse>(END_POINT.user.profile, "GET");
}

export function updateCurrentUser(payload: UpdateUserProfileRequest) {
  return apiInvoker<UpdateUserProfileResponse>(END_POINT.user.profile, "PATCH", payload);
}
