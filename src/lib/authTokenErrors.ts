import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { END_POINT } from "@/lib/apiURL";

const AUTH_ENDPOINTS = [
  END_POINT.auth.login,
  END_POINT.auth.refresh,
  END_POINT.auth.signup,
  END_POINT.auth.verifyOtp,
  END_POINT.auth.resendOtp,
  END_POINT.auth.forgotPassword,
  END_POINT.auth.resetPassword,
  END_POINT.auth.google,
  END_POINT.auth.googleCallback,
  END_POINT.auth.googleToken,
] as const;

export function isAuthEndpoint(url?: string): boolean {
  if (!url) return true;
  return AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

/** True when the interceptor should refresh the access token and retry. */
export function shouldRefreshAccessToken(
  error: unknown,
  config?: InternalAxiosRequestConfig
): boolean {
  if (isAuthEndpoint(config?.url)) return false;
  return (error as AxiosError).response?.status === 401;
}
