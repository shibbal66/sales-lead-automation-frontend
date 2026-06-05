import type { NavigateFunction } from "react-router-dom";
import {
  exchangeGoogleIdToken,
  getGoogleOAuthStartUrl,
  googleOAuthCallback
} from "@/services/auth/authServices";
import type { AuthUser } from "@/core/types/user.types";
import type { GoogleApiResponse, GoogleAuthTokenData } from "@/types";
import { showApiErrorToast } from "@/lib/apiToast";
import { getAuthToken } from "@/utils/authStorage";
import {
  clearPendingGoogleLinkReturn,
  getPendingGoogleLinkReturn
} from "@/utils/googleLinkReturn";

type SetCredentials = (payload: { user: AuthUser; token: string; refreshToken?: string }) => void;

function looksLikeJwt(value: string): boolean {
  return value.split(".").length === 3;
}

function parseTokenData(data: unknown): { accessToken: string; refreshToken: string; user?: AuthUser } | null {
  if (data == null) return null;

  if (typeof data === "string") {
    const trimmed = data.trim();
    if (!trimmed) return null;
    try {
      return parseTokenData(JSON.parse(trimmed) as unknown);
    } catch {
      return null;
    }
  }

  if (typeof data === "object") {
    const d = data as GoogleAuthTokenData;
    const accessToken = d.accessToken ?? d.access_token;
    const refreshToken = d.refreshToken ?? d.refresh_token;
    if (accessToken && refreshToken) {
      return { accessToken, refreshToken, user: d.user };
    }
  }

  return null;
}

function authUserFromApiUser(apiUser: AuthUser): AuthUser {
  const nameParts = (apiUser.name || "").trim().split(/\s+/).filter(Boolean);
  return {
    id: apiUser.id,
    email: apiUser.email,
    isVerified: apiUser.isVerified ?? true,
    createdAt: apiUser.createdAt,
    firstName: apiUser.firstName ?? nameParts[0],
    lastName: apiUser.lastName ?? (nameParts.slice(1).join(" ") || undefined),
    avatarUrl: apiUser.avatarUrl,
    authProvider: apiUser.authProvider ?? "google"
  };
}

function fallbackGoogleUser(accessToken: string): AuthUser {
  return {
    id: "google-user",
    email: "",
    isVerified: true,
    authProvider: "google"
  };
}

async function resolveGoogleTokens(response: GoogleApiResponse): Promise<{
  accessToken: string;
  refreshToken: string;
  user?: AuthUser;
} | null> {
  if (!response.success) return null;

  const direct = parseTokenData(response.data);
  if (direct) return direct;

  if (typeof response.data === "string" && looksLikeJwt(response.data)) {
    const exchanged = await exchangeGoogleIdToken({ id_token: response.data });
    if (!exchanged.success) {
      showApiErrorToast(exchanged);
      return null;
    }
    return parseTokenData(exchanged.data);
  }

  return null;
}

export async function applyGoogleAuthResponse(
  response: GoogleApiResponse,
  params: {
    setCredentials: SetCredentials;
    navigate: NavigateFunction;
    onSuccessToast: (message: string) => void;
  }
): Promise<boolean> {
  const tokens = await resolveGoogleTokens(response);
  if (!tokens) {
    if (!response.success) {
      showApiErrorToast(response);
    } else {
      showApiErrorToast("Could not read tokens from Google auth response.");
    }
    return false;
  }

  const user = tokens.user ? authUserFromApiUser(tokens.user) : fallbackGoogleUser(tokens.accessToken);

  params.setCredentials({
    user,
    token: tokens.accessToken,
    refreshToken: tokens.refreshToken
  });

  params.onSuccessToast(response.message || "Google authentication successful.");

  const pendingReturn = getPendingGoogleLinkReturn();
  if (pendingReturn) {
    clearPendingGoogleLinkReturn();
    params.navigate(pendingReturn.returnTo, { replace: true });
    return true;
  }

  params.navigate("/dashboard", { replace: true });
  return true;
}

/** SPA route Google should redirect to after the API processes the OAuth code. */
export function getGoogleOAuthCallbackUrl(): string {
  if (typeof window === "undefined") return "/auth/google/callback";
  return `${window.location.origin}/auth/google/callback`;
}

/** Full-page redirect to GET /auth/google (Google consent screen). */
export function startGoogleOAuthRedirect(): void {
  window.location.assign(getGoogleOAuthStartUrl());
}

/** Handle SPA route `/auth/google/callback` after redirect with `?code=` or `?error=`. */
export async function completeGoogleOAuthFromCallback(
  searchParams: URLSearchParams,
  params: {
    setCredentials: SetCredentials;
    navigate: NavigateFunction;
    onSuccessToast: (message: string) => void;
  }
): Promise<void> {
  const oauthError = searchParams.get("error");
  const code = searchParams.get("code");

  if (oauthError) {
    const message =
      oauthError === "access_denied"
        ? "Google sign-in was cancelled."
        : `Google sign-in failed (${oauthError}).`;
    showApiErrorToast(message);
    const pendingReturn = getPendingGoogleLinkReturn();
    if (pendingReturn && getAuthToken()) {
      clearPendingGoogleLinkReturn();
      params.navigate(pendingReturn.returnTo, { replace: true });
      return;
    }
    params.navigate("/login", { replace: true });
    return;
  }

  if (!code) {
    showApiErrorToast("Authorization code missing from Google callback.");
    params.navigate("/login", { replace: true });
    return;
  }

  const pendingReturn = getPendingGoogleLinkReturn();

  try {
    const response = await googleOAuthCallback({ code });

    if (pendingReturn && getAuthToken()) {
      clearPendingGoogleLinkReturn();
      if (response.success) {
        const tokens = await resolveGoogleTokens(response);
        if (tokens) {
          const user = tokens.user
            ? authUserFromApiUser(tokens.user)
            : fallbackGoogleUser(tokens.accessToken);
          params.setCredentials({
            user,
            token: tokens.accessToken,
            refreshToken: tokens.refreshToken
          });
        }
        params.onSuccessToast(
          response.message || "Google account connected. Set status to Active and save your changes."
        );
        params.navigate(pendingReturn.returnTo, { replace: true });
        return;
      }
      showApiErrorToast(response);
      params.navigate(pendingReturn.returnTo, { replace: true });
      return;
    }

    const ok = await applyGoogleAuthResponse(response, params);
    if (!ok) {
      params.navigate("/login", { replace: true });
    }
  } catch (error) {
    showApiErrorToast(error);
    if (pendingReturn && getAuthToken()) {
      clearPendingGoogleLinkReturn();
      params.navigate(pendingReturn.returnTo, { replace: true });
      return;
    }
    params.navigate("/login", { replace: true });
  }
}

/** Google Identity Services / one-tap: exchange `id_token` via POST /auth/google/token. */
export async function signInWithGoogleIdToken(
  idToken: string,
  params: {
    setCredentials: SetCredentials;
    navigate: NavigateFunction;
    onSuccessToast: (message: string) => void;
  }
): Promise<boolean> {
  try {
    const response = await exchangeGoogleIdToken({ id_token: idToken });
    return applyGoogleAuthResponse(response, params);
  } catch (error) {
    showApiErrorToast(error);
    return false;
  }
}
