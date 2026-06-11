export interface BillingPlan {
  id: string;
  name: string;
  priceCents: number;
  currency: string;
  billingInterval: string;
  maxCampaigns: number;
  maxLeadsPerCampaign: number;
  sortOrder: number;
}

export interface BillingSubscriptionLimits {
  maxCampaigns: number;
  maxLeadsPerCampaign: number;
}

export interface BillingSubscription {
  planId: string;
  plan: BillingPlan;
  status: string;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  limits: BillingSubscriptionLimits;
}

export interface BillingCheckoutSessionData {
  checkoutUrl: string;
  sessionId: string;
}

export interface GetBillingPlansResponse {
  success: boolean;
  message?: string;
  data?: {
    plans: BillingPlan[];
  };
}

export interface GetBillingSubscriptionResponse {
  success: boolean;
  message?: string;
  data?: {
    subscription: BillingSubscription;
  };
}

export interface BillingPlanIdRequest {
  planId: string;
}

export interface BillingCheckoutResponse {
  success: boolean;
  message?: string;
  data?: BillingCheckoutSessionData;
}

export type BillingUpgradeResponse = BillingCheckoutResponse;

export interface BillingSubscriptionUpdateData {
  subscription: BillingSubscription;
  cancelAtPeriodEnd: boolean;
}

export interface BillingDowngradeResponse {
  success: boolean;
  message?: string;
  data?: BillingSubscriptionUpdateData;
}

export interface BillingCancelResponse {
  success: boolean;
  message?: string;
  data?: BillingSubscriptionUpdateData;
}

export interface BillingReactivateResponse {
  success: boolean;
  message?: string;
  data?: {
    subscription: BillingSubscription;
    reactivated: boolean;
  };
}

export interface BillingPortalResponse {
  success: boolean;
  message?: string;
  data?: {
    /** Stripe customer portal URL (preferred API field). */
    url?: string;
    /** Legacy alias for `url`. */
    portalUrl?: string;
  };
}

export interface BillingPaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export interface GetBillingPaymentMethodsResponse {
  success: boolean;
  message?: string;
  data?: {
    paymentMethods: BillingPaymentMethod[];
  };
}

export interface SetDefaultPaymentMethodRequest {
  paymentMethodId: string;
}

export type SetDefaultPaymentMethodResponse = GetBillingPaymentMethodsResponse;

export type DeletePaymentMethodResponse = GetBillingPaymentMethodsResponse;

export interface BillingQuotaUsage {
  limit: number;
  used: number;
  available: number;
}

export interface BillingQuotaCampaignLeads {
  campaignId: string;
  campaignName: string;
  limit: number;
  used: number;
  available: number;
}

export interface BillingQuota {
  plan: {
    id: string;
    name: string;
  };
  campaigns: BillingQuotaUsage;
  leadsPerCampaign: {
    limit: number;
    campaigns: BillingQuotaCampaignLeads[];
  };
  dailyEmails: BillingQuotaUsage;
}

export interface GetBillingQuotaResponse {
  success: boolean;
  message?: string;
  data?: {
    quota: BillingQuota;
  };
}
