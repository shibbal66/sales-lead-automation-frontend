import type { BillingPaymentMethod, BillingPlan, BillingSubscription } from "@/types/billing";

export function formatBillingPlanPrice(plan: Pick<BillingPlan, "priceCents" | "currency">): string {
  if (plan.priceCents === 0) return "Free";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: plan.currency.toUpperCase(),
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(plan.priceCents / 100);
}

export function formatBillingInterval(interval: string): string {
  if (interval === "month") return "/mo";
  if (interval === "year") return "/yr";
  return `/${interval}`;
}

export function sortBillingPlans(plans: BillingPlan[]): BillingPlan[] {
  return [...plans].sort((a, b) => a.sortOrder - b.sortOrder);
}

export function formatBillingPlanBillingLine(plan: Pick<BillingPlan, "priceCents" | "currency" | "billingInterval">): string {
  const intervalLabel = plan.billingInterval === "month" ? "monthly" : plan.billingInterval;
  if (plan.priceCents === 0) return `Free · billed ${intervalLabel}`;
  return `${formatBillingPlanPrice(plan)}${formatBillingInterval(plan.billingInterval)} · billed ${intervalLabel}`;
}

/** Use checkout when there is no Stripe subscription yet; otherwise upgrade. */
export function shouldUseBillingCheckout(subscription: BillingSubscription | null | undefined): boolean {
  return !subscription?.stripeSubscriptionId;
}

export function getNextBillingPlan(plans: BillingPlan[], currentPlanId: string | undefined): BillingPlan | null {
  if (!currentPlanId) return plans[0] ?? null;
  const current = plans.find((p) => p.id === currentPlanId);
  if (!current) return plans[0] ?? null;
  return plans.find((p) => p.sortOrder > current.sortOrder) ?? null;
}

export type BillingPlanAction = "current" | "checkout" | "upgrade" | "downgrade" | "unavailable";

export function getBillingPlanAction(
  plan: BillingPlan,
  options: { currentPlanId?: string; plans: BillingPlan[]; hasStripeSubscription: boolean }
): BillingPlanAction {
  if (plan.id === options.currentPlanId) return "current";

  const current = options.plans.find((p) => p.id === options.currentPlanId);
  if (!current) return options.hasStripeSubscription ? "upgrade" : "checkout";

  if (plan.sortOrder > current.sortOrder) {
    return options.hasStripeSubscription ? "upgrade" : "checkout";
  }
  if (plan.sortOrder < current.sortOrder) {
    return options.hasStripeSubscription ? "downgrade" : "unavailable";
  }
  return "unavailable";
}

export function getBillingPlanButtonLabel(plan: BillingPlan, action: BillingPlanAction): string {
  switch (action) {
    case "current":
      return "Current Plan";
    case "checkout":
      return plan.priceCents === 0 ? `Get ${plan.name}` : `${plan.name}`;
    case "upgrade":
      return `${plan.name}`;
    case "downgrade":
      return `Downgrade`;
    default:
      return "Unavailable";
  }
}

export function getBillingPlanActionLoadingLabel(action: BillingPlanAction): string {
  if (action === "downgrade") return "Processing...";
  if (action === "checkout" || action === "upgrade") return "Redirecting...";
  return "";
}

const PAYMENT_METHOD_BRAND_LABELS: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "American Express",
  discover: "Discover",
  diners: "Diners Club",
  jcb: "JCB",
  unionpay: "UnionPay"
};

export function formatPaymentMethodBrand(brand: string): string {
  const normalized = brand.trim().toLowerCase();
  return PAYMENT_METHOD_BRAND_LABELS[normalized] ?? brand.charAt(0).toUpperCase() + brand.slice(1);
}

export function formatPaymentMethodExpiry(expMonth: number, expYear: number): string {
  return `${String(expMonth).padStart(2, "0")}/${String(expYear).slice(-2)}`;
}

export function sortPaymentMethods<T extends { isDefault: boolean }>(methods: T[]): T[] {
  return [...methods].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
}

export function canDeletePaymentMethod(
  method: BillingPaymentMethod,
  methods: BillingPaymentMethod[]
): boolean {
  return methods.length > 1 && !method.isDefault;
}

export function canOpenBillingPortal(subscription: BillingSubscription | null | undefined): boolean {
  return Boolean(subscription?.stripeSubscriptionId);
}

export function canCancelPaidSubscription(subscription: BillingSubscription | null | undefined): boolean {
  if (!subscription?.stripeSubscriptionId) return false;
  if (subscription.plan.priceCents <= 0) return false;
  return !subscription.cancelAtPeriodEnd;
}

/** Scheduled full cancellation (not a pending downgrade). */
export function canReactivateSubscription(subscription: BillingSubscription | null | undefined): boolean {
  if (!subscription?.stripeSubscriptionId) return false;
  return subscription.cancelAtPeriodEnd && Boolean(subscription.canceledAt);
}

/** Cancel POST may omit `canceledAt` until the next GET; fill it so the UI can update immediately. */
export function subscriptionAfterCancel(subscription: BillingSubscription): BillingSubscription {
  if (!subscription.cancelAtPeriodEnd || subscription.canceledAt) {
    return subscription;
  }
  return { ...subscription, canceledAt: new Date().toISOString() };
}

export function getSubscriptionPendingChangeMessage(subscription: BillingSubscription): string | null {
  if (!subscription.cancelAtPeriodEnd) return null;
  if (subscription.canceledAt) {
    return "Your subscription will cancel at the end of the current billing period.";
  }
  return "Your plan will change at the end of the current billing period.";
}

export function getBillingQuotaUsagePercent(used: number, limit: number): number {
  if (!Number.isFinite(limit) || limit <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((used / limit) * 100)));
}

export const DEFAULT_PLAN_MAX_LEADS_PER_CAMPAIGN = 100;

export const LEAD_COUNT_PRESETS = [50, 100, 250, 500, 1000] as const;

export function getMaxLeadsPerCampaign(subscription: BillingSubscription | null | undefined): number {
  const fromLimits = subscription?.limits?.maxLeadsPerCampaign;
  if (typeof fromLimits === "number" && fromLimits > 0) return fromLimits;

  const fromPlan = subscription?.plan?.maxLeadsPerCampaign;
  if (typeof fromPlan === "number" && fromPlan > 0) return fromPlan;

  return DEFAULT_PLAN_MAX_LEADS_PER_CAMPAIGN;
}

export function getCurrentPlanName(subscription: BillingSubscription | null | undefined): string {
  return subscription?.plan?.name?.trim() || "Free";
}

export function getLeadCountPresets(maxLeadsPerCampaign: number): number[] {
  const presets: number[] = LEAD_COUNT_PRESETS.filter((value) => value <= maxLeadsPerCampaign);
  if (maxLeadsPerCampaign >= 1 && !presets.includes(maxLeadsPerCampaign)) {
    presets.push(maxLeadsPerCampaign);
  }
  return presets.sort((a, b) => a - b);
}

export function getCampaignLeadCapacity(options: {
  maxLeadsPerCampaign: number;
  currentLeadCount: number;
  campaignTargetLeads?: number;
}): { maxAllowed: number; remainingSlots: number } {
  const targetCap =
    typeof options.campaignTargetLeads === "number" && options.campaignTargetLeads > 0
      ? options.campaignTargetLeads
      : options.maxLeadsPerCampaign;
  const maxAllowed = Math.max(0, Math.min(options.maxLeadsPerCampaign, targetCap));
  const currentLeadCount = Math.max(0, options.currentLeadCount);

  return {
    maxAllowed,
    remainingSlots: Math.max(0, maxAllowed - currentLeadCount)
  };
}
