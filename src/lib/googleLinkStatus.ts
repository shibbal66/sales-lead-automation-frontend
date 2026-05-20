import type { GoogleLinkStatusResponse } from "@/types";

export function parseGoogleLinkStatus(response: GoogleLinkStatusResponse): {
  linked: boolean;
  calendarLinked: boolean;
  email?: string;
  name?: string;
} {
  if (!response.success || !response.data) {
    return { linked: false, calendarLinked: false };
  }
  const { linked, email, name, calendarLinked } = response.data;
  return {
    linked: Boolean(linked),
    calendarLinked: Boolean(calendarLinked),
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
