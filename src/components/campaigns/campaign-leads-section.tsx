import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CampaignLeadsTable } from "@/components/campaigns/campaign-leads-table";
import { BulkAssignLeadsSheet } from "@/components/campaigns/bulk-assign-leads-sheet";
import { EditCampaignLeadDialog } from "@/components/campaigns/edit-campaign-lead-dialog";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { useCampaignLeads } from "@/hooks/useCampaignLeads";
import type { CampaignLeadApiModel, UpdateCampaignLeadRequest } from "@/types";

type CampaignLeadsSectionProps = {
  campaignId: string;
  mailTemplate: string;
  campaignTargetLeads: number;
};

export function CampaignLeadsSection({ campaignId, campaignTargetLeads }: CampaignLeadsSectionProps) {
  const {
    campaignLeads,
    campaignLeadsTotal,
    currentPage,
    totalPages,
    isFetchingCampaignLeads,
    isBulkAddingCampaignLeads,
    isUpdatingCampaignLead,
    isDeletingCampaignLead,
    handlePageChange,
    statusFilter,
    handleStatusFilterChange,
    bulkAssignLeads,
    saveCampaignLead,
    removeCampaignLead,
    sendCampaignLeadEmail,
    sendingEmailLeadId
  } = useCampaignLeads(campaignId);
  const [assignLeadsOpen, setAssignLeadsOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<CampaignLeadApiModel | null>(null);
  const [deletingLead, setDeletingLead] = useState<CampaignLeadApiModel | null>(null);

  const assignedLeadDataIds = useMemo(
    () => new Set(campaignLeads.map((lead) => lead.lead_data_id)),
    [campaignLeads]
  );

  const handleSaveEdit = async (payload: UpdateCampaignLeadRequest) => {
    if (!editingLead) return;
    const ok = await saveCampaignLead(editingLead.id, payload);
    if (ok) {
      setEditingLead(null);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingLead) return;
    const ok = await removeCampaignLead(deletingLead.id);
    if (ok) {
      setDeletingLead(null);
    }
  };

  return (
    <>
      <Card className="overflow-hidden shadow-card">
        <CampaignLeadsTable
          leads={campaignLeads}
          total={campaignLeadsTotal}
          currentPage={currentPage}
          totalPages={totalPages}
          isLoading={isFetchingCampaignLeads}
          onPageChange={handlePageChange}
          statusFilter={statusFilter}
          onStatusFilterChange={handleStatusFilterChange}
          onAssignClick={() => setAssignLeadsOpen(true)}
          onEditLead={setEditingLead}
          onDeleteLead={setDeletingLead}
          onSendEmail={(lead) => void sendCampaignLeadEmail(lead.id)}
          sendingEmailLeadId={sendingEmailLeadId}
        />
      </Card>
      <BulkAssignLeadsSheet
        open={assignLeadsOpen}
        assignedLeadDataIds={assignedLeadDataIds}
        campaignLeadCount={campaignLeadsTotal}
        campaignTargetLeads={campaignTargetLeads}
        isSubmitting={isBulkAddingCampaignLeads}
        onOpenChange={setAssignLeadsOpen}
        onAssign={bulkAssignLeads}
      />
      <EditCampaignLeadDialog
        key={editingLead?.id ?? "closed"}
        open={editingLead !== null}
        lead={editingLead}
        isSubmitting={isUpdatingCampaignLead}
        onOpenChange={(open) => {
          if (!open) setEditingLead(null);
        }}
        onSave={(payload) => {
          void handleSaveEdit(payload);
        }}
      />
      <AlertDialog open={deletingLead !== null} onOpenChange={(open) => !open && setDeletingLead(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove lead from campaign?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingLead
                ? `This will remove the lead from the campaign. This action cannot be undone.`
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCampaignLead}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              disabled={isDeletingCampaignLead}
              onClick={() => void handleConfirmDelete()}
            >
              {isDeletingCampaignLead ? "Removing..." : "Remove"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
