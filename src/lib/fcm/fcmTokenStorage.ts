const FCM_TOKEN_KEY = "fcm_push_token";

const isBrowser = () => typeof window !== "undefined";

export function getStoredFcmToken(): string | null {
  if (!isBrowser()) return null;
  return localStorage.getItem(FCM_TOKEN_KEY);
}

export function setStoredFcmToken(token: string): void {
  if (!isBrowser()) return;
  localStorage.setItem(FCM_TOKEN_KEY, token);
}

export function clearStoredFcmToken(): void {
  if (!isBrowser()) return;
  localStorage.removeItem(FCM_TOKEN_KEY);
}
