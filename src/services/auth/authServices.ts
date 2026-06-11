import apiInvoker from "../../lib/apiInvoker";
import { END_POINT } from "../../lib/apiURL";
import type {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  GoogleCallbackResponse,
  GoogleLinkStatusResponse,
  GoogleTokenExchangeRequest,
  GoogleTokenExchangeResponse,
  ValidateOtpRequest,
  ValidateOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ResendOtpRequest,
  ResendOtpResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  LogoutRequest,
  LogoutResponse,
  LogoutAllResponse
} from "../../types";

export function login(body: LoginRequest) {
  return apiInvoker<LoginResponse>(END_POINT.auth.login, "POST", body);
}

/** Browser redirect — start Google OAuth (GET /auth/google). */
export function getGoogleOAuthStartUrl(): string {
  const base = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
  return `${base}${END_POINT.auth.google}`;
}

/** Complete OAuth after Google redirect (GET /auth/google/callback?code=). */
export function googleOAuthCallback(params: { code?: string; error?: string }) {
  return apiInvoker<GoogleCallbackResponse>(END_POINT.auth.googleCallback, "GET", undefined, params);
}

/** Exchange Google `id_token` for app JWT pair (POST /auth/google/token). */
export function exchangeGoogleIdToken(body: GoogleTokenExchangeRequest) {
  return apiInvoker<GoogleTokenExchangeResponse>(END_POINT.auth.googleToken, "POST", body);
}

/** Google link status for the current user (GET /auth/google/status, bearer required). */
export function getGoogleLinkStatus() {
  return apiInvoker<GoogleLinkStatusResponse>(END_POINT.auth.googleStatus, "GET");
}

export function signup(payload: SignupRequest) {
  return apiInvoker<SignupResponse>(END_POINT.auth.signup, "POST", payload);
}

export function validateOtp(payload: ValidateOtpRequest) {
  return apiInvoker<ValidateOtpResponse>(END_POINT.auth.validateOtp, "POST", payload);
}

export function verifyOtp(payload: VerifyOtpRequest) {
  return apiInvoker<VerifyOtpResponse>(END_POINT.auth.verifyOtp, "POST", payload);
}

export function forgotPassword(payload: ForgotPasswordRequest) {
  return apiInvoker<ForgotPasswordResponse>(END_POINT.auth.forgotPassword, "POST", payload);
}

export function resetPassword(payload: ResetPasswordRequest) {
  return apiInvoker<ResetPasswordResponse>(END_POINT.auth.resetPassword, "POST", payload);
}

export function resendOtp(payload: ResendOtpRequest) {
  return apiInvoker<ResendOtpResponse>(END_POINT.auth.resendOtp, "POST", payload);
}

export function refreshToken(payload: RefreshTokenRequest) {
  return apiInvoker<RefreshTokenResponse>(END_POINT.auth.refresh, "POST", payload);
}

export function logout(payload: LogoutRequest) {
  return apiInvoker<LogoutResponse>(END_POINT.auth.logout, "POST", payload);
}

export function logoutAll() {
  return apiInvoker<LogoutAllResponse>(END_POINT.auth.logoutAll, "POST");
}
