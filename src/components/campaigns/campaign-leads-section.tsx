import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { CampaignLeadsTable } from "@/components/campaigns/campaign-leads-table";
import { AssignLeadDialog } from "@/components/campaigns/assign-lead-dialog";
import { useCampaignLeads } from "@/hooks/useCampaignLeads";

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
    handlePageChange,
    assignLead
  } = useCampaignLeads(campaignId);
  const [assignLeadOpen, setAssignLeadOpen] = useState(false);
  const [leadDataId, setLeadDataId] = useState("");
  const [assignmentMailTemplate, setAssignmentMailTemplate] = useState(mailTemplate);

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
    </>
  );
}
