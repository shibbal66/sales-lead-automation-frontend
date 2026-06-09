import type { ReactNode } from "react";
import { LegalLayout } from "@/components/legal/legal-layout";
import {
  LEGAL_CONTACT_EMAIL,
  LEGAL_EFFECTIVE_DATE,
  LEGAL_WEBSITE,
  PRODUCT_NAME
} from "@/lib/legal/constants";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-lg font-semibold text-foreground sm:text-xl">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export default function TermsOfService() {
  return (
    <LegalLayout title="Terms and Conditions" effectiveDate={LEGAL_EFFECTIVE_DATE}>
      <p>
        Welcome to {PRODUCT_NAME}. By accessing or using {PRODUCT_NAME}&apos;s website, software, platform, or
        services, you agree to be bound by these Terms and Conditions.
      </p>

      <Section title="Acceptance of Terms">
        <p>
          By creating an account or using our services, you agree to these Terms and Conditions and all applicable
          laws and regulations.
        </p>
      </Section>

      <Section title="Services">
        <p>
          {PRODUCT_NAME} provides business intelligence, lead generation, contact enrichment, sales engagement,
          AI-powered outreach, and related software services.
        </p>
        <p>We reserve the right to modify, suspend, or discontinue any aspect of the services at any time.</p>
      </Section>

      <Section title="User Accounts">
        <p>You are responsible for:</p>
        <BulletList
          items={[
            "Maintaining account security",
            "Protecting login credentials",
            "All activity occurring under your account",
            "Providing accurate information"
          ]}
        />
      </Section>

      <Section title="Acceptable Use">
        <p>Users agree not to:</p>
        <BulletList
          items={[
            "Violate any applicable law",
            "Send unlawful spam",
            "Use the platform for fraudulent activities",
            "Interfere with platform operations",
            "Reverse engineer or copy the platform",
            "Access data without authorization"
          ]}
        />
      </Section>

      <Section title="Data and Compliance">
        <p>
          Users are responsible for ensuring their use of {PRODUCT_NAME} complies with applicable privacy, marketing,
          and anti-spam laws, including CAN-SPAM, GDPR, and other applicable regulations.
        </p>
      </Section>

      <Section title="Subscription and Billing">
        <p>Certain services require payment.</p>
        <p>Subscriptions may automatically renew unless canceled before the renewal date.</p>
        <p>Fees are non-refundable except where required by law or expressly stated otherwise.</p>
      </Section>

      <Section title="Intellectual Property">
        <p>
          All software, content, branding, trademarks, and technology associated with {PRODUCT_NAME} remain the
          exclusive property of {PRODUCT_NAME}.
        </p>
        <p>No ownership rights are transferred to users.</p>
      </Section>

      <Section title="Disclaimer">
        <p>{PRODUCT_NAME} provides information and tools on an &quot;as-is&quot; and &quot;as-available&quot; basis.</p>
        <p>We do not guarantee:</p>
        <BulletList
          items={[
            "Accuracy of third-party data",
            "Lead conversion results",
            "Email deliverability",
            "Revenue outcomes",
            "Continuous service availability"
          ]}
        />
      </Section>

      <Section title="Limitation of Liability">
        <p>
          To the maximum extent permitted by law, {PRODUCT_NAME} shall not be liable for any indirect, incidental,
          special, consequential, or punitive damages arising from use of the services.
        </p>
        <p>
          Our total liability shall not exceed the amount paid by the user during the twelve months preceding the
          claim.
        </p>
      </Section>

      <Section title="Termination">
        <p>
          We may suspend or terminate accounts at our discretion for violations of these Terms or applicable laws.
        </p>
      </Section>

      <Section title="Governing Law">
        <p>
          These Terms shall be governed by the laws of the State of New Jersey, United States, without regard to
          conflict of law principles.
        </p>
      </Section>

      <Section title="Changes to Terms">
        <p>
          We may update these Terms periodically. Continued use of the services constitutes acceptance of any revised
          Terms.
        </p>
      </Section>

      <Section title="Contact Information">
        <p>{PRODUCT_NAME}</p>
        <p>
          Email:{" "}
          <a href={`mailto:${LEGAL_CONTACT_EMAIL}`} className="text-brand-text hover:underline">
            {LEGAL_CONTACT_EMAIL}
          </a>
        </p>
        <p>
          Website:{" "}
          <a href={LEGAL_WEBSITE} className="text-brand-text hover:underline" target="_blank" rel="noopener noreferrer">
            {LEGAL_WEBSITE}
          </a>
        </p>
      </Section>
    </LegalLayout>
  );
}
