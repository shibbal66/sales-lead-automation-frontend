import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SETTINGS_SECTIONS, type SettingsSectionId } from "@/components/settings/settings-config";

type SettingsNavProps = {
  activeSection: SettingsSectionId;
  mobileOpenSection: SettingsSectionId | null;
  onSelectSection: (id: SettingsSectionId) => void;
  onMobileToggle: (id: SettingsSectionId) => void;
  renderSection: (id: SettingsSectionId) => ReactNode;
};

export function SettingsNav({
  activeSection,
  mobileOpenSection,
  onSelectSection,
  onMobileToggle,
  renderSection
}: SettingsNavProps) {
  return (
    <>
      <nav className="hidden space-y-2 lg:block">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon;
          const active = activeSection === section.id;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelectSection(section.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary/15 text-brand-text" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                section.id === "danger" && active && "bg-destructive/10 text-destructive"
              )}
            >
              <Icon className="h-4 w-4" /> {section.label}
            </button>
          );
        })}
      </nav>

      <div className="space-y-2 lg:hidden">
        {SETTINGS_SECTIONS.map((section) => {
          const Icon = section.icon;
          const open = mobileOpenSection === section.id;
          return (
            <div key={section.id} className="rounded-lg border border-border/70 bg-card">
              <button
                type="button"
                onClick={() => onMobileToggle(section.id)}
                className={cn(
                  "mb-1 flex w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  open ? "bg-primary/10 text-brand-text" : "text-foreground hover:bg-muted",
                  section.id === "danger" && open && "bg-destructive/10 text-destructive"
                )}
                aria-expanded={open}
                aria-controls={`settings-section-${section.id}`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  {section.label}
                </span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
              </button>
              {open ? (
                <div id={`settings-section-${section.id}`} className="space-y-4 p-2 pt-0">
                  {renderSection(section.id)}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
