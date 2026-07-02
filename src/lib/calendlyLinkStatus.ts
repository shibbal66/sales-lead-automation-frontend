import type {
  CalendlyConnectResponse,
  CalendlyLinkStatusData,
  CalendlyLinkStatusResponse
} from "@/types";

export function parseCalendlyConnectAuthUrl(response: CalendlyConnectResponse): string | null {
  if (!response.success || !response.data) return null;

  const raw = response.data as { authUrl?: string; auth_url?: string };
  const authUrl = raw.authUrl ?? raw.auth_url;
  const trimmed = typeof authUrl === "string" ? authUrl.trim() : "";
  return trimmed || null;
}

export function parseCalendlyLinkStatus(response: CalendlyLinkStatusResponse): CalendlyLinkStatusData {
  if (!response.success || !response.data) {
    return {
      connected: false,
      email: null,
      schedulingUrl: null,
      webhookActive: false,
      connectedAt: null
    };
  }

  return {
    connected: Boolean(response.data.connected),
    email: response.data.email ?? null,
    schedulingUrl: response.data.schedulingUrl ?? null,
    webhookActive: Boolean(response.data.webhookActive),
    connectedAt: response.data.connectedAt ?? null
  };
}

export function formatCalendlyLinkDetail(
  status: CalendlyLinkStatusData,
  fallbackMessage?: string
): string {
  if (!status.connected) {
    return fallbackMessage?.trim() || "Calendly account is not linked.";
  }

  const parts: string[] = [];
  if (status.email) parts.push(status.email);
  if (status.schedulingUrl) parts.push(status.schedulingUrl);
  parts.push(status.webhookActive ? "Webhook active" : "Webhook inactive");

  return parts.join(" · ") || "Connected";
}
