import type { AuthUser } from "@/core/types/user.types";

const AUTH_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const USER_KEY = "user";
const PENDING_VERIFY_KEY = "pending_verify";

const isBrowser = () => typeof window !== "undefined";

export function getAuthToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) return null;
  // Keep refresh token in session storage to reduce persistence risk.
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
}

export function setRefreshToken(token: string): void {
  if (!isBrowser()) return;
  sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
}

export function setStoredUser(user: AuthUser): void {
  if (!isBrowser()) return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function setPendingVerification(data: { userId: string; email: string }): void {
  if (!isBrowser()) return;
  sessionStorage.setItem(PENDING_VERIFY_KEY, JSON.stringify(data));
}

export function getPendingVerification(): { userId: string; email: string } | null {
  if (!isBrowser()) return null;
  const raw = sessionStorage.getItem(PENDING_VERIFY_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as { userId: string; email: string };
  } catch {
    return null;
  }
}

export function clearPendingVerification(): void {
  if (!isBrowser()) return;
  sessionStorage.removeItem(PENDING_VERIFY_KEY);
}

export function clearAuthStorage(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  clearPendingVerification();
}
