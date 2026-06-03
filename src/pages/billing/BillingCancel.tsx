import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { BILLING_SETTINGS_PATH, refreshBillingAfterStripeReturn } from "@/lib/billingReturn";
import { toast } from "@/components/ui/sonner";

export default function BillingCancel() {
  const navigate = useNavigate();
  const completedRef = useRef(false);

  useEffect(() => {
    if (completedRef.current) return;
    completedRef.current = true;

    let cancelled = false;

    void (async () => {
      await refreshBillingAfterStripeReturn();
      if (cancelled) return;

      toast.info("Checkout was canceled. No changes were made to your subscription.");
      navigate(BILLING_SETTINGS_PATH, { replace: true });
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  return (
    <Card className="mx-auto max-w-md p-8 text-center shadow-card">
      <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" aria-hidden />
      <h1 className="mt-4 font-display text-lg font-bold">Returning to settings</h1>
      <p className="mt-2 text-sm text-muted-foreground">Redirecting you back to billing…</p>
    </Card>
  );
}
