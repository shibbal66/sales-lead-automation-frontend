import { useEffect, useMemo, useState } from "react";
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
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { CampaignDetail } from "@/components/campaigns/campaign-detail";
import { CampaignDetailSkeleton } from "@/components/skeletons/campaigns/campaign-detail-skeleton";
import { CampaignsGridSkeleton } from "@/components/skeletons/campaigns/campaign-card-skeleton";
import { useCampaignStore } from "@/store/campaign/campaignStore";
import {
  mapCampaignApiToDetail,
  formatCampaignListLeadsValue,
  getCampaignListProgressPercent,
  mapCampaignApiToDuplicateRequest,
  mapCampaignApiToListCard,
  mapCreateCampaignZodErrors
} from "@/lib/campaignPresentation";
import type { CampaignApiModel, CampaignStatus, UpdateCampaignRequest } from "@/types";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import { parseCreateCampaignPayload } from "@/validators/campaign";

export default function CampaignsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const apiCampaigns = useCampaignStore((state) => state.campaigns);
  const campaignsListTotal = useCampaignStore((state) => state.total);
  const selectedCampaign = useCampaignStore((state) => state.selectedCampaign);
  const isFetching = useCampaignStore((state) => state.isFetching);
  const isFetchingDetail = useCampaignStore((state) => state.isFetchingDetail);
  const fetchCampaigns = useCampaignStore((state) => state.fetchCampaigns);
  const fetchCampaignById = useCampaignStore((state) => state.fetchCampaignById);
  const clearSelectedCampaign = useCampaignStore((state) => state.clearSelectedCampaign);
  const updateCampaign = useCampaignStore((state) => state.updateCampaign);
  const deleteCampaign = useCampaignStore((state) => state.deleteCampaign);
  const isDeleting = useCampaignStore((state) => state.isDeleting);
  const createCampaign = useCampaignStore((state) => state.createCampaign);
  const [tab, setTab] = useState<"all" | "running" | "paused" | "completed" | "draft">("all");
  const [wizardOpen, setWizardOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<CampaignApiModel | null>(null);
  const apiStatus: CampaignStatus | undefined = tab === "all" ? undefined : tab === "running" ? "active" : tab;

  useEffect(() => {
    if (id) return;
    void fetchCampaigns(1, 20, apiStatus);
  }, [fetchCampaigns, apiStatus, id]);

  useEffect(() => {
    if (!id) {
      clearSelectedCampaign();
      return;
    }
    void fetchCampaignById(id);
  }, [id, fetchCampaignById, clearSelectedCampaign]);

  const allCampaigns = apiCampaigns.map(mapCampaignApiToListCard);
  const selectedCampaignDetail = useMemo(
    () => (selectedCampaign ? mapCampaignApiToDetail(selectedCampaign) : null),
    [selectedCampaign]
  );

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
      const source = await fetchCampaignById(campaign.id);
      const payload = mapCampaignApiToDuplicateRequest(source);
      const parsed = parseCreateCampaignPayload(payload);
      if ("error" in parsed) {
        const fieldErrors = mapCreateCampaignZodErrors(parsed.error);
        const message = Object.values(fieldErrors).find((m) => m);
        showApiErrorToast(message ?? "Cannot duplicate: campaign data is incomplete.");
        return;
      }
      const { message } = await createCampaign(parsed.data);
      showApiSuccessToast(message || "Campaign duplicated successfully.");
    } catch {
      // Error toast is already handled in store.
    }
  };

  const handleConfirmDelete = async () => {
    if (!campaignToDelete) return;
    try {
      const message = await deleteCampaign(campaignToDelete.id);
      showApiSuccessToast(message || "Campaign deleted successfully.");
      setCampaignToDelete(null);
    } catch {
      // Error toast is already handled in store.
    }
  };

  if (id) {
    if (isFetchingDetail && !selectedCampaignDetail) return <CampaignDetailSkeleton />;
    if (!selectedCampaignDetail) return <p className="p-6">Campaign not found.</p>;
    return <CampaignDetail campaign={selectedCampaignDetail} onBack={() => navigate("/campaigns")} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Campaigns</h2>
          <p className="text-sm text-muted-foreground">
            {apiCampaigns.length === campaignsListTotal
              ? `${campaignsListTotal} campaign${campaignsListTotal === 1 ? "" : "s"}`
              : `${apiCampaigns.length} on this page · ${campaignsListTotal} total`}
          </p>
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
        {isFetching && allCampaigns.length === 0 ? <CampaignsGridSkeleton count={6} /> : null}
        {allCampaigns.map((c, idx) => {
          const pct = getCampaignListProgressPercent(c.totalLeads, c.targetLeads);
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
                        setCampaignToDelete(campaign);
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
                  <p className="font-display text-lg font-bold">{c.totalLeads.toLocaleString()}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Total leads</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{c.pendingCount.toLocaleString()}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Pending</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{c.failedCount.toLocaleString()}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Failed</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{c.sentCount.toLocaleString()}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Sent</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{c.replyRatePercent}%</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Reply %</p>
                </div>
                <div>
                  <p className="font-display text-lg font-bold">{c.replyRate.toLocaleString()}</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Reply rate</p>
                </div>
              </div>

              <div>
                <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                  <span>
                    Leads filled ({formatCampaignListLeadsValue(c.totalLeads, c.targetLeads)})
                  </span>
                  <span>{pct}%</span>
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

      <AlertDialog
        open={campaignToDelete !== null}
        onOpenChange={(open) => !open && setCampaignToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              {campaignToDelete
                ? `This will permanently delete "${campaignToDelete.name}". This action cannot be undone.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={() => void handleConfirmDelete()}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
