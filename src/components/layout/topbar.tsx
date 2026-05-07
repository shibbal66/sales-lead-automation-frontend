import { useLocation, useNavigate } from "react-router-dom";
import { Search, Bell, Sun, Moon, ChevronDown } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth/authStore";
import { getUserDisplayEmail, getUserDisplayName, getUserInitials } from "@/lib/userDisplay";
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

export function Topbar() {
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const base = "/" + (pathname.split("/")[1] || "dashboard");
  const title = titles[base] ?? "Dashboard";
  const userInitials = getUserInitials(user);
  const userDisplayName = getUserDisplayName(user);
  const userDisplayEmail = getUserDisplayEmail(user);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <h1 className="font-display text-[20px] font-bold tracking-tight">{title}</h1>

      <div className="relative ml-6 hidden max-w-md flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search leads, campaigns..."
          className="h-9 rounded-lg border-border bg-muted/50 pl-9 text-sm placeholder:text-muted-foreground/70"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="relative h-9 w-9 rounded-lg"
          onClick={() => navigate("/notifications")}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            5
          </span>
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
              <div className="grid h-8 w-8 place-items-center rounded-full bg-gradient-brand text-xs font-semibold text-primary-foreground">
                {userInitials}
              </div>
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
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Team</DropdownMenuItem>
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
