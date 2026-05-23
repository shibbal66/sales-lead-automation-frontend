import type { ApiAuthUserPayload } from "./auth";

/** User profile from GET/PATCH /user (extends auth login user fields). */
export interface ApiUserProfile extends ApiAuthUserPayload {
  timezone?: string | null;
  googleAccessToken?: string;
}

export interface UserGoogleLinkData {
  linked: boolean;
  email?: string;
  calendarLinked?: boolean;
}

export interface GetCurrentUserResponse {
  success: boolean;
  message: string;
  data?: {
    user: ApiUserProfile;
    google: UserGoogleLinkData;
  };
}

/** PATCH /user — send only fields the user is updating. */
export interface UpdateUserProfileRequest {
  name?: string;
  address?: string;
  contact?: string;
  /** IANA timezone identifier, e.g. `America/New_York`. */
  timezone?: string;
  notificationsEnabled?: boolean;
  oldPassword?: string;
  password?: string;
}

export interface UpdateUserProfileResponse {
  success: boolean;
  message?: string;
  data?: {
    user: ApiUserProfile;
    google?: UserGoogleLinkData;
  };
}

export interface DeleteUserAccountResponse {
  success: boolean;
  message?: string;
}

export interface UploadUserAvatarResponse {
  success: boolean;
  message?: string;
  data?: {
    user: ApiUserProfile;
  };
}

export interface DeleteUserAvatarResponse {
  success: boolean;
  message?: string;
  data?: {
    user: ApiUserProfile;
  };
}
