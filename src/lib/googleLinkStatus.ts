import type { GoogleLinkStatusResponse } from "@/types";

export function parseGoogleLinkStatus(response: GoogleLinkStatusResponse): {
  linked: boolean;
  email?: string;
  name?: string;
} {
  if (!response.success || !response.data) {
    return { linked: false };
  }
  const { linked, email, name } = response.data;
  return {
    linked: Boolean(linked),
    email,
    name
  };
}

export function formatGoogleLinkDetail(
  linked: boolean,
  email?: string,
  name?: string,
  fallbackMessage?: string
): string {
  if (linked) {
    return email ?? name ?? "Connected";
  }
  return fallbackMessage?.trim() || "Google account is not linked.";
}
