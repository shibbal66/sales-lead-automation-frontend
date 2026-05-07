import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { mark: "h-7 w-7 text-base", text: "text-sm tracking-[0.2em]" },
  md: { mark: "h-9 w-9 text-lg", text: "text-base tracking-[0.22em]" },
  lg: { mark: "h-12 w-12 text-2xl", text: "text-xl tracking-[0.24em]" },
};

export function Logo({ className, showWordmark = true, size = "md" }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative grid place-items-center rounded-lg font-display font-extrabold text-primary-foreground shadow-card",
          s.mark,
        )}
        style={{ background: "var(--gradient-brand)" }}
        aria-hidden
      >
        R
        <span className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/20" />
      </div>
      {showWordmark && (
        <span className={cn("font-display font-bold uppercase text-foreground", s.text)}>
          Rapid<span className="text-brand-text">AI</span>
        </span>
      )}
    </div>
  );
}
