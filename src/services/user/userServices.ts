import apiInvoker from "@/lib/apiInvoker";
import axiosInstance from "@/lib/axiosInstance";
import { END_POINT } from "@/lib/apiURL";
import type {
  DeleteUserAccountResponse,
  DeleteUserAvatarResponse,
  GetCurrentUserResponse,
  UpdateUserProfileRequest,
  UpdateUserProfileResponse,
  UploadUserAvatarResponse
} from "@/types/user";

export function getCurrentUser() {
  return apiInvoker<GetCurrentUserResponse>(END_POINT.user.profile, "GET");
}

export function updateCurrentUser(payload: UpdateUserProfileRequest) {
  return apiInvoker<UpdateUserProfileResponse>(END_POINT.user.profile, "PATCH", payload);
}

export function deleteCurrentUser() {
  return apiInvoker<DeleteUserAccountResponse>(END_POINT.user.profile, "DELETE");
}

export async function uploadUserAvatar(image: File) {
  const formData = new FormData();
  formData.append("image", image);
  const response = await axiosInstance.post<UploadUserAvatarResponse>(
    END_POINT.user.avatar,
    formData
  );
  return response.data;
}

export function deleteUserAvatar() {
  return apiInvoker<DeleteUserAvatarResponse>(END_POINT.user.avatar, "DELETE");
}
