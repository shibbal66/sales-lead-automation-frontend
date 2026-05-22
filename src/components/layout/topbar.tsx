import { useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, Sun, Moon, ChevronDown, Menu } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth/authStore";
import { formatNotificationUnreadBadge } from "@/lib/notifications/unreadCount";
import { getUserDisplayEmail, getUserDisplayName } from "@/lib/userProfile";
import { UserProfileAvatar } from "@/components/user-profile-avatar";
import { useNotificationsStore } from "@/store/notifications/notificationsStore";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const titles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/leads": "Leads",
  "/campaigns": "Campaigns",
  "/meetings": "Meetings",
  "/analytics": "Analytics",
  "/notifications": "Notifications",
  "/settings": "Settings",
};

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const base = "/" + (pathname.split("/")[1] || "dashboard");
  const title = titles[base] ?? "Dashboard";
  const userDisplayName = getUserDisplayName(user);
  const userDisplayEmail = getUserDisplayEmail(user);
  const unreadCount = useNotificationsStore((state) => state.unreadCount);

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-md sm:h-16 sm:gap-4 sm:px-6">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0 rounded-lg md:hidden"
        onClick={onMenuClick}
        aria-label="Open navigation menu"
      >
        <Menu className="h-4 w-4" />
      </Button>

      <h1 className="min-w-0 truncate font-display text-lg font-bold tracking-tight sm:text-[20px]">{title}</h1>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg"
          onClick={() => navigate("/notifications")}
          aria-label={
            unreadCount > 0
              ? `Notifications, ${unreadCount} unread`
              : "Notifications"
          }
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {formatNotificationUnreadBadge(unreadCount)}
            </span>
          ) : null}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-lg"
          onClick={toggle}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="ml-1 flex items-center gap-2 rounded-lg p-1 pr-2 transition-colors hover:bg-muted">
              <UserProfileAvatar
                user={user}
                className="h-8 w-8"
                initialsClassName="text-xs"
              />
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{userDisplayName}</span>
                <span className="text-xs font-normal text-muted-foreground">{userDisplayEmail}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/settings?tab=profile")}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings?tab=billing")}>
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("/settings?tab=team")}>
              Team
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={async () => {
                await logout();
                navigate("/login", { replace: true });
              }}
            >
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
