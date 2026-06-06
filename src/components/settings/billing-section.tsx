import { useEffect, useMemo, useState } from "react";
import { CreditCard } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import {
  canCancelPaidSubscription,
  canDeletePaymentMethod,
  canOpenBillingPortal,
  canReactivateSubscription,
  formatBillingInterval,
  formatBillingPlanBillingLine,
  formatBillingPlanPrice,
  formatPaymentMethodBrand,
  formatPaymentMethodExpiry,
  getBillingQuotaUsagePercent,
  getBillingPlanAction,
  getBillingPlanActionLoadingLabel,
  getBillingPlanButtonLabel,
  getNextBillingPlan,
  getSubscriptionPendingChangeMessage
} from "@/lib/billing";
import { cn } from "@/lib/utils";
import { useBillingStore } from "@/store/billing/billingStore";

type QuotaUsageBarProps = {
  label: string;
  used: number;
  limit: number;
  available: number;
};

function QuotaUsageBar({ label, used, limit, available }: QuotaUsageBarProps) {
  const percent = getBillingQuotaUsagePercent(used, limit);

  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="min-w-0 truncate text-sm font-medium" title={label}>
          {label}
        </p>
        <p className="shrink-0 text-xs text-muted-foreground">
          {used.toLocaleString()} / {limit.toLocaleString()}
        </p>
      </div>
      <Progress value={percent} className="mt-3 h-2" />
      <p className="mt-1.5 text-xs text-muted-foreground">{available.toLocaleString()} remaining</p>
    </div>
  );
}

export function BillingSection() {
  const [cancelOpen, setCancelOpen] = useState(false);
  const subscription = useBillingStore((s) => s.subscription);
  const quota = useBillingStore((s) => s.quota);
  const plans = useBillingStore((s) => s.plans);
  const paymentMethods = useBillingStore((s) => s.paymentMethods);
  const isLoading = useBillingStore((s) => s.isFetchingBillingData);
  const isFetchingQuota = useBillingStore((s) => s.isFetchingQuota);
  const actionPlanId = useBillingStore((s) => s.actionPlanId);
  const isCanceling = useBillingStore((s) => s.isCanceling);
  const isReactivating = useBillingStore((s) => s.isReactivating);
  const isOpeningPortal = useBillingStore((s) => s.isOpeningPortal);
  const defaultPaymentMethodId = useBillingStore((s) => s.defaultPaymentMethodId);
  const deletingPaymentMethodId = useBillingStore((s) => s.deletingPaymentMethodId);
  const fetchBillingData = useBillingStore((s) => s.fetchBillingData);
  const fetchBillingQuota = useBillingStore((s) => s.fetchBillingQuota);
  const runPlanAction = useBillingStore((s) => s.runPlanAction);
  const cancelSubscription = useBillingStore((s) => s.cancelSubscription);
  const reactivateSubscription = useBillingStore((s) => s.reactivateSubscription);
  const openBillingPortal = useBillingStore((s) => s.openBillingPortal);
  const setDefaultPaymentMethod = useBillingStore((s) => s.setDefaultPaymentMethod);
  const deletePaymentMethod = useBillingStore((s) => s.deletePaymentMethod);

  useEffect(() => {
    void fetchBillingData();
  }, [fetchBillingData]);

  useEffect(() => {
    if (!subscription?.planId) return;
    void fetchBillingQuota();
  }, [subscription?.planId, fetchBillingQuota]);

  const currentPlanId = subscription?.planId;
  const nextPlan = useMemo(
    () => getNextBillingPlan(plans, currentPlanId),
    [plans, currentPlanId]
  );
  const hasStripeSubscription = Boolean(subscription?.stripeSubscriptionId);
  const pendingChangeMessage = subscription ? getSubscriptionPendingChangeMessage(subscription) : null;

  return (
    <>
      <Card className="p-6 shadow-card">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
            <div className="space-y-3 pt-2">
              <Skeleton className="h-4 w-28" />
              <div className="grid gap-4 md:grid-cols-2">
                <Skeleton className="h-24 rounded-lg" />
                <Skeleton className="h-24 rounded-lg" />
              </div>
            </div>
          </div>
        ) : subscription ? (
          <>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-bold">{subscription.plan.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatBillingPlanBillingLine(subscription.plan)}
                  {subscription.status ? ` · ${subscription.status}` : ""}
                </p>
                {pendingChangeMessage ? (
                  <p className="mt-1 text-sm text-warning">{pendingChangeMessage}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                <Button
                  disabled={!nextPlan || Boolean(actionPlanId) || isCanceling || isReactivating}
                  onClick={() => nextPlan && void runPlanAction(nextPlan.id)}
                >
                  {actionPlanId === nextPlan?.id ? "Redirecting..." : "Upgrade Plan"}
                </Button>
                {canReactivateSubscription(subscription) ? (
                  <Button
                    variant="outline"
                    disabled={isReactivating || isCanceling || Boolean(actionPlanId)}
                    onClick={() => void reactivateSubscription()}
                  >
                    {isReactivating ? "Reactivating..." : "Undo cancellation"}
                  </Button>
                ) : null}
                {canCancelPaidSubscription(subscription) ? (
                  <Button
                    variant="outline"
                    className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={isCanceling || isReactivating || Boolean(actionPlanId)}
                    onClick={() => setCancelOpen(true)}
                  >
                    Cancel subscription
                  </Button>
                ) : null}
              </div>
            </div>
            <div className="mt-6 space-y-4">
              <div>
                <h4 className="text-sm font-semibold">Usage & quota</h4>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Track how much of your plan limits you have used.
                </p>
              </div>
              {isFetchingQuota && !quota ? (
                <div className="grid gap-4 md:grid-cols-2">
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                </div>
              ) : quota ? (
                <div className={cn("space-y-4", isFetchingQuota && "opacity-60")}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <QuotaUsageBar
                      label="Campaigns"
                      used={quota.campaigns.used}
                      limit={quota.campaigns.limit}
                      available={quota.campaigns.available}
                    />
                    <QuotaUsageBar
                      label="Daily emails"
                      used={quota.dailyEmails.used}
                      limit={quota.dailyEmails.limit}
                      available={quota.dailyEmails.available}
                    />
                  </div>
                  {quota.leadsPerCampaign.campaigns.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        Leads per campaign ({quota.leadsPerCampaign.limit.toLocaleString()} max each)
                      </p>
                      <div className="grid gap-4 md:grid-cols-2">
                        {quota.leadsPerCampaign.campaigns.map((campaign) => (
                          <QuotaUsageBar
                            key={campaign.campaignId}
                            label={campaign.campaignName}
                            used={campaign.used}
                            limit={campaign.limit}
                            available={campaign.available}
                          />
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    { label: "Leads per campaign", value: subscription.limits.maxLeadsPerCampaign },
                    { label: "Campaigns", value: subscription.limits.maxCampaigns }
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-border p-4">
                      <p className="text-xs text-muted-foreground">{item.label}</p>
                      <p className="mt-1 font-display text-xl font-bold">{item.value.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-sm text-muted-foreground">Unable to load your subscription.</p>
        )}
      </Card>

      <Card className="overflow-hidden shadow-card">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-bold">Payment methods</h3>
            <p className="mt-1 text-sm text-muted-foreground">Cards saved for your subscription billing.</p>
          </div>
          {canOpenBillingPortal(subscription) ? (
            <Button
              variant="outline"
              size="sm"
              className="shrink-0"
              disabled={isLoading || isOpeningPortal}
              onClick={() => void openBillingPortal()}
            >
              Manage cards
            </Button>
          ) : null}
        </div>
        <div className="divide-y divide-border border-t border-border">
          {isLoading ? (
            Array.from({ length: 2 }, (_, i) => (
              <div key={`payment-method-skeleton-${i}`} className="flex items-center gap-4 p-4">
                <Skeleton className="h-10 w-14 rounded-md" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))
          ) : paymentMethods.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No payment methods on file.</p>
          ) : (
            paymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-14 items-center justify-center rounded-md border border-border bg-muted/40">
                    <CreditCard className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">
                      {formatPaymentMethodBrand(method.brand)} ···· {method.last4}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Expires {formatPaymentMethodExpiry(method.expMonth, method.expYear)}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  {method.isDefault ? (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-brand-text">
                      Default
                    </span>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={Boolean(defaultPaymentMethodId || deletingPaymentMethodId)}
                      onClick={() => void setDefaultPaymentMethod(method.id)}
                    >
                      {defaultPaymentMethodId === method.id ? "Saving..." : "Set as default"}
                    </Button>
                  )}
                  {canDeletePaymentMethod(method, paymentMethods) ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={Boolean(defaultPaymentMethodId || deletingPaymentMethodId)}
                      onClick={() => void deletePaymentMethod(method.id)}
                    >
                      {deletingPaymentMethodId === method.id ? "Removing..." : "Remove"}
                    </Button>
                  ) : null}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card className="overflow-hidden shadow-card">
        <div className="p-6 pb-2">
          <h3 className="font-display text-lg font-bold">Compare Plans</h3>
          <p className="mt-1 text-sm text-muted-foreground">Pick the plan that matches your outreach volume.</p>
        </div>
        <div
          className={cn(
            "grid grid-cols-1 gap-px bg-border p-px",
            plans.length === 2 && "md:grid-cols-2",
            plans.length >= 3 && "md:grid-cols-3"
          )}
        >
          {isLoading ? (
            Array.from({ length: 3 }, (_, i) => (
              <div key={`billing-plan-skeleton-${i}`} className="flex flex-col gap-3 bg-card p-5">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="mt-1 h-9 w-full" />
              </div>
            ))
          ) : plans.length === 0 ? (
            <div className="col-span-full bg-card p-8 text-center text-sm text-muted-foreground">
              No plans available right now.
            </div>
          ) : (
            plans.map((plan) => {
              const planAction = getBillingPlanAction(plan, {
                currentPlanId,
                plans,
                hasStripeSubscription
              });
              const isCurrent = planAction === "current";
              const isPlanLoading = actionPlanId === plan.id;
              const isDisabled =
                isCurrent ||
                planAction === "unavailable" ||
                Boolean(actionPlanId) ||
                isCanceling ||
                isReactivating;

              return (
                <div
                  key={plan.id}
                  className={cn("flex flex-col gap-3 bg-card p-5", isCurrent && "rounded-lg ring-2 ring-primary")}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-display text-lg font-bold">{plan.name}</p>
                    {isCurrent ? (
                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-brand-text">
                        Current
                      </span>
                    ) : null}
                  </div>
                  <p className="font-display text-2xl font-bold">
                    {formatBillingPlanPrice(plan)}
                    {plan.priceCents > 0 ? (
                      <span className="text-xs text-muted-foreground">
                        {" "}
                        {formatBillingInterval(plan.billingInterval)}
                      </span>
                    ) : null}
                  </p>
                  <div className="space-y-1.5 rounded-lg bg-muted/40 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Leads per campaign</span>
                      <span className="font-semibold">{plan.maxLeadsPerCampaign.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Campaigns</span>
                      <span className="font-semibold">{plan.maxCampaigns.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button
                    variant={isCurrent || planAction === "downgrade" ? "outline" : "default"}
                    disabled={isDisabled}
                    className="mt-1 w-full"
                    onClick={() => void runPlanAction(plan.id)}
                  >
                    {isPlanLoading
                      ? getBillingPlanActionLoadingLabel(planAction)
                      : getBillingPlanButtonLabel(plan, planAction)}
                  </Button>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card className="overflow-hidden shadow-card">
        <div className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="font-display text-lg font-bold">Billing History</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              View invoices, update payment methods, and manage billing details in the Stripe customer portal.
            </p>
          </div>
          <Button
            variant="outline"
            className="shrink-0"
            disabled={
              isLoading ||
              isOpeningPortal ||
              !canOpenBillingPortal(subscription) ||
              Boolean(actionPlanId) ||
              isCanceling ||
              isReactivating
            }
            onClick={() => void openBillingPortal()}
          >
            {isOpeningPortal ? "Opening..." : "Open billing portal"}
          </Button>
        </div>
        {!isLoading && !canOpenBillingPortal(subscription) ? (
          <p className="border-t border-border px-6 pb-6 text-sm text-muted-foreground">
            Subscribe to a paid plan to access invoices and billing management.
          </p>
        ) : null}
      </Card>

      <AlertDialog
        open={cancelOpen}
        onOpenChange={(open) => {
          if (isCanceling) return;
          setCancelOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive">Cancel subscription?</AlertDialogTitle>
            <AlertDialogDescription>
              {subscription
                ? `Your ${subscription.plan.name} subscription will stay active until the end of the current billing period. After that, paid features will end. You can undo cancellation before the period ends.`
                : "Your subscription will stay active until the end of the current billing period. You can undo cancellation before the period ends."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCanceling}>Keep subscription</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isCanceling}
              onClick={async () => {
                const ok = await cancelSubscription();
                if (ok) setCancelOpen(false);
              }}
            >
              {isCanceling ? "Canceling..." : "Cancel at period end"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
