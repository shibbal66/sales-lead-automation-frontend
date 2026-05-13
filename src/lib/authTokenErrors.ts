import type { AxiosError, InternalAxiosRequestConfig } from "axios";
import { END_POINT } from "./apiURL";
import { getAuthToken, getRefreshToken } from "@/utils/authSorage";

/**
 * Backend contract: expired access tokens may return this envelope instead of 401.
 * Prefer a dedicated auth error code or status from the API when available.
 */
export const EXPIRED_TOKEN_RESPONSE_MESSAGE = "Something went wrong. Please try again later.";

const AUTH_ENDPOINTS = [
  END_POINT.auth.login,
  END_POINT.auth.signup,
  END_POINT.auth.googleLogin,
  END_POINT.auth.refresh,
  END_POINT.auth.verifyOtp,
  END_POINT.auth.resendOtp,
] as const;

export const isAuthEndpoint = (url?: string): boolean =>
  Boolean(url && AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint)));

export const getResponsePayload = (error: AxiosError): Record<string, unknown> | null => {
  const data = error.response?.data;
  if (!data || typeof data !== "object") return null;
  return data as Record<string, unknown>;
};

export const isExpiredTokenResponse = (error: AxiosError): boolean => {
  const payload = getResponsePayload(error);
  if (!payload || payload.success !== false) return false;

  const message = typeof payload.message === "string" ? payload.message.trim() : "";
  return message === EXPIRED_TOKEN_RESPONSE_MESSAGE;
};

export const getErrorMessage = (error: AxiosError): string => {
  const payload = getResponsePayload(error);
  if (!payload) {
    const data = error.response?.data;
    if (typeof data === "string") return data.toLowerCase();
    return "";
  }

  const parts = [payload.message, payload.error, payload.errorMessage]
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.toLowerCase());

  if (Array.isArray(payload.errors)) {
    for (const entry of payload.errors) {
      if (typeof entry === "string") {
        parts.push(entry.toLowerCase());
        continue;
      }
      if (entry && typeof entry === "object" && typeof (entry as { message?: string }).message === "string") {
        parts.push((entry as { message: string }).message.toLowerCase());
      }
    }
  }

  return parts.join(" ");
};

export const canAttemptTokenRefresh = (request?: InternalAxiosRequestConfig): boolean =>
  Boolean(request && !isAuthEndpoint(request.url) && getAuthToken() && getRefreshToken());

export const isExpiredTokenError = (error: AxiosError, request?: InternalAxiosRequestConfig): boolean => {
  if (!canAttemptTokenRefresh(request)) return false;

  const status = error.response?.status;
  if (status === 401 || status === 500) return true;

  const message = getErrorMessage(error);
  const tokenExpiredByMessage =
    message.includes("token expired") ||
    message.includes("access token expired") ||
    message.includes("invalid token") ||
    message.includes("unauthorized");

  if (status === 403 && tokenExpiredByMessage) return true;
  if (tokenExpiredByMessage) return true;
  if (isExpiredTokenResponse(error)) return true;

  return false;
};
