import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

type LegalLinksProps = {
  className?: string;
  separator?: string;
};

export function LegalLinks({ className, separator = "·" }: LegalLinksProps) {
  return (
    <nav className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground", className)}>
      <Link to="/terms" className="font-medium text-brand-text hover:underline">
        Terms and Conditions
      </Link>
      <span aria-hidden="true" className="text-border">
        {separator}
      </span>
      <Link to="/privacy" className="font-medium text-brand-text hover:underline">
        Privacy Policy
      </Link>
    </nav>
  );
}
