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

export default function PrivacyPolicy() {
  return (
    <LegalLayout title="Privacy Policy" effectiveDate={LEGAL_EFFECTIVE_DATE}>
      <p>
        {PRODUCT_NAME} (&quot;{PRODUCT_NAME},&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects
        your privacy and is committed to protecting your personal information. This Privacy Policy explains how we
        collect, use, disclose, and safeguard your information when you use our website, software platform,
        applications, and related services.
      </p>

      <Section title="Information We Collect">
        <p>We may collect the following information:</p>

        <h3 className="font-medium text-foreground">Personal Information</h3>
        <BulletList
          items={[
            "Name",
            "Email address",
            "Phone number",
            "Company name",
            "Job title",
            "Billing information",
            "Account credentials"
          ]}
        />

        <h3 className="font-medium text-foreground">Business Data</h3>
        <BulletList
          items={[
            "Company information",
            "Contact information",
            "Lead generation data",
            "CRM data",
            "Email campaign data",
            "User-generated content"
          ]}
        />

        <h3 className="font-medium text-foreground">Automatically Collected Information</h3>
        <BulletList
          items={[
            "IP address",
            "Browser type",
            "Device information",
            "Usage statistics",
            "Cookies and similar technologies"
          ]}
        />
      </Section>

      <Section title="How We Use Information">
        <p>We use collected information to:</p>
        <BulletList
          items={[
            "Provide and maintain our services",
            "Process transactions",
            "Authenticate users",
            "Improve platform performance",
            "Deliver customer support",
            "Send service-related communications",
            "Prevent fraud and abuse",
            "Comply with legal obligations"
          ]}
        />
      </Section>

      <Section title="Third-Party Services">
        <p>{PRODUCT_NAME} may integrate with third-party providers including:</p>
        <BulletList
          items={[
            "Google APIs",
            "CRM platforms",
            "Email service providers",
            "Payment processors",
            "Analytics providers",
            "Cloud hosting providers"
          ]}
        />
        <p>These third parties may collect and process information according to their own privacy policies.</p>
      </Section>

      <Section title="Data Sharing">
        <p>We do not sell personal information.</p>
        <p>We may share information with:</p>
        <BulletList
          items={[
            "Service providers assisting in platform operations",
            "Business partners necessary to provide services",
            "Legal authorities when required by law",
            "Successors in the event of a merger, acquisition, or asset sale"
          ]}
        />
      </Section>

      <Section title="Data Security">
        <p>
          We implement commercially reasonable security measures designed to protect information from unauthorized
          access, disclosure, alteration, or destruction. No method of transmission or storage is 100% secure.
        </p>
      </Section>

      <Section title="Data Retention">
        <p>
          We retain information for as long as necessary to provide services, comply with legal obligations, resolve
          disputes, and enforce agreements.
        </p>
      </Section>

      <Section title="Your Rights">
        <p>Depending on your jurisdiction, you may have rights to:</p>
        <BulletList
          items={[
            "Access your information",
            "Correct inaccurate information",
            "Request deletion of your information",
            "Restrict processing",
            "Object to certain processing activities"
          ]}
        />
        <p>To exercise these rights, contact us using the information below.</p>
      </Section>

      <Section title="Google API Services">
        <p>
          {PRODUCT_NAME}&apos;s use and transfer of information received from Google APIs adheres to the Google API
          Services User Data Policy, including Limited Use requirements.
        </p>
      </Section>

      <Section title="Children's Privacy">
        <p>
          {PRODUCT_NAME} is not intended for individuals under the age of 18. We do not knowingly collect information
          from children.
        </p>
      </Section>

      <Section title="Changes to This Policy">
        <p>
          We may update this Privacy Policy periodically. Continued use of the service after updates constitutes
          acceptance of the revised policy.
        </p>
      </Section>

      <Section title="Contact Us">
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
