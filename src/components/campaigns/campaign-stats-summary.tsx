import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  formatCampaignCompletedLeadsValue,
  getCampaignCompletedLeadCount,
  getCampaignLeadCompletionPercent,
  type CampaignStatsViewModel
} from "@/lib/campaignPresentation";

type CampaignStatsSummaryProps = {
  stats: CampaignStatsViewModel;
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

export function CampaignStatsSummary({ stats, className }: CampaignStatsSummaryProps) {
  const completedLeads = getCampaignCompletedLeadCount(stats);
  const progress = getCampaignLeadCompletionPercent(stats);
  const showProgress = stats.totalLeads > 0;

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
      {showProgress ? (
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
            <span>
              Leads completed ({formatCampaignCompletedLeadsValue(completedLeads, stats.totalLeads)})
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      ) : null}
    </Card>
  );
}
