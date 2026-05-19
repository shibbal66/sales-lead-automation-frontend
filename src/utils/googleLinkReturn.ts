const PENDING_GOOGLE_LINK_RETURN_KEY = "pending_google_link_return";

export type PendingGoogleLinkReturn = {
  returnTo: string;
};

const isBrowser = () => typeof window !== "undefined";

export function setPendingGoogleLinkReturn(data: PendingGoogleLinkReturn): void {
  if (!isBrowser()) return;
  sessionStorage.setItem(PENDING_GOOGLE_LINK_RETURN_KEY, JSON.stringify(data));
}

export function getPendingGoogleLinkReturn(): PendingGoogleLinkReturn | null {
  if (!isBrowser()) return null;
  const raw = sessionStorage.getItem(PENDING_GOOGLE_LINK_RETURN_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PendingGoogleLinkReturn;
    if (typeof parsed.returnTo === "string" && parsed.returnTo.startsWith("/")) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function clearPendingGoogleLinkReturn(): void {
  if (!isBrowser()) return;
  sessionStorage.removeItem(PENDING_GOOGLE_LINK_RETURN_KEY);
}
