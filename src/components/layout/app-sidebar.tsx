import { useEffect, useState } from "react";
import { NavLink } from "@/components/NavLink";
import { Logo } from "@/components/logo";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth/authStore";
import { getUserDisplayEmail, getUserDisplayName, getUserInitials } from "@/lib/userDisplay";
import {
  LayoutGrid, Users, Megaphone, Calendar, BarChart3, Settings, Bell,
  ChevronLeft, ChevronRight, Sparkles,
} from "lucide-react";

const items = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/leads", label: "Leads", icon: Users },
  { to: "/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/meetings", label: "Meetings", icon: Calendar },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/notifications", label: "Notifications", icon: Bell, badge: 5 },
  { to: "/settings", label: "Settings", icon: Settings },
];

const sidebarSurfaceClass =
  "flex flex-col border-sidebar-border bg-sidebar text-sidebar-foreground";

const sidebarSurfaceStyle = {
  background:
    "linear-gradient(180deg, hsl(var(--sidebar-background)) 0%, hsl(var(--sidebar-background) / 0.92) 100%)",
} as const;

interface SidebarPanelProps {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  showCollapseControl: boolean;
  onNavigate?: () => void;
}

function SidebarPanel({
  collapsed,
  onToggleCollapsed,
  showCollapseControl,
  onNavigate,
}: SidebarPanelProps) {
  const user = useAuthStore((state) => state.user);
  const userInitials = getUserInitials(user);
  const userDisplayName = getUserDisplayName(user);
  const userDisplayEmail = getUserDisplayEmail(user);

  return (
    <>
      <div className={cn("flex h-16 shrink-0 items-center border-b border-sidebar-border", collapsed ? "justify-center px-2" : "px-4")}>
        <Logo showWordmark={!collapsed} size={collapsed ? "sm" : "md"} />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3 scrollbar-thin">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
                collapsed && "justify-center px-0",
              )}
              activeClassName="!text-sidebar-foreground !bg-primary/12 [&>span.active-bar]:opacity-100"
            >
              <span className="active-bar pointer-events-none absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-primary opacity-0 transition-opacity" />
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && <span className="flex-1">{item.label}</span>}
              {!collapsed && item.badge ? (
                <span className="rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-semibold text-brand-text">
                  {item.badge}
                </span>
              ) : null}
            </NavLink>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-sidebar-border p-3">
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg p-2",
            !collapsed && "bg-sidebar-accent/60",
          )}
        >
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-brand text-sm font-semibold text-primary-foreground">
            {userInitials}
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold leading-tight">{userDisplayName}</p>
              <p className="truncate text-xs text-muted-foreground">{userDisplayEmail}</p>
              <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-brand-text">
                <Sparkles className="h-2.5 w-2.5" /> Pro Plan
              </span>
            </div>
          )}
        </div>

        {showCollapseControl ? (
          <button
            type="button"
            onClick={onToggleCollapsed}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-sidebar-border bg-sidebar px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground"
          >
            {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : (
              <>
                <ChevronLeft className="h-3.5 w-3.5" />
                Collapse
              </>
            )}
          </button>
        ) : null}
      </div>
    </>
  );
}

interface AppSidebarProps {
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

export function AppSidebar({ mobileOpen, onMobileOpenChange }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!isMobile && mobileOpen) {
      onMobileOpenChange(false);
    }
  }, [isMobile, mobileOpen, onMobileOpenChange]);

  return (
    <>
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="left"
          className={cn(
            sidebarSurfaceClass,
            "w-[min(18rem,85vw)] max-w-[85vw] border-r p-0 md:hidden",
          )}
          style={sidebarSurfaceStyle}
        >
          <SheetTitle className="sr-only">Navigation</SheetTitle>
          <div className="flex h-full min-h-0 flex-col">
            <SidebarPanel
              collapsed={false}
              onToggleCollapsed={() => setCollapsed((current) => !current)}
              showCollapseControl={false}
              onNavigate={() => onMobileOpenChange(false)}
            />
          </div>
        </SheetContent>
      </Sheet>

      <aside
        className={cn(
          "relative z-30 hidden h-svh min-h-0 shrink-0 flex-col border-r border-sidebar-border transition-[width] duration-250 ease-out md:flex md:flex-col",
          collapsed ? "w-16" : "w-60",
        )}
        style={sidebarSurfaceStyle}
      >
        <SidebarPanel
          collapsed={collapsed}
          onToggleCollapsed={() => setCollapsed((current) => !current)}
          showCollapseControl
        />
      </aside>
    </>
  );
}
