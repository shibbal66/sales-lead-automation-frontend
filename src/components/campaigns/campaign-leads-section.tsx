import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CampaignLeadsTable } from "@/components/campaigns/campaign-leads-table";
import { AssignLeadDialog } from "@/components/campaigns/assign-lead-dialog";
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
};

export function CampaignLeadsSection({ campaignId, mailTemplate }: CampaignLeadsSectionProps) {
  const {
    campaignLeads,
    campaignLeadsTotal,
    currentPage,
    totalPages,
    isFetchingCampaignLeads,
    isAddingCampaignLead,
    isUpdatingCampaignLead,
    isDeletingCampaignLead,
    isAssigningRandomLeads,
    handlePageChange,
    assignLead,
    assignRandomLeads,
    saveCampaignLead,
    removeCampaignLead
  } = useCampaignLeads(campaignId);
  const [assignLeadOpen, setAssignLeadOpen] = useState(false);
  const [leadDataId, setLeadDataId] = useState("");
  const [assignmentMailTemplate, setAssignmentMailTemplate] = useState(mailTemplate);
  const [editingLead, setEditingLead] = useState<CampaignLeadApiModel | null>(null);
  const [deletingLead, setDeletingLead] = useState<CampaignLeadApiModel | null>(null);
  const [assignRandomConfirmOpen, setAssignRandomConfirmOpen] = useState(false);

  useEffect(() => {
    if (assignLeadOpen) {
      setAssignmentMailTemplate(mailTemplate);
    }
  }, [assignLeadOpen, mailTemplate]);

  const handleAssignLeadOpenChange = (open: boolean) => {
    setAssignLeadOpen(open);
    if (!open) {
      setLeadDataId("");
      setAssignmentMailTemplate(mailTemplate);
    }
  };

  const handleAssignLead = async () => {
    const assigned = await assignLead(leadDataId, assignmentMailTemplate);
    if (assigned) {
      handleAssignLeadOpenChange(false);
    }
  };

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

  const handleConfirmAssignRandom = async () => {
    try {
      await assignRandomLeads();
    } finally {
      setAssignRandomConfirmOpen(false);
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
          onAssignClick={() => setAssignLeadOpen(true)}
          onAssignRandomClick={() => setAssignRandomConfirmOpen(true)}
          isAssigningRandomLeads={isAssigningRandomLeads}
          onEditLead={setEditingLead}
          onDeleteLead={setDeletingLead}
        />
      </Card>
      <AssignLeadDialog
        open={assignLeadOpen}
        leadDataId={leadDataId}
        mailTemplate={assignmentMailTemplate}
        isSubmitting={isAddingCampaignLead}
        onOpenChange={handleAssignLeadOpenChange}
        onLeadDataIdChange={setLeadDataId}
        onMailTemplateChange={setAssignmentMailTemplate}
        onSubmit={handleAssignLead}
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
                ? `This will remove lead ${deletingLead.lead_data_id} from the campaign. This action cannot be undone.`
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
      <AlertDialog
        open={assignRandomConfirmOpen}
        onOpenChange={(open) => {
          if (isAssigningRandomLeads) return;
          setAssignRandomConfirmOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Assign random leads?</AlertDialogTitle>
            <AlertDialogDescription>
              This will call the server to add available leads from your configured sources to this campaign at
              random. Existing campaign leads are unchanged; duplicates are skipped per the API response.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isAssigningRandomLeads}>Cancel</AlertDialogCancel>
            <Button disabled={isAssigningRandomLeads} onClick={() => void handleConfirmAssignRandom()}>
              {isAssigningRandomLeads ? "Assigning…" : "Assign random"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
