import { Logo } from "@/components/logo";
import type { ReactNode } from "react";

export function AuthLayout({
  children,
  headline,
  subheadline,
}: {
  children: ReactNode;
  headline: string;
  subheadline: string;
}) {
  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between"
           style={{ background: "hsl(var(--background))" }}>
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="absolute inset-0 bg-dot-pattern opacity-20" />
        <div className="relative z-10 p-10">
          <Logo size="lg" />
        </div>
        <div className="relative z-10 max-w-lg p-10">
          <p className="font-display text-4xl font-bold leading-tight text-foreground">
            {headline}
          </p>
          <p className="mt-4 text-base text-muted-foreground">{subheadline}</p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            {[
              { k: "3.2x", v: "Reply rate" },
              { k: "70%", v: "Less research" },
              { k: "12k+", v: "Meetings booked" },
            ].map((s) => (
              <div key={s.v} className="rounded-xl border border-border/60 bg-surface/40 p-4 backdrop-blur-sm">
                <div className="font-display text-2xl font-bold text-brand-text">{s.k}</div>
                <div className="mt-1 text-xs text-muted-foreground">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 p-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} RapidShips LLC · New Jersey
        </div>
      </div>

      {/* Form panel */}
      <div className="flex min-h-screen items-center justify-center bg-background p-6 lg:p-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex justify-center"><Logo size="md" /></div>
          {children}
        </div>
      </div>
    </div>
  );
}
