import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from "axios";
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

/** Read API `code` from a response body or axios error payload. */
export function getApiErrorCodeFromBody(data: unknown): string | undefined {
  if (!data || typeof data !== "object") return undefined;
  const code = (data as { code?: unknown }).code;
  return typeof code === "string" ? code : undefined;
}

function getApiErrorCode(error: unknown): string | undefined {
  const axiosError = error as AxiosError;
  return getApiErrorCodeFromBody(axiosError.response?.data);
}

export function isTokenExpiredPayload(data: unknown): boolean {
  return getApiErrorCodeFromBody(data) === TOKEN_EXPIRED_CODE;
}

export function isTokenExpiredError(error: unknown): boolean {
  const axiosError = error as AxiosError;
  const status = axiosError.response?.status;
  const code = getApiErrorCode(error);

  if (code !== TOKEN_EXPIRED_CODE) return false;

  // Standard 401, or 200/403/etc. when the backend still returns TOKEN_EXPIRED in the body.
  return status === 401 || status === 200 || status === 403;
}

export type AuthAwareAxiosRequestConfig = InternalAxiosRequestConfig & {
  /** When true, TOKEN_EXPIRED responses are not retried via refresh (e.g. logout cleanup). */
  _skipAuthRefresh?: boolean;
};

/** True when the interceptor should refresh the access token and retry. */
export function shouldRefreshAccessToken(
  error: unknown,
  config?: AuthAwareAxiosRequestConfig
): boolean {
  if (isAuthEndpoint(config?.url)) return false;
  if (config?._skipAuthRefresh) return false;
  return isTokenExpiredError(error);
}

/** Turn a successful HTTP response that carries TOKEN_EXPIRED into an axios error for the refresh flow. */
export function tokenExpiredResponseToAxiosError(response: AxiosResponse): AxiosError {
  const message =
    (response.data as { message?: string })?.message ?? "Access token expired. Please login again.";
  return new AxiosError(
    message,
    AxiosError.ERR_BAD_REQUEST,
    response.config,
    response.request,
    { ...response, status: 401 }
  );
}
