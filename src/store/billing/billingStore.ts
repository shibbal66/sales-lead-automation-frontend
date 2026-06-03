import { create } from "zustand";
import { getBillingSubscription } from "@/services/billing/billingServices";
import { subscriptionAfterCancel } from "@/lib/billing";
import { showApiErrorToast } from "@/lib/apiToast";
import type { BillingSubscription } from "@/types/billing";

interface BillingStoreState {
  subscription: BillingSubscription | null;
  isFetchingSubscription: boolean;
  subscriptionHydrated: boolean;
  fetchSubscription: (options?: { force?: boolean; treatAsCancel?: boolean }) => Promise<void>;
  setSubscription: (subscription: BillingSubscription | null) => void;
  invalidateSubscription: () => void;
}

export const useBillingStore = create<BillingStoreState>((set, get) => ({
  subscription: null,
  isFetchingSubscription: false,
  subscriptionHydrated: false,

  setSubscription: (subscription) => {
    set({ subscription, subscriptionHydrated: true });
  },

  invalidateSubscription: () => {
    set({ subscriptionHydrated: false });
  },

  fetchSubscription: async (options = {}) => {
    if (!options.force && get().subscriptionHydrated) {
      return;
    }

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
    }
  }
}));
