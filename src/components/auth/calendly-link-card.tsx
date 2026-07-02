import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getCalendlyLinkStatus } from "@/services/auth/authServices";
import { disconnectCalendlyAccount, startCalendlyOAuthRedirect } from "@/lib/calendlyAuth";
import { formatCalendlyLinkDetail, parseCalendlyLinkStatus } from "@/lib/calendlyLinkStatus";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import type { CalendlyLinkStatusData } from "@/types";

const EMPTY_STATUS: CalendlyLinkStatusData = {
  connected: false,
  email: null,
  schedulingUrl: null,
  webhookActive: false,
  connectedAt: null
};

export function CalendlyLinkCard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [status, setStatus] = useState<CalendlyLinkStatusData>(EMPTY_STATUS);
  const [detail, setDetail] = useState("");

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getCalendlyLinkStatus();
      const parsed = parseCalendlyLinkStatus(response);
      setStatus(parsed);
      setDetail(formatCalendlyLinkDetail(parsed, response.message));
    } catch (error) {
      setStatus(EMPTY_STATUS);
      setDetail("Could not load Calendly link status.");
      showApiErrorToast(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  useEffect(() => {
    const calendly = searchParams.get("calendly");
    if (!calendly) return;

    if (calendly === "connected") {
      showApiSuccessToast("Calendly account connected.");
      void loadStatus();
    } else if (calendly === "error") {
      showApiErrorToast("Could not connect Calendly account.");
    }

    const next = new URLSearchParams(searchParams);
    next.delete("calendly");
    setSearchParams(next, { replace: true });
  }, [loadStatus, searchParams, setSearchParams]);

  const handleConnect = () => {
    setConnecting(true);
    void startCalendlyOAuthRedirect().finally(() => setConnecting(false));
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    try {
      await disconnectCalendlyAccount();
    } finally {
      await loadStatus();
      setDisconnecting(false);
    }
  };

  return (
    <Card className="p-6 shadow-card">
      <h3 className="font-display text-lg font-bold">Calendly account</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Link Calendly to sync scheduling and meeting webhooks.
      </p>
      <div className="mt-4 space-y-4 rounded-xl border border-border bg-surface/40 p-4">
        <div className="min-w-0">
          <p className="font-semibold">{status.connected ? "Linked" : "Not linked"}</p>
          <p className="text-xs text-muted-foreground">
            {loading ? <Skeleton className="mt-1 h-3 w-56 max-w-full" /> : detail}
          </p>
        </div>
        {!loading && !status.connected ? (
          <Button
            type="button"
            className="w-full"
            disabled={connecting}
            onClick={handleConnect}
          >
            <Calendar className="h-4 w-4" />
            {connecting ? "Redirecting…" : "Connect Calendly"}
          </Button>
        ) : null}
        {!loading && status.connected ? (
          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled={disconnecting}
            onClick={() => void handleDisconnect()}
          >
            {disconnecting ? "Disconnecting…" : "Disconnect Calendly"}
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
