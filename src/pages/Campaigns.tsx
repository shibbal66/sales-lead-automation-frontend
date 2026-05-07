import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { StatusPill, RunModeBadge } from "@/components/status-pill";
import { NewCampaignWizard } from "@/components/campaigns/new-campaign-wizard";
import { Plus, MoreVertical } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CampaignDetail } from "@/components/campaigns/campaign-detail";
import { useCampaignStore } from "@/store/campaign/campaignStore";
import type { CampaignApiModel, CampaignStatus, CreateCampaignRequest, UpdateCampaignRequest } from "@/types";
import type { Campaign, RunMode, CampaignStatus as UiCampaignStatus } from "@/lib/mock-data";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";

type CampaignWithApiDetails = Campaign & {
  targetZone?: string;
  leadSource?: "new" | "existing" | "both";
  mailTemplate?: string;
  exampleTraining?: string;
  createdAt?: string;
  updatedAt?: string;
};

export default function CampaignsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiCampaigns = useCampaignStore((state) => state.campaigns);
  const selectedCampaign = useCampaignStore((state) => state.selectedCampaign);
  const isFetching = useCampaignStore((state) => state.isFetching);
  const isFetchingDetail = useCampaignStore((state) => state.isFetchingDetail);
  const fetchCampaigns = useCampaignStore((state) => state.fetchCampaigns);
  const fetchCampaignById = useCampaignStore((state) => state.fetchCampaignById);
  const clearSelectedCampaign = useCampaignStore((state) => state.clearSelectedCampaign);
  const updateCampaign = useCampaignStore((state) => state.updateCampaign);
  const deleteCampaign = useCampaignStore((state) => state.deleteCampaign);
  const createCampaign = useCampaignStore((state) => state.createCampaign);
  const [tab, setTab] = useState<"all" | "running" | "paused" | "completed" | "draft">("all");
  const [wizardOpen, setWizardOpen] = useState(false);
  const apiStatus: CampaignStatus | undefined = tab === "all" ? undefined : tab === "running" ? "active" : tab;

  const mapApiStatusToUi = (status: CampaignStatus): UiCampaignStatus =>
    status === "active" ? "running" : (status as UiCampaignStatus);

  useEffect(() => {
    if (id) return;
    fetchCampaigns(1, 20, apiStatus).catch((error) => showApiErrorToast(error));
  }, [fetchCampaigns, apiStatus, id]);

  useEffect(() => {
    if (!id) {
      clearSelectedCampaign();
      return;
    }
    fetchCampaignById(id).catch((error) => showApiErrorToast(error));
  }, [id, fetchCampaignById, clearSelectedCampaign]);

  const apiToUiCampaign = (campaign: CampaignApiModel): CampaignWithApiDetails => ({
    id: campaign.id,
    name: campaign.name,
    goal: campaign.goal,
    status: mapApiStatusToUi(campaign.status),
    runMode: (campaign.run_mode === "auto" ? "automatic" : "manual") as RunMode,
    leadsAssigned: campaign.target_leads,
    emailsSent: 0,
    totalEmails: campaign.target_leads,
    replyRate: 0,
    tone: "Professional" as const,
    cta: campaign.call_to_action,
    targetZone: campaign.target_zone,
    leadSource: campaign.lead_source,
    mailTemplate: campaign.mail_template,
    exampleTraining: campaign.example_training,
    createdAt: campaign.created_at,
    updatedAt: campaign.updated_at
  });

  const handleStatusUpdate = async (campaign: CampaignApiModel, status: CampaignStatus) => {
    try {
      const payload: UpdateCampaignRequest = { status };
      await updateCampaign(campaign.id, payload);
      showApiSuccessToast(`Campaign ${status === "active" ? "activated" : status}.`);
    } catch {
      // Error toast is already handled in store.
    }
  };

  const handleDuplicate = async (campaign: CampaignApiModel) => {
    try {
      const payload: CreateCampaignRequest = {
        name: `${campaign.name} (Copy)`,
        goal: campaign.goal,
        target_zone: campaign.target_zone,
        call_to_action: campaign.call_to_action,
        run_mode: campaign.run_mode,
        lead_source: campaign.lead_source,
        mail_template: campaign.mail_template,
        example_training: campaign.example_training,
        target_leads: campaign.target_leads,
        status: "draft"
      };
      await createCampaign(payload);
      showApiSuccessToast("Campaign duplicated successfully.");
    } catch {
      // Error toast is already handled in store.
    }
  };

  const handleDelete = async (campaign: CampaignApiModel) => {
    try {
      const message = await deleteCampaign(campaign.id);
      showApiSuccessToast(message || "Campaign deleted successfully.");
    } catch {
      // Error toast is already handled in store.
    }
  };

  const allCampaigns: CampaignWithApiDetails[] = apiCampaigns.map(apiToUiCampaign);

  const selectedCampaignUi = selectedCampaign ? apiToUiCampaign(selectedCampaign) : null;

  if (id) {
    if (isFetchingDetail && !selectedCampaignUi) return <p className="p-6">Loading campaign...</p>;
    if (!selectedCampaignUi) return <p className="p-6">Campaign not found.</p>;
    return <CampaignDetail campaign={selectedCampaignUi} onBack={() => navigate("/campaigns")} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Campaigns</h2>
          <p className="text-sm text-muted-foreground">{allCampaigns.length} shown</p>
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
        {isFetching && allCampaigns.length === 0 ? (
          <Card className="p-5 shadow-card">
            <p className="text-sm text-muted-foreground">Loading campaigns...</p>
          </Card>
        ) : null}
        {allCampaigns.map((c, idx) => {
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
                    {apiCampaigns[idx]?.status === "draft" && (
                      <DropdownMenuItem
                        className="text-brand-text focus:bg-primary/15 focus:text-brand-text"
                        onClick={() => {
                          const campaign = apiCampaigns[idx];
                          if (!campaign) return;
                          handleStatusUpdate(campaign, "active");
                        }}
                      >
                        Approve
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => navigate(`/campaigns/${c.id}`)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        const campaign = apiCampaigns[idx];
                        if (!campaign) return;
                        handleDuplicate(campaign);
                      }}
                    >
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        const campaign = apiCampaigns[idx];
                        if (!campaign) return;
                        handleDelete(campaign);
                      }}
                    >
                      Delete
                    </DropdownMenuItem>
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
