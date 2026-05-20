import { AxiosError } from "axios";
import { toast } from "@/components/ui/sonner";

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";
const ERROR_TOAST_SHOWN = "__api_error_toast_shown__";

let suppressApiErrorToasts = false;

/** Suppresses error toasts while redirecting after session expiry (avoids duplicate toasts). */
export function setSuppressApiErrorToasts(suppress: boolean): void {
  suppressApiErrorToasts = suppress;
}

function messageFromApiBody(data: unknown): string | null {
  if (typeof data === "string") {
    const trimmed = data.trim();
    if (!trimmed) return null;
    try {
      const parsed = JSON.parse(trimmed) as { message?: unknown; errors?: unknown[] };
      return messageFromApiBody(parsed);
    } catch {
      return trimmed;
    }
  }
  if (data && typeof data === "object") {
    const msg = (data as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg;
    const errors = (data as { errors?: unknown[] }).errors;
    if (Array.isArray(errors) && errors.length > 0) {
      const first = errors[0];
      const str =
        typeof first === "string" ? first : ((first as { message?: string })?.message ?? JSON.stringify(first));
      if (str && str !== "{}") return str;
    }
  }
  return null;
}

/**
 * Extract error message from API error (AxiosError.response.data).
 * Handles 422/400: message, or errors[] array (e.g. validation).
 */
export function getApiErrorMessage(error: unknown): string {
  if (typeof error === "string" && error.trim()) return error;

  // AxiosError extends Error — must read response.data before error.message
  // or we return "Request failed with status code …" instead of the API body.
  if (error instanceof AxiosError) {
    const fromBody = messageFromApiBody(error.response?.data);
    if (fromBody) return fromBody;
  }

  // Plain API-shaped reject payloads, e.g. { success: false, message: "…" }
  if (error && typeof error === "object" && !(error instanceof Error)) {
    const fromBody = messageFromApiBody(error);
    if (fromBody) return fromBody;
  }

  if (error instanceof Error && error.message?.trim()) return error.message;
  return DEFAULT_ERROR_MESSAGE;
}

/**
 * Show error toast with message from backend when available (AxiosError.response.data.message).
 */
export function showApiErrorToast(error: unknown): void {
  if (suppressApiErrorToasts) return;
  if (error && typeof error === "object" && (error as Record<string, unknown>)[ERROR_TOAST_SHOWN]) {
    return;
  }
  if (error && typeof error === "object") {
    (error as Record<string, unknown>)[ERROR_TOAST_SHOWN] = true;
  }
  toast.error(getApiErrorMessage(error));
}

/**
 * Show success toast with message (e.g. from backend response.message).
 */
export function showApiSuccessToast(message: string): void {
  toast.success(message || "Success");
}
