import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { StatusPill, RunModeBadge } from "@/components/status-pill";
import { campaigns } from "@/lib/mock-data";
import { NewCampaignWizard } from "@/components/campaigns/new-campaign-wizard";
import { Plus, MoreVertical } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CampaignDetail } from "@/components/campaigns/campaign-detail";
import { toast } from "@/hooks/use-toast";

export default function CampaignsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"all" | "running" | "paused" | "completed" | "draft">("all");
  const [wizardOpen, setWizardOpen] = useState(false);

  if (id) {
    const c = campaigns.find((x) => x.id === id);
    if (!c) return <p className="p-6">Campaign not found.</p>;
    return <CampaignDetail campaign={c} onBack={() => navigate("/campaigns")} />;
  }

  const filtered = campaigns.filter((c) => tab === "all" || c.status === tab);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Campaigns</h2>
          <p className="text-sm text-muted-foreground">{campaigns.length} total · {filtered.length} shown</p>
        </div>
        <Button onClick={() => setWizardOpen(true)}><Plus className="h-4 w-4" /> New Campaign</Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="running">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => {
          const pct = Math.round((c.emailsSent / Math.max(c.totalEmails, 1)) * 100);
          return (
            <Card key={c.id} className="flex flex-col gap-3 p-5 shadow-card transition-shadow hover:shadow-elevated">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-display text-base font-bold leading-tight">{c.name}</h3>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{c.goal}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1"><MoreVertical className="h-4 w-4" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {c.status === "draft" && (
                      <DropdownMenuItem
                        className="text-brand-text focus:bg-primary/15 focus:text-brand-text"
                        onClick={() => toast({ title: "Campaign approved", description: `"${c.name}" is queued to launch.` })}
                      >
                        Approve
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>{c.status === "paused" ? "Resume" : "Pause"}</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={c.status} />
                <RunModeBadge mode={c.runMode} />
              </div>

              <div className="grid grid-cols-3 gap-2 rounded-lg bg-muted/40 p-3 text-center">
                <div>
                  <p className="font-display text-lg font-bold">{c.leadsAssigned}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Leads</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{c.emailsSent}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Sent</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{c.replyRate}%</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Reply rate</p>
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>Progress</span><span>{pct}%</span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>

              <Button variant="outline" className="mt-1" onClick={() => navigate(`/campaigns/${c.id}`)}>
                View Campaign
              </Button>
            </Card>
          );
        })}
      </div>

      <NewCampaignWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
}
