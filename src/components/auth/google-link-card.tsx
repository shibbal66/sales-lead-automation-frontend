import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getGoogleLinkStatus } from "@/services/auth/authServices";
import { startGoogleOAuthRedirect } from "@/lib/googleAuth";
import { showApiErrorToast } from "@/lib/apiToast";

function formatStatusDetail(data: unknown, message?: string): string {
  if (typeof data === "string" && data.trim()) return data.trim();
  if (message?.trim()) return message.trim();
  return "Connected";
}

export function GoogleLinkCard() {
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [linked, setLinked] = useState(false);
  const [detail, setDetail] = useState("");

  const loadStatus = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getGoogleLinkStatus();
      if (response.success) {
        setLinked(true);
        setDetail(formatStatusDetail(response.data, response.message));
      } else {
        setLinked(false);
        setDetail(response.message || "Google account is not linked.");
      }
    } catch (error) {
      setLinked(false);
      setDetail("Could not load Google link status.");
      showApiErrorToast(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const handleConnect = () => {
    setConnecting(true);
    startGoogleOAuthRedirect();
  };

  return (
    <Card className="p-6 shadow-card">
      <h3 className="font-display text-lg font-bold">Google account</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Link Google for sign-in and connected inbox features.
      </p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-surface/40 p-4">
        <div className="min-w-0">
          <p className="font-semibold">{linked ? "Linked" : "Not linked"}</p>
          <p className="text-xs text-muted-foreground">{loading ? "Checking status…" : detail}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={loading} onClick={() => void loadStatus()}>
            Refresh
          </Button>
          {!linked ? (
            <Button size="sm" disabled={loading || connecting} onClick={handleConnect}>
              {connecting ? "Redirecting…" : "Connect Google"}
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
