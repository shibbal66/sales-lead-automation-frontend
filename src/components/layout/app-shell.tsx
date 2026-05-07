import { Outlet } from "react-router-dom";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { Topbar } from "@/components/layout/topbar";

export function AppShell() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <AppSidebar />
      <div className="relative flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="relative flex-1 overflow-y-auto scrollbar-thin">
          <div className="pointer-events-none absolute inset-0 bg-dot-pattern opacity-40" />
          <div className="relative p-6 animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
