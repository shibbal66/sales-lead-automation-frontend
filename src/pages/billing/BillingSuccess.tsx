import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BILLING_SETTINGS_PATH, refreshBillingAfterStripeReturn } from "@/lib/billingReturn";
import { showApiSuccessToast } from "@/lib/apiToast";

export default function BillingSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const completedRef = useRef(false);

  useEffect(() => {
    if (completedRef.current) return;
    completedRef.current = true;

    let cancelled = false;

    void (async () => {
      await refreshBillingAfterStripeReturn();
      if (cancelled) return;

      showApiSuccessToast(
        sessionId
          ? "Payment successful. Your subscription is now active."
          : "Your subscription has been updated."
      );
      navigate(BILLING_SETTINGS_PATH, { replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, sessionId]);

  return (
    <Card className="mx-auto max-w-md p-8 text-center shadow-card">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" aria-hidden />
      <h1 className="mt-4 font-display text-lg font-bold">Confirming your subscription</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Please wait while we sync your plan. You will be redirected to billing settings shortly.
      </p>
    </Card>
  );
}
