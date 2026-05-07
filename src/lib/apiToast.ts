import { AxiosError } from "axios";
import { toast } from "@/components/ui/sonner";

const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";
const ERROR_TOAST_SHOWN = "__api_error_toast_shown__";

/**
 * Extract error message from API error (AxiosError.response.data).
 * Handles 422/400: message, or errors[] array (e.g. validation).
 */
export function getApiErrorMessage(error: unknown): string {
  if (error && typeof error === "object") {
    const plainMessage = (error as { message?: unknown }).message;
    if (typeof plainMessage === "string" && plainMessage.trim()) return plainMessage;
    const plainErrors = (error as { errors?: unknown[] }).errors;
    if (Array.isArray(plainErrors) && plainErrors.length > 0) {
      const first = plainErrors[0];
      const str =
        typeof first === "string" ? first : ((first as { message?: string })?.message ?? JSON.stringify(first));
      if (str && str !== "{}") return str;
    }
  }

  if (error instanceof AxiosError) {
    const data = error.response?.data;
    if (data && typeof data === "object") {
      const msg = (data as { message?: string }).message;
      if (typeof msg === "string" && msg.trim()) return msg;
      const errors = (data as { errors?: unknown[] }).errors;
      if (Array.isArray(errors) && errors.length > 0) {
        const first = errors[0];
        const str =
          typeof first === "string" ? first : ((first as { message?: string })?.message ?? JSON.stringify(first));
        if (str && str !== "{}") return str;
      }
    }
  }
  if (error instanceof Error && error.message?.trim()) return error.message;
  return DEFAULT_ERROR_MESSAGE;
}

/**
 * Show error toast with message from backend when available (AxiosError.response.data.message).
 */
export function showApiErrorToast(error: unknown): void {
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
