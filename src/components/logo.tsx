import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: { mark: "h-7 w-7", text: "text-sm tracking-[0.2em]" },
  md: { mark: "h-9 w-9", text: "text-base tracking-[0.22em]" },
  lg: { mark: "h-14 w-14", text: "text-xl tracking-[0.24em]" },
};

export function Logo({ className, showWordmark = true, size = "md" }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src="/public/rapidai.png"
        alt="Rapid AI"
        className={cn("rounded-lg object-cover shadow-card", s.mark)}
      />
      {showWordmark && (
        <span className={cn("font-display font-bold uppercase text-foreground", s.text)}>
          Rapid<span className="text-brand-text">AI</span>
        </span>
      )}
    </div>
  );
}
