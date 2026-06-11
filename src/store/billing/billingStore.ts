import { create } from "zustand";
import {
  getBillingPlanAction,
  sortBillingPlans,
  sortPaymentMethods,
  subscriptionAfterCancel
} from "@/lib/billing";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import {
  deleteBillingPaymentMethod,
  getBillingPaymentMethods,
  getBillingPlans,
  getBillingQuota,
  getBillingSubscription,
  postBillingCancel,
  postBillingCheckout,
  postBillingDowngrade,
  postBillingPortal,
  postBillingReactivate,
  postBillingSetDefaultPaymentMethod,
  postBillingUpgrade
} from "@/services/billing/billingServices";
import type { BillingPaymentMethod, BillingPlan, BillingQuota, BillingSubscription } from "@/types/billing";

let subscriptionInflight: Promise<void> | null = null;
let billingDataInflight: Promise<void> | null = null;
let quotaInflight: Promise<void> | null = null;

interface BillingStoreState {
  subscription: BillingSubscription | null;
  plans: BillingPlan[];
  paymentMethods: BillingPaymentMethod[];
  quota: BillingQuota | null;
  isFetchingSubscription: boolean;
  isFetchingBillingData: boolean;
  isFetchingQuota: boolean;
  subscriptionHydrated: boolean;
  billingDataHydrated: boolean;
  actionPlanId: string | null;
  isCanceling: boolean;
  isReactivating: boolean;
  isOpeningPortal: boolean;
  defaultPaymentMethodId: string | null;
  deletingPaymentMethodId: string | null;
  fetchSubscription: (options?: { force?: boolean; treatAsCancel?: boolean }) => Promise<void>;
  fetchBillingData: (options?: { force?: boolean }) => Promise<void>;
  fetchBillingQuota: () => Promise<void>;
  setSubscription: (subscription: BillingSubscription | null) => void;
  invalidateSubscription: () => void;
  invalidateBillingData: () => void;
  runPlanAction: (planId: string) => Promise<void>;
  cancelSubscription: () => Promise<boolean>;
  reactivateSubscription: () => Promise<boolean>;
  openBillingPortal: () => Promise<void>;
  setDefaultPaymentMethod: (paymentMethodId: string) => Promise<void>;
  deletePaymentMethod: (paymentMethodId: string) => Promise<void>;
}

export const useBillingStore = create<BillingStoreState>((set, get) => ({
  subscription: null,
  plans: [],
  paymentMethods: [],
  quota: null,
  isFetchingSubscription: false,
  isFetchingBillingData: false,
  isFetchingQuota: false,
  subscriptionHydrated: false,
  billingDataHydrated: false,
  actionPlanId: null,
  isCanceling: false,
  isReactivating: false,
  isOpeningPortal: false,
  defaultPaymentMethodId: null,
  deletingPaymentMethodId: null,

  setSubscription: (subscription) => {
    set({ subscription, subscriptionHydrated: true });
  },

  invalidateSubscription: () => {
    set({ subscriptionHydrated: false });
  },

  invalidateBillingData: () => {
    set({ billingDataHydrated: false, quota: null });
  },

  fetchBillingQuota: async () => {
    if (quotaInflight) return quotaInflight;

    quotaInflight = (async () => {
      set({ isFetchingQuota: true });
      try {
        const response = await getBillingQuota();
        if (response.success && response.data?.quota) {
          set({ quota: response.data.quota });
          return;
        }
        if (!response.success) {
          showApiErrorToast(response);
        }
      } catch (error) {
        showApiErrorToast(error);
      } finally {
        set({ isFetchingQuota: false });
        quotaInflight = null;
      }
    })();

    return quotaInflight;
  },

  fetchSubscription: async (options = {}) => {
    if (!options.force && get().subscriptionHydrated) return;
    if (subscriptionInflight) return subscriptionInflight;

    subscriptionInflight = (async () => {
      set({ isFetchingSubscription: true });
      try {
        const response = await getBillingSubscription();
        if (response.success && response.data?.subscription) {
          let next = response.data.subscription;
          if (options.treatAsCancel) {
            next = subscriptionAfterCancel(next);
          }
          set({ subscription: next, subscriptionHydrated: true });
          return;
        }
        showApiErrorToast(response);
      } catch (error) {
        showApiErrorToast(error);
      } finally {
        set({ isFetchingSubscription: false });
        subscriptionInflight = null;
      }
    })();

    return subscriptionInflight;
  },

  fetchBillingData: async (options = {}) => {
    if (!options.force && get().billingDataHydrated) return;
    if (billingDataInflight) return billingDataInflight;

    billingDataInflight = (async () => {
      set({ isFetchingBillingData: true });
      try {
        const [plansResponse, , paymentMethodsResponse] = await Promise.all([
          getBillingPlans(),
          get().fetchSubscription({ force: options.force }),
          getBillingPaymentMethods()
        ]);

        if (plansResponse.success && plansResponse.data?.plans) {
          set({ plans: sortBillingPlans(plansResponse.data.plans) });
        } else {
          showApiErrorToast(plansResponse);
        }

        if (paymentMethodsResponse.success && paymentMethodsResponse.data?.paymentMethods) {
          set({ paymentMethods: sortPaymentMethods(paymentMethodsResponse.data.paymentMethods) });
        } else if (!paymentMethodsResponse.success) {
          set({ paymentMethods: [] });
          showApiErrorToast(paymentMethodsResponse);
        }

        set({ billingDataHydrated: true });
      } catch (error) {
        showApiErrorToast(error);
      } finally {
        set({ isFetchingBillingData: false });
        billingDataInflight = null;
      }
    })();

    return billingDataInflight;
  },

  runPlanAction: async (planId) => {
    const { plans, subscription, actionPlanId, isCanceling, isReactivating } = get();
    const plan = plans.find((p) => p.id === planId);
    const hasStripeSubscription = Boolean(subscription?.stripeSubscriptionId);
    const currentPlanId = subscription?.planId;
    const action = plan
      ? getBillingPlanAction(plan, { currentPlanId, plans, hasStripeSubscription })
      : "unavailable";

    if (
      !plan ||
      action === "current" ||
      action === "unavailable" ||
      actionPlanId ||
      isCanceling ||
      isReactivating
    ) {
      return;
    }

    set({ actionPlanId: planId });
    try {
      if (action === "downgrade") {
        const response = await postBillingDowngrade(planId);
        if (response.success) {
          if (response.message) showApiSuccessToast(response.message);
          await get().fetchSubscription({ force: true });
          await get().fetchBillingQuota();
          return;
        }
        showApiErrorToast(response);
        return;
      }

      if (action === "checkout") {
        const response = await postBillingCheckout(planId);
        if (response.success && response.data?.checkoutUrl) {
          if (response.message) showApiSuccessToast(response.message);
          window.location.assign(response.data.checkoutUrl);
          return;
        }
        showApiErrorToast(response);
        return;
      }

      const response = await postBillingUpgrade(planId);
      if (response.success) {
        if (response.message) showApiSuccessToast(response.message);
        await get().fetchSubscription({ force: true });
        await get().fetchBillingQuota();
        if (response.data?.checkoutUrl) {
          window.location.assign(response.data.checkoutUrl);
        }
        return;
      }
      showApiErrorToast(response);
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      set({ actionPlanId: null });
    }
  },

  cancelSubscription: async () => {
    const { subscription, isCanceling, isReactivating, actionPlanId } = get();
    if (!subscription || isCanceling || isReactivating || actionPlanId) return false;

    set({ isCanceling: true });
    try {
      const response = await postBillingCancel();
      if (response.success) {
        if (response.message) showApiSuccessToast(response.message);
        if (response.data?.subscription) {
          set({ subscription: subscriptionAfterCancel(response.data.subscription) });
        }
        await get().fetchSubscription({ force: true, treatAsCancel: true });
        return true;
      }
      showApiErrorToast(response);
      return false;
    } catch (error) {
      showApiErrorToast(error);
      return false;
    } finally {
      set({ isCanceling: false });
    }
  },

  reactivateSubscription: async () => {
    const { subscription, isCanceling, isReactivating, actionPlanId } = get();
    if (!subscription || isCanceling || isReactivating || actionPlanId) return false;

    set({ isReactivating: true });
    try {
      const response = await postBillingReactivate();
      if (response.success) {
        if (response.message) showApiSuccessToast(response.message);
        if (response.data?.subscription) {
          set({ subscription: response.data.subscription });
        }
        await get().fetchSubscription({ force: true });
        return true;
      }
      showApiErrorToast(response);
      return false;
    } catch (error) {
      showApiErrorToast(error);
      return false;
    } finally {
      set({ isReactivating: false });
    }
  },

  openBillingPortal: async () => {
    if (get().isOpeningPortal) return;

    set({ isOpeningPortal: true });
    try {
      const response = await postBillingPortal();
      const portalUrl = response.data?.url ?? response.data?.portalUrl;
      if (response.success && portalUrl) {
        if (response.message) showApiSuccessToast(response.message);
        window.location.assign(portalUrl);
        return;
      }
      showApiErrorToast(response);
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      set({ isOpeningPortal: false });
    }
  },

  setDefaultPaymentMethod: async (paymentMethodId) => {
    const { defaultPaymentMethodId, deletingPaymentMethodId } = get();
    if (defaultPaymentMethodId || deletingPaymentMethodId) return;

    set({ defaultPaymentMethodId: paymentMethodId });
    try {
      const response = await postBillingSetDefaultPaymentMethod(paymentMethodId);
      if (response.success && response.data?.paymentMethods) {
        set({ paymentMethods: sortPaymentMethods(response.data.paymentMethods) });
        if (response.message) showApiSuccessToast(response.message);
        return;
      }
      showApiErrorToast(response);
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      set({ defaultPaymentMethodId: null });
    }
  },

  deletePaymentMethod: async (paymentMethodId) => {
    const { paymentMethods, defaultPaymentMethodId, deletingPaymentMethodId } = get();
    const method = paymentMethods.find((m) => m.id === paymentMethodId);
    if (!method || defaultPaymentMethodId || deletingPaymentMethodId) return;

    set({ deletingPaymentMethodId: paymentMethodId });
    try {
      const response = await deleteBillingPaymentMethod(paymentMethodId);
      if (response.success) {
        if (response.data?.paymentMethods) {
          set({ paymentMethods: sortPaymentMethods(response.data.paymentMethods) });
        } else {
          const refreshed = await getBillingPaymentMethods();
          if (refreshed.success && refreshed.data?.paymentMethods) {
            set({ paymentMethods: sortPaymentMethods(refreshed.data.paymentMethods) });
          }
        }
        if (response.message) showApiSuccessToast(response.message);
        return;
      }
      showApiErrorToast(response);
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      set({ deletingPaymentMethodId: null });
    }
  }
}));
