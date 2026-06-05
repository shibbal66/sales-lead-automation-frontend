import {
  AlertTriangle,
  Bell,
  CreditCard,
  KeyRound,
  Mail,
  User,
  type LucideIcon
} from "lucide-react";

export const SETTINGS_SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "password", label: "Password", icon: KeyRound },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "email", label: "Email Accounts", icon: Mail },
  { id: "billing", label: "Subscription & Billing", icon: CreditCard },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle }
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]["id"];

export type SettingsSection = {
  id: SettingsSectionId;
  label: string;
  icon: LucideIcon;
};

const SETTINGS_SECTION_IDS = new Set<SettingsSectionId>(
  SETTINGS_SECTIONS.map((section) => section.id)
);

export function settingsSectionFromTab(tab: string | null): SettingsSectionId {
  if (tab && SETTINGS_SECTION_IDS.has(tab as SettingsSectionId)) {
    return tab as SettingsSectionId;
  }
  return "profile";
}
