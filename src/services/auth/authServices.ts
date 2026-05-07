import apiInvoker from "../../lib/apiInvoker";
import { END_POINT } from "../../lib/apiURL";
import type {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
  GoogleAuthResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
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

export function googleSignIn() {
  return apiInvoker<GoogleAuthResponse>(END_POINT.auth.googleLogin, "GET");
}


export function signup(payload: SignupRequest) {
  return apiInvoker<SignupResponse>(END_POINT.auth.signup, "POST", payload);
}


export function verifyOtp(payload: VerifyOtpRequest) {
  return apiInvoker<VerifyOtpResponse>(END_POINT.auth.verifyOtp, "POST", payload);
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
