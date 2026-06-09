import { Link } from "react-router-dom";
import { Moon, Sun } from "lucide-react";
import { Logo } from "@/components/logo";
import { LegalLinks } from "@/components/legal/legal-links";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import type { ReactNode } from "react";

type MarketingLayoutProps = {
  children: ReactNode;
  isAuthenticated?: boolean;
};

export function MarketingLayout({ children, isAuthenticated }: MarketingLayoutProps) {
  const { theme, toggle } = useTheme();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
            <Logo size="md" />
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#features" className="transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">
              How it works
            </a>
            <a href="#why-rapid-ai" className="transition-colors hover:text-foreground">
              Why Rapid AI
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={toggle}
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            {isAuthenticated ? (
              <Button asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border bg-muted/30">
        <div className="container flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <Logo size="sm" />
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} RapidShips LLC · Sales outreach automation for modern revenue teams
          </p>
          <div className="flex flex-col gap-3 sm:items-end">
            <LegalLinks className="text-sm" />
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <Link to="/login" className="font-medium text-brand-text hover:underline">
                Sign in
              </Link>
              <Link to="/signup" className="font-medium text-brand-text hover:underline">
                Create account
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
