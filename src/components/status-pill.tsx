import { cn } from "@/lib/utils";
import type { CampaignStatus, LeadStatus, RunMode } from "@/lib/mock-data";

export function StatusPill({
  status,
  className,
}: {
  status: LeadStatus | CampaignStatus | "Interested" | "Not Interested" | "Out of Office" | "Question" | "Meeting Request" | "Upcoming" | "Completed" | "Cancelled" | "Enriched" | "Pending";
  className?: string;
}) {
  const map: Record<string, string> = {
    new: "bg-info/15 text-info border-info/20",
    contacted: "bg-primary/15 text-brand-text border-primary/20",
    replied: "bg-warning/15 text-warning border-warning/30",
    booked: "bg-success/15 text-success border-success/30",
    unsubscribed: "bg-destructive/10 text-destructive border-destructive/20",
    running: "bg-primary/15 text-brand-text border-primary/20",
    paused: "bg-warning/15 text-warning border-warning/30",
    completed: "bg-muted text-muted-foreground border-border",
    draft: "bg-muted text-muted-foreground border-border",
    Interested: "bg-success/15 text-success border-success/30",
    "Not Interested": "bg-destructive/10 text-destructive border-destructive/20",
    "Out of Office": "bg-muted text-muted-foreground border-border",
    Question: "bg-info/15 text-info border-info/20",
    "Meeting Request": "bg-primary/15 text-brand-text border-primary/20",
    Upcoming: "bg-primary/15 text-brand-text border-primary/20",
    Completed: "bg-success/15 text-success border-success/30",
    Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
    Enriched: "bg-primary/15 text-brand-text border-primary/20",
    Pending: "bg-muted text-muted-foreground border-border",
  };
  const label =
    typeof status === "string" && status.length > 0
      ? status[0].toUpperCase() + status.slice(1)
      : status;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
        map[status] ?? "bg-muted text-muted-foreground border-border",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function RunModeBadge({ mode }: { mode: RunMode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        mode === "automatic"
          ? "border-primary/30 bg-primary/15 text-brand-text"
          : "border-warning/30 bg-warning/15 text-warning",
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", mode === "automatic" ? "bg-primary" : "bg-warning")} />
      {mode === "automatic" ? "Automatic" : "Manual"}
    </span>
  );
}
