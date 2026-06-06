import apiInvoker from "@/lib/apiInvoker";
import { END_POINT } from "@/lib/apiURL";
import type {
  BillingCancelResponse,
  BillingCheckoutResponse,
  BillingDowngradeResponse,
  BillingPlanIdRequest,
  BillingPortalResponse,
  BillingReactivateResponse,
  BillingUpgradeResponse,
  GetBillingPaymentMethodsResponse,
  GetBillingPlansResponse,
  GetBillingQuotaResponse,
  GetBillingSubscriptionResponse,
  DeletePaymentMethodResponse,
  SetDefaultPaymentMethodRequest,
  SetDefaultPaymentMethodResponse
} from "@/types/billing";

export function getBillingPlans() {
  return apiInvoker<GetBillingPlansResponse>(END_POINT.billing.plans, "GET");
}

export function getBillingSubscription() {
  return apiInvoker<GetBillingSubscriptionResponse>(END_POINT.billing.subscription, "GET");
}

export function getBillingQuota() {
  return apiInvoker<GetBillingQuotaResponse>(END_POINT.billing.quota, "GET");
}

export function getBillingPaymentMethods() {
  return apiInvoker<GetBillingPaymentMethodsResponse>(END_POINT.billing.paymentMethods, "GET");
}

export function postBillingSetDefaultPaymentMethod(paymentMethodId: string) {
  const payload: SetDefaultPaymentMethodRequest = { paymentMethodId };
  return apiInvoker<SetDefaultPaymentMethodResponse>(
    END_POINT.billing.paymentMethodsDefault,
    "POST",
    payload
  );
}

export function deleteBillingPaymentMethod(paymentMethodId: string) {
  return apiInvoker<DeletePaymentMethodResponse>(
    END_POINT.billing.paymentMethodById(paymentMethodId),
    "DELETE"
  );
}

export function postBillingCheckout(planId: string) {
  const payload: BillingPlanIdRequest = { planId };
  return apiInvoker<BillingCheckoutResponse>(END_POINT.billing.checkout, "POST", payload);
}

export function postBillingUpgrade(planId: string) {
  const payload: BillingPlanIdRequest = { planId };
  return apiInvoker<BillingUpgradeResponse>(END_POINT.billing.upgrade, "POST", payload);
}

export function postBillingDowngrade(planId: string) {
  const payload: BillingPlanIdRequest = { planId };
  return apiInvoker<BillingDowngradeResponse>(END_POINT.billing.downgrade, "POST", payload);
}

export function postBillingCancel() {
  return apiInvoker<BillingCancelResponse>(END_POINT.billing.cancel, "POST");
}

export function postBillingReactivate() {
  return apiInvoker<BillingReactivateResponse>(END_POINT.billing.reactivate, "POST");
}

export function postBillingPortal() {
  return apiInvoker<BillingPortalResponse>(END_POINT.billing.portal, "POST");
}
