import { Link } from "react-router-dom";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { LegalLinks } from "@/components/legal/legal-links";
import { PRODUCT_NAME } from "@/lib/legal/constants";
import type { ReactNode } from "react";

type LegalLayoutProps = {
  title: string;
  effectiveDate: string;
  children: ReactNode;
};

export function LegalLayout({ title, effectiveDate, children }: LegalLayoutProps) {
  const { theme, toggle } = useTheme();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/80 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link
            to="/"
            className="shrink-0 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Logo size="md" />
          </Link>
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
            <Button variant="ghost" asChild className="hidden sm:inline-flex">
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <article className="container max-w-3xl py-10 sm:py-14">
          <header className="mb-10 border-b border-border pb-8">
            <p className="text-sm font-medium text-brand-text">Legal</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">Last Updated: {effectiveDate}</p>
          </header>
          <div className="legal-prose space-y-8 text-sm leading-relaxed text-muted-foreground sm:text-base">
            {children}
          </div>
        </article>
      </main>

      <footer className="border-t border-border bg-muted/30">
        <div className="container flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {PRODUCT_NAME}
          </p>
          <LegalLinks className="text-sm" />
        </div>
      </footer>
    </div>
  );
}
