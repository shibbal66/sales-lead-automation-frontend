import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/auth/auth-layout";
import { completeCalendlyOAuthFromCallback } from "@/lib/calendlyAuth";

export default function CalendlyCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    void completeCalendlyOAuthFromCallback(searchParams, navigate);
  }, [navigate, searchParams]);

  return (
    <AuthLayout
      headline="Connecting your Calendly account"
      subheadline="Please wait while we finish authorization."
    >
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">Completing Calendly connection…</p>
      </div>
    </AuthLayout>
  );
}
