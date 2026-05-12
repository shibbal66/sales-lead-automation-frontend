import { useCallback, useEffect } from "react";
import { useCampaignStore } from "@/store/campaign/campaignStore";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import { clampPage, getTotalPages } from "@/lib/listPagination";

export function useCampaignLeads(campaignId: string) {
  const campaignLeads = useCampaignStore((state) => state.campaignLeads);
  const campaignLeadsTotal = useCampaignStore((state) => state.campaignLeadsTotal);
  const campaignLeadsPage = useCampaignStore((state) => state.campaignLeadsPage);
  const campaignLeadsLimit = useCampaignStore((state) => state.campaignLeadsLimit);
  const isFetchingCampaignLeads = useCampaignStore((state) => state.isFetchingCampaignLeads);
  const isAddingCampaignLead = useCampaignStore((state) => state.isAddingCampaignLead);
  const fetchCampaignLeads = useCampaignStore((state) => state.fetchCampaignLeads);
  const addCampaignLead = useCampaignStore((state) => state.addCampaignLead);
  const clearCampaignLeads = useCampaignStore((state) => state.clearCampaignLeads);
  const setCampaignLeadsPage = useCampaignStore((state) => state.setCampaignLeadsPage);

  const totalPages = getTotalPages(campaignLeadsTotal, campaignLeadsLimit);

  useEffect(() => {
    clearCampaignLeads();
    setCampaignLeadsPage(1);
  }, [campaignId, clearCampaignLeads, setCampaignLeadsPage]);

  useEffect(() => {
    void fetchCampaignLeads(campaignId, { page: campaignLeadsPage, limit: campaignLeadsLimit });
  }, [campaignId, campaignLeadsPage, campaignLeadsLimit, fetchCampaignLeads]);

  useEffect(() => {
    return () => {
      clearCampaignLeads();
    };
  }, [clearCampaignLeads]);

  useEffect(() => {
    if (isFetchingCampaignLeads || campaignLeadsTotal === 0) return;
    const nextPage = clampPage(campaignLeadsPage, totalPages);
    if (nextPage !== campaignLeadsPage) {
      setCampaignLeadsPage(nextPage);
    }
  }, [
    campaignLeadsPage,
    campaignLeadsTotal,
    isFetchingCampaignLeads,
    setCampaignLeadsPage,
    totalPages
  ]);

  const handlePageChange = useCallback(
    (page: number) => {
      setCampaignLeadsPage(clampPage(page, totalPages));
    },
    [setCampaignLeadsPage, totalPages]
  );

  const assignLead = useCallback(
    async (leadDataId: string, mailTemplate: string) => {
      const trimmedLeadDataId = leadDataId.trim();
      const trimmedMailTemplate = mailTemplate.trim();
      if (!trimmedLeadDataId) {
        showApiErrorToast("Lead ID is required.");
        return false;
      }
      if (!trimmedMailTemplate) {
        showApiErrorToast("Campaign mail template is required.");
        return false;
      }

      try {
        await addCampaignLead(campaignId, {
          lead_data_id: trimmedLeadDataId,
          mail_template: trimmedMailTemplate
        });
        showApiSuccessToast("Lead added to campaign.");
        setCampaignLeadsPage(1);
        await fetchCampaignLeads(campaignId, { page: 1, limit: campaignLeadsLimit });
        return true;
      } catch {
        return false;
      }
    },
    [addCampaignLead, campaignId, campaignLeadsLimit, fetchCampaignLeads, setCampaignLeadsPage]
  );

  return {
    campaignLeads,
    campaignLeadsTotal,
    currentPage: campaignLeadsPage,
    totalPages,
    isFetchingCampaignLeads,
    isAddingCampaignLead,
    handlePageChange,
    assignLead
  };
}
