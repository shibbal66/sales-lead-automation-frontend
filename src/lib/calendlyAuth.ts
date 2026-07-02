import type { NavigateFunction } from "react-router-dom";
import { calendlyOAuthCallback, disconnectCalendly, getCalendlyConnectUrl } from "@/services/auth/authServices";
import { parseCalendlyConnectAuthUrl } from "@/lib/calendlyLinkStatus";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import { getAuthToken } from "@/utils/authStorage";

export const CALENDLY_SETTINGS_CONNECTED_PATH = "/settings?tab=social&calendly=connected";
export const CALENDLY_SETTINGS_ERROR_PATH = "/settings?tab=social&calendly=error";

export async function completeCalendlyOAuthFromCallback(
  searchParams: URLSearchParams,
  navigate: NavigateFunction
): Promise<void> {
  if (!getAuthToken()) {
    showApiErrorToast("Session expired. Sign in and connect Calendly again.");
    navigate("/login", { replace: true });
    return;
  }

  const oauthError = searchParams.get("error");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (oauthError) {
    showApiErrorToast(
      oauthError === "access_denied"
        ? "Calendly authorization was cancelled."
        : `Calendly authorization failed (${oauthError}).`
    );
    navigate(CALENDLY_SETTINGS_ERROR_PATH, { replace: true });
    return;
  }

  if (!code) {
    showApiErrorToast("Authorization code missing from Calendly callback.");
    navigate(CALENDLY_SETTINGS_ERROR_PATH, { replace: true });
    return;
  }

  try {
    const response = await calendlyOAuthCallback({
      code,
      state: state ?? undefined
    });

    if (!response.success) {
      showApiErrorToast(response);
      navigate(CALENDLY_SETTINGS_ERROR_PATH, { replace: true });
      return;
    }

    navigate(CALENDLY_SETTINGS_CONNECTED_PATH, { replace: true });
  } catch (error) {
    showApiErrorToast(error);
    navigate(CALENDLY_SETTINGS_ERROR_PATH, { replace: true });
  }
}

export async function startCalendlyOAuthRedirect(): Promise<boolean> {  try {
    const response = await getCalendlyConnectUrl();
    const authUrl = parseCalendlyConnectAuthUrl(response);
    if (!authUrl) {
      showApiErrorToast(response.message || "Could not start Calendly authorization.");
      return false;
    }
    window.location.assign(authUrl);
    return true;
  } catch (error) {
    showApiErrorToast(error);
    return false;
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
