import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  formatCampaignListLeadsValue,
  getCampaignListProgressPercent,
  type CampaignStatsViewModel
} from "@/lib/campaignPresentation";

type CampaignStatsSummaryProps = {
  stats: CampaignStatsViewModel;
  targetLeads?: number;
  className?: string;
};

const STAT_ITEMS = [
  { key: "totalLeads", label: "Total leads" },
  { key: "pendingCount", label: "Pending" },
  { key: "failedCount", label: "Failed" },
  { key: "sentCount", label: "Sent" },
  { key: "replyRatePercent", label: "Reply %" },
  { key: "replyRate", label: "Reply rate" }
] as const;

export function CampaignStatsSummary({ stats, targetLeads, className }: CampaignStatsSummaryProps) {
  const progress =
    typeof targetLeads === "number"
      ? getCampaignListProgressPercent(stats.totalLeads, targetLeads)
      : null;

  return (
    <Card className={className ?? "p-4 shadow-card"}>
      <div className="grid grid-cols-3 gap-3 text-center sm:grid-cols-6">
        {STAT_ITEMS.map((item) => {
          const value = stats[item.key];
          const display =
            item.key === "replyRatePercent"
              ? `${value}%`
              : typeof value === "number"
                ? value.toLocaleString()
                : String(value);

          return (
            <div key={item.key} className="rounded-lg bg-muted/40 px-2 py-3">
              <p className="font-display text-lg font-bold">{display}</p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
            </div>
          );
        })}
      </div>
      {progress != null ? (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
            <span>Leads filled ({formatCampaignListLeadsValue(stats.totalLeads, targetLeads)})</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      ) : null}
    </Card>
  );
}
