import { useCallback, useEffect, useState } from "react";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getGoogleLinkStatus } from "@/services/auth/authServices";
import { startGoogleOAuthRedirect } from "@/lib/googleAuth";
import { formatGoogleLinkDetail, parseGoogleLinkStatus } from "@/lib/googleLinkStatus";
import { formatGoogleLinkFromUserApi } from "@/lib/userProfile";
import { showApiErrorToast } from "@/lib/apiToast";
import type { UserGoogleLinkData } from "@/types/user";

type GoogleLinkCardProps = {
  /** When provided (e.g. from GET /user), skips the separate status request. */
  linkStatus?: UserGoogleLinkData | null;
  statusLoading?: boolean;
};

function googleLinkHeading(linked: boolean, calendarLinked: boolean): string {
  if (!linked) return "Not linked";
  if (!calendarLinked) return "Calendar not linked";
  return "Linked";
}

function needsGoogleConnect(linked: boolean, calendarLinked: boolean): boolean {
  return !linked || !calendarLinked;
}

export function GoogleLinkCard({ linkStatus, statusLoading }: GoogleLinkCardProps) {
  const useExternalStatus = linkStatus !== undefined;
  const [loading, setLoading] = useState(!useExternalStatus);
  const [connecting, setConnecting] = useState(false);
  const [linked, setLinked] = useState(linkStatus?.linked ?? false);
  const [calendarLinked, setCalendarLinked] = useState(Boolean(linkStatus?.calendarLinked));
  const [detail, setDetail] = useState("");

  const applyExternalStatus = useCallback((status: UserGoogleLinkData | null | undefined) => {
    setLinked(Boolean(status?.linked));
    setCalendarLinked(Boolean(status?.calendarLinked));
    setDetail(formatGoogleLinkFromUserApi(status ?? undefined));
  }, []);

  const loadStatus = useCallback(async () => {
    if (useExternalStatus) return;
    setLoading(true);
    try {
      const response = await getGoogleLinkStatus();
      const status = parseGoogleLinkStatus(response);
      setLinked(status.linked);
      setCalendarLinked(status.calendarLinked);
      setDetail(formatGoogleLinkDetail(status.linked, status.email, status.name, response.message));
    } catch (error) {
      setLinked(false);
      setCalendarLinked(false);
      setDetail("Could not load Google link status.");
      showApiErrorToast(error);
    } finally {
      setLoading(false);
    }
  }, [useExternalStatus]);

  useEffect(() => {
    if (useExternalStatus) {
      applyExternalStatus(linkStatus);
      return;
    }
    void loadStatus();
  }, [applyExternalStatus, linkStatus, loadStatus, useExternalStatus]);

  const handleConnect = () => {
    setConnecting(true);
    startGoogleOAuthRedirect();
  };

  const isLoading = useExternalStatus ? Boolean(statusLoading) : loading;
  const showConnectButton = !isLoading && needsGoogleConnect(linked, calendarLinked);

  return (
    <Card className="p-6 shadow-card">
      <h3 className="font-display text-lg font-bold">Google account</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Link Google for sign-in and connected inbox features.
      </p>
      <div className="mt-4 space-y-4 rounded-xl border border-border bg-surface/40 p-4">
        <div className="min-w-0">
          <p className="font-semibold">{googleLinkHeading(linked, calendarLinked)}</p>
          <p className="text-xs text-muted-foreground">
            {isLoading ? <Skeleton className="mt-1 h-3 w-48 max-w-full" /> : detail}
          </p>
        </div>
        {showConnectButton ? (
          <GoogleAuthButton
            className="w-full"
            loading={connecting}
            onClick={handleConnect}
            label="Continue with Google"
          />
        ) : null}
      </div>
    </Card>
  );
}
