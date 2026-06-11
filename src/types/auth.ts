import type { AuthUser } from "@/core/types/user.types";

/** User object returned by login / verify-otp auth endpoints. */
export interface ApiAuthUserPayload {
  id: string;
  email: string;
  isVerified?: boolean;
  createdAt?: string;
  role?: string;
  name?: string | null;
  profilePic?: string | null;
  address?: string | null;
  contact?: string | null;
  timezone?: string | null;
  notificationsEnabled?: boolean;
  avatarUrl?: string;
  authProvider?: string;
}


export interface LoginRequest {
  email: string;
  password: string;
}

export const AUTH_ERROR_CODE = {
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED"
} as const;

export interface LoginResponse {
  success: boolean;
  message: string;
  code?: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: ApiAuthUserPayload;
  };
}

export interface SignupRequest {
  email: string;
  password: string;
  name: string;
  address: string;
  contact: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
  };
}

export interface GoogleTokenExchangeRequest {
  id_token: string;
}

/** Shared envelope for Google OAuth routes (callback, token exchange, status). */
export interface GoogleApiResponse {
  success: boolean;
  message?: string;
  code?: string;
  /** JWT pair object, redirect URL, or stringified JSON / id_token depending on route. */
  data?: string | GoogleAuthTokenData;
}

export type GoogleAuthTokenData = {
  accessToken?: string;
  refreshToken?: string;
  access_token?: string;
  refresh_token?: string;
  user?: AuthUser;
  url?: string;
};

export type GoogleCallbackResponse = GoogleApiResponse;
export type GoogleTokenExchangeResponse = GoogleApiResponse;

/** GET /auth/google/status — Gmail link state for the authenticated user. */
export interface GoogleLinkStatusData {
  linked: boolean;
  email?: string;
  name?: string;
  avatarUrl?: string;
  calendarLinked?: boolean;
  scopes?: string[];
  tokenExpiresAt?: string;
}

export interface GoogleLinkStatusResponse {
  success: boolean;
  message?: string;
  data?: GoogleLinkStatusData;
}






export type OtpPurpose = "email_verification" | "password_reset";

export interface ValidateOtpRequest {
  email: string;
  otp: string;
  purpose: OtpPurpose;
}

export interface ValidateOtpResponse {
  success: boolean;
  message: string;
  data?: {
    valid: boolean;
  };
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: ApiAuthUserPayload;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message?: string;
  /** When `success` is false, e.g. `TOKEN_EXPIRED`. */
  code?: string;
  data?: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  success: boolean;
  message: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  password: string;
}

export type ResetPasswordResponse = LoginResponse;

export interface ResendOtpRequest {
  email: string;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
}

export interface LogoutAllResponse {
  success: boolean;
  message: string;
}