import type {
  CalendlyConnectResponse,
  CalendlyLinkStatusData,
  CalendlyLinkStatusResponse
} from "@/types";

export const EMPTY_CALENDLY_LINK_STATUS: CalendlyLinkStatusData = {
  connected: false,
  email: null,
  schedulingUrl: null,
  webhookActive: false,
  connectedAt: null
};

export function parseCalendlyConnectAuthUrl(response: CalendlyConnectResponse): string | null {
  if (!response.success || !response.data) return null;

  const raw = response.data as { authUrl?: string; auth_url?: string };
  const authUrl = raw.authUrl ?? raw.auth_url;
  const trimmed = typeof authUrl === "string" ? authUrl.trim() : "";
  return trimmed || null;
}

export function parseCalendlyLinkStatus(response: CalendlyLinkStatusResponse): CalendlyLinkStatusData {
  if (!response.success || !response.data) {
    return EMPTY_CALENDLY_LINK_STATUS;
  }

  const raw = response.data as CalendlyLinkStatusData & {
    scheduling_url?: string | null;
    webhook_active?: boolean;
    connected_at?: string | null;
  };

  return {
    connected: Boolean(raw.connected),
    email: raw.email ?? null,
    schedulingUrl: raw.schedulingUrl ?? raw.scheduling_url ?? null,
    webhookActive: Boolean(raw.webhookActive ?? raw.webhook_active),
    connectedAt: raw.connectedAt ?? raw.connected_at ?? null
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
