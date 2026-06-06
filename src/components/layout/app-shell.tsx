import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";
import { useBillingStore } from "@/store/billing/billingStore";
import { PlanLimitDialog } from "@/components/billing/plan-limit-dialog";
import { useNotificationsStore } from "@/store/notifications/notificationsStore";
import { useFcmPush } from "@/hooks/useFcmPush";

export function AppShell() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const fetchUnreadCount = useNotificationsStore((state) => state.fetchUnreadCount);
  const invalidateUnreadCount = useNotificationsStore((state) => state.invalidateUnreadCount);
  const fetchSubscription = useBillingStore((state) => state.fetchSubscription);
  const invalidateSubscription = useBillingStore((state) => state.invalidateSubscription);

  useFcmPush();

  useEffect(() => {
    void fetchUnreadCount();
    void fetchSubscription();
    return () => {
      invalidateUnreadCount();
      invalidateSubscription();
    };
  }, [fetchUnreadCount, invalidateUnreadCount, fetchSubscription, invalidateSubscription]);

  return (
    <div className="flex h-svh min-h-0 w-full overflow-hidden bg-background text-foreground">
      <AppSidebar mobileOpen={mobileNavOpen} onMobileOpenChange={setMobileNavOpen} />
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin">
          <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-40" />
          <div className="relative p-4 animate-fade-in sm:p-6">
            <Outlet />
          </div>
        </main>
      </div>
      <PlanLimitDialog />
    </div>
  );
}
