import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { END_POINT } from "@/lib/apiURL";

export const TOKEN_EXPIRED_CODE = "TOKEN_EXPIRED";

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

function getApiErrorCode(error: unknown): string | undefined {
  const data = (error as AxiosError).response?.data;
  if (!data || typeof data !== "object") return undefined;
  const code = (data as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

export function isTokenExpiredError(error: unknown): boolean {
  const axiosError = error as AxiosError;
  return (
    axiosError.response?.status === 401 &&
    getApiErrorCode(error) === TOKEN_EXPIRED_CODE
  );
}

/** True when the interceptor should refresh the access token and retry. */
export function shouldRefreshAccessToken(
  error: unknown,
  config?: InternalAxiosRequestConfig
): boolean {
  if (isAuthEndpoint(config?.url)) return false;
  return isTokenExpiredError(error);
}
