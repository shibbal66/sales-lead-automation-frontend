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

export interface UpdateUserProfileRequest {
  name?: string;
  profilePic?: string;
  address?: string;
  contact?: string;
  /** IANA timezone identifier, e.g. `America/New_York`. */
  timezone?: string;
}

export interface UpdateUserProfileResponse {
  success: boolean;
  message: string;
  data?: {
    user: ApiUserProfile;
    google?: UserGoogleLinkData;
  };
}
