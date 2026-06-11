import type { AuthUser } from "@/core/types/user.types";

const AUTH_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";
const PENDING_VERIFY_KEY = "pending_verify";
const PENDING_PASSWORD_RESET_KEY = "pending_password_reset";
const PENDING_AUTH_ERROR_KEY = "pending_auth_error";

const isBrowser = () => typeof window !== "undefined";

type AccessTokenSyncHandler = (accessToken: string) => void;
type AuthClearSyncHandler = () => void;

let accessTokenSyncHandler: AccessTokenSyncHandler | null = null;
let authClearSyncHandler: AuthClearSyncHandler | null = null;

export function registerAccessTokenSync(handler: AccessTokenSyncHandler): void {
  accessTokenSyncHandler = handler;
}

export function registerAuthClearSync(handler: AuthClearSyncHandler): void {
  authClearSyncHandler = handler;
}

export function getAuthToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  // Session-scoped storage limits refresh-token persistence; access tokens in localStorage remain XSS-sensitive.
  return sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  if (!isBrowser()) return null;
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;
  try {
    return JSON.parse(userStr) as AuthUser;
  } catch {
    return null;
  }
}

export function setAuthToken(token: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  accessTokenSyncHandler?.(token);
}

export function setRefreshToken(token: string): void {
  if (!isBrowser()) return;
  sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function setStoredUser(user: AuthUser): void {
  if (!isBrowser()) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function setPendingVerification(data: { email: string }): void {
  if (!isBrowser()) return;
  sessionStorage.setItem(PENDING_VERIFY_KEY, JSON.stringify(data));
}

export function getPendingVerification(): { email: string } | null {
  if (!isBrowser()) return null;
  const raw = sessionStorage.getItem(PENDING_VERIFY_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { email?: string; userId?: string };
    if (parsed.email) return { email: parsed.email };
    return null;
  } catch {
    return null;
  }
}

export function clearPendingVerification(): void {
  if (!isBrowser()) return;
  sessionStorage.removeItem(PENDING_VERIFY_KEY);
}

export function setPendingPasswordReset(data: { email: string; otp?: string }): void {
  if (!isBrowser()) return;
  sessionStorage.setItem(PENDING_PASSWORD_RESET_KEY, JSON.stringify(data));
}

export function getPendingPasswordReset(): { email: string; otp?: string } | null {
  if (!isBrowser()) return null;
  const raw = sessionStorage.getItem(PENDING_PASSWORD_RESET_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { email?: string; otp?: string };
    if (parsed.email) return { email: parsed.email, otp: parsed.otp };
    return null;
  } catch {
    return null;
  }
}

export function clearPendingPasswordReset(): void {
  if (!isBrowser()) return;
  sessionStorage.removeItem(PENDING_PASSWORD_RESET_KEY);
}

/** Shown once on the login page after refresh-token failure forces sign-out. */
export function setPendingAuthError(message: string): void {
  if (!isBrowser()) return;
  const trimmed = message.trim();
  if (!trimmed) return;
  sessionStorage.setItem(PENDING_AUTH_ERROR_KEY, trimmed);
}

export function consumePendingAuthError(): string | null {
  if (!isBrowser()) return null;
  const message = sessionStorage.getItem(PENDING_AUTH_ERROR_KEY);
  if (!message) return null;
  sessionStorage.removeItem(PENDING_AUTH_ERROR_KEY);
  return message;
}

export function clearAuthStorage(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  clearPendingVerification();
  clearPendingPasswordReset();
  authClearSyncHandler?.();
}
