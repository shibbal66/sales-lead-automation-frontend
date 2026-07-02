import { getCalendlyConnectUrl, disconnectCalendly } from "@/services/auth/authServices";
import { END_POINT } from "@/lib/apiURL";
import { parseCalendlyConnectAuthUrl } from "@/lib/calendlyLinkStatus";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";

export const CALENDLY_SETTINGS_TAB = "social";

export type CalendlyOAuthReturnStatus = "connected" | "error";

/** Query params the API adds after GET /auth/calendly/callback (browser redirect). */
export interface CalendlyOAuthReturn {
  status: CalendlyOAuthReturnStatus;
  message: string | null;
}

export type CalendlyIncomingCallbackAction =
  | { type: "forward-api"; searchParams: URLSearchParams }
  | { type: "return-settings"; returnInfo: CalendlyOAuthReturn };

const CALENDLY_ERROR_MESSAGES: Record<string, string> = {
  connect_failed: "Could not connect your Calendly account. Please try again.",
  access_denied: "Calendly authorization was cancelled.",
  missing_code: "Authorization code missing from Calendly callback."
};

function getApiBaseUrl(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
}

/** Calendly redirect URI registered for this app (SPA route). */
export function getCalendlyOAuthCallbackUrl(): string {
  if (typeof window === "undefined") return "/auth/calendly/callback";
  return `${window.location.origin}/auth/calendly/callback`;
}

/** Browser URL for GET /auth/calendly/callback — forwards OAuth query params to the API. */
export function getCalendlyApiCallbackUrl(searchParams: URLSearchParams): string {
  const query = searchParams.toString();
  return `${getApiBaseUrl()}${END_POINT.auth.calendlyCallback}${query ? `?${query}` : ""}`;
}

/** Full-page redirect so the API can finish OAuth and redirect back to Settings. */
export function redirectToCalendlyApiCallback(searchParams: URLSearchParams): void {
  window.location.replace(getCalendlyApiCallbackUrl(searchParams));
}

/** Parse API redirect result from Settings URL (`calendly=connected|error`). */
export function parseCalendlyOAuthReturn(searchParams: URLSearchParams): CalendlyOAuthReturn | null {
  const raw = searchParams.get("calendly")?.trim().toLowerCase();
  if (!raw) return null;

  return {
    status: raw === "connected" ? "connected" : "error",
    message: searchParams.get("message")
  };
}

export function buildCalendlySettingsReturnPath(
  status: CalendlyOAuthReturnStatus,
  message?: string | null
): string {
  const { pathname, search } = buildCalendlySettingsReturnLocation(status, message);
  return `${pathname}${search}`;
}

export function buildCalendlySettingsReturnLocation(
  status: CalendlyOAuthReturnStatus,
  message?: string | null
): { pathname: string; search: string } {
  const params = new URLSearchParams({ tab: CALENDLY_SETTINGS_TAB, calendly: status });
  const normalized = message?.trim();
  if (normalized) params.set("message", normalized);
  return { pathname: "/settings", search: `?${params.toString()}` };
}

export function clearCalendlyOAuthReturnParams(searchParams: URLSearchParams): URLSearchParams {
  const next = new URLSearchParams(searchParams);
  next.delete("calendly");
  next.delete("message");
  return next;
}

/** Decide whether to forward Calendly's redirect to the API or return to Settings locally. */
export function resolveCalendlyIncomingCallback(
  searchParams: URLSearchParams
): CalendlyIncomingCallbackAction {
  const oauthError = searchParams.get("error")?.trim();
  if (oauthError) {
    return {
      type: "return-settings",
      returnInfo: {
        status: "error",
        message: oauthError === "access_denied" ? "access_denied" : oauthError
      }
    };
  }

  if (!searchParams.get("code")?.trim()) {
    return {
      type: "return-settings",
      returnInfo: { status: "error", message: "missing_code" }
    };
  }

  return { type: "forward-api", searchParams };
}

export function formatCalendlyCallbackError(message: string | null | undefined): string {
  const normalized = message?.trim();
  if (!normalized) return "Could not connect Calendly account.";
  return CALENDLY_ERROR_MESSAGES[normalized] ?? normalized;
}

export function formatCalendlyCallbackSuccess(message: string | null | undefined): string {
  const normalized = message?.trim();
  return normalized || "Calendly account connected.";
}

export function applyCalendlyOAuthReturn(
  returnInfo: CalendlyOAuthReturn,
  options?: { onConnected?: () => void }
): void {
  if (returnInfo.status === "connected") {
    showApiSuccessToast(formatCalendlyCallbackSuccess(returnInfo.message));
    options?.onConnected?.();
    return;
  }

  showApiErrorToast(formatCalendlyCallbackError(returnInfo.message));
}

export async function startCalendlyOAuthRedirect(): Promise<void> {
  try {
    const response = await getCalendlyConnectUrl();
    const authUrl = parseCalendlyConnectAuthUrl(response);
    if (!authUrl) {
      showApiErrorToast(response.message || "Could not start Calendly authorization.");
      return;
    }
    window.location.assign(authUrl);
  } catch (error) {
    showApiErrorToast(error);
  }
}

export async function disconnectCalendlyAccount(): Promise<boolean> {
  try {
    const response = await disconnectCalendly();
    if (!response.success) {
      showApiErrorToast(response);
      return false;
    }
    showApiSuccessToast(response.message || "Calendly account disconnected.");
    return true;
  } catch (error) {
    showApiErrorToast(error);
    return false;
  }
}
