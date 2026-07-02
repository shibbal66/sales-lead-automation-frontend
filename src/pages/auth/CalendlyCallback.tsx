import { useLayoutEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/auth/auth-layout";
import {
  buildCalendlySettingsReturnLocation,
  redirectToCalendlyApiCallback,
  resolveCalendlyIncomingCallback
} from "@/lib/calendlyAuth";

export default function CalendlyCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [configError, setConfigError] = useState<string | null>(null);

  useLayoutEffect(() => {
    const action = resolveCalendlyIncomingCallback(searchParams);

    if (action.type === "return-settings") {
      navigate(buildCalendlySettingsReturnLocation(action.returnInfo.status, action.returnInfo.message), {
        replace: true
      });
      return;
    }

    if (!import.meta.env.VITE_API_BASE_URL?.trim()) {
      setConfigError("API URL is not configured. Set VITE_API_BASE_URL and redeploy.");
      return;
    }

    redirectToCalendlyApiCallback(action.searchParams);
  }, [navigate, searchParams]);

  return (
    <AuthLayout
      headline="Connecting your Calendly account"
      subheadline="Please wait while we finish authorization."
    >
      <div className="py-12 text-center">
        {configError ? (
          <p className="text-sm text-destructive">{configError}</p>
        ) : (
          <p className="text-sm text-muted-foreground">Completing Calendly connection…</p>
        )}
      </div>
    </AuthLayout>
  );
}
