import { getCalendlyConnectUrl, disconnectCalendly } from "@/services/auth/authServices";
import { parseCalendlyConnectAuthUrl } from "@/lib/calendlyLinkStatus";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";

export function formatCalendlyCallbackError(message: string | null | undefined): string {
  const normalized = message?.trim();
  if (!normalized) return "Could not connect Calendly account.";
  if (normalized === "connect_failed") {
    return "Could not connect your Calendly account. Please try again.";
  }
  return normalized;
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
