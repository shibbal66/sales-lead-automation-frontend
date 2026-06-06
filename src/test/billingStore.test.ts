import { beforeEach, describe, expect, it, vi } from "vitest";

const getBillingSubscription = vi.fn();
const getBillingPlans = vi.fn();
const getBillingPaymentMethods = vi.fn();
const getBillingQuota = vi.fn();

vi.mock("@/services/billing/billingServices", () => ({
  getBillingSubscription: () => getBillingSubscription(),
  getBillingPlans: () => getBillingPlans(),
  getBillingPaymentMethods: () => getBillingPaymentMethods(),
  getBillingQuota: () => getBillingQuota(),
  deleteBillingPaymentMethod: vi.fn(),
  postBillingCancel: vi.fn(),
  postBillingCheckout: vi.fn(),
  postBillingDowngrade: vi.fn(),
  postBillingPortal: vi.fn(),
  postBillingReactivate: vi.fn(),
  postBillingSetDefaultPaymentMethod: vi.fn(),
  postBillingUpgrade: vi.fn()
}));

vi.mock("@/lib/apiToast", () => ({
  showApiErrorToast: vi.fn(),
  showApiSuccessToast: vi.fn()
}));

const subscription = {
  planId: "plan-1",
  stripeSubscriptionId: "sub_1",
  plan: { id: "plan-1", name: "Pro", price: 49, interval: "month" as const }
};

describe("billingStore fetch deduplication", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    getBillingSubscription.mockResolvedValue({
      success: true,
      data: { subscription }
    });
    getBillingPlans.mockResolvedValue({
      success: true,
      data: { plans: [{ id: "plan-1", name: "Pro", price: 49, interval: "month" }] }
    });
    getBillingPaymentMethods.mockResolvedValue({
      success: true,
      data: { paymentMethods: [{ id: "pm_1", brand: "visa", last4: "4242", expMonth: 12, expYear: 2030, isDefault: true }] }
    });
    getBillingQuota.mockResolvedValue({
      success: true,
      data: {
        quota: {
          plan: { id: "growth", name: "Advanced Plan" },
          campaigns: { limit: 15, used: 2, available: 13 },
          leadsPerCampaign: { limit: 500, campaigns: [] },
          dailyEmails: { limit: 500, used: 0, available: 500 }
        }
      }
    });
  });

  it("does not refetch subscription when app shell already hydrated it", async () => {
    const { useBillingStore } = await import("@/store/billing/billingStore");

    await useBillingStore.getState().fetchSubscription();
    await useBillingStore.getState().fetchBillingData();

    expect(getBillingSubscription).toHaveBeenCalledTimes(1);
    expect(getBillingPlans).toHaveBeenCalledTimes(1);
    expect(getBillingPaymentMethods).toHaveBeenCalledTimes(1);
    expect(getBillingQuota).not.toHaveBeenCalled();
  });

  it("always refetches quota via fetchBillingQuota", async () => {
    const { useBillingStore } = await import("@/store/billing/billingStore");

    await useBillingStore.getState().fetchBillingQuota();
    await useBillingStore.getState().fetchBillingQuota();

    expect(getBillingQuota).toHaveBeenCalledTimes(2);
  });

  it("dedupes concurrent fetchBillingData calls", async () => {
    const { useBillingStore } = await import("@/store/billing/billingStore");

    await Promise.all([
      useBillingStore.getState().fetchBillingData(),
      useBillingStore.getState().fetchBillingData()
    ]);

    expect(getBillingPlans).toHaveBeenCalledTimes(1);
    expect(getBillingPaymentMethods).toHaveBeenCalledTimes(1);
    expect(getBillingQuota).not.toHaveBeenCalled();
  });
});
