import { useBillingStore } from "@/store/billing/billingStore";

export const BILLING_SETTINGS_PATH = "/settings?tab=billing";

export async function refreshBillingAfterStripeReturn(): Promise<void> {
  const { fetchSubscription, fetchBillingQuota } = useBillingStore.getState();
  await fetchSubscription({ force: true });
  await fetchBillingQuota();
}
