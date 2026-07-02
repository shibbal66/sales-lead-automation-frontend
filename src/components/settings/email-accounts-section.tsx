import { GoogleLinkCard } from "@/components/auth/google-link-card";
import { CalendlyLinkCard } from "@/components/auth/calendly-link-card";
import type { UserGoogleLinkData } from "@/types/user";

type EmailAccountsSectionProps = {
  googleLink?: UserGoogleLinkData | null;
  profileLoading?: boolean;
};

export function EmailAccountsSection({ googleLink, profileLoading }: EmailAccountsSectionProps) {
  return (
    <div className="space-y-4">
      <GoogleLinkCard linkStatus={googleLink} statusLoading={profileLoading} />
      <CalendlyLinkCard />
    </div>
  );
}
