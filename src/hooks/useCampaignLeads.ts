import { useCallback, useEffect, useState } from "react";
import { useCampaignStore } from "@/store/campaign/campaignStore";
import { sendCampaignLeadEmails } from "@/services/campaign/campaignServices";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import { clampPage, getTotalPages } from "@/lib/listPagination";
import type {
  CampaignLeadStatus,
  CampaignLeadsStatusFilter,
  UpdateCampaignLeadRequest,
} from "@/types";

export function useCampaignLeads(campaignId: string) {
  const [sendingEmailLeadId, setSendingEmailLeadId] = useState<string | null>(null);
  const campaignLeads = useCampaignStore((state) => state.campaignLeads);
  const campaignLeadsTotal = useCampaignStore((state) => state.campaignLeadsTotal);
  const campaignLeadsPage = useCampaignStore((state) => state.campaignLeadsPage);
  const campaignLeadsLimit = useCampaignStore((state) => state.campaignLeadsLimit);
  const isFetchingCampaignLeads = useCampaignStore((state) => state.isFetchingCampaignLeads);
  const isAddingCampaignLead = useCampaignStore((state) => state.isAddingCampaignLead);
  const isBulkAddingCampaignLeads = useCampaignStore((state) => state.isBulkAddingCampaignLeads);
  const bulkAddCampaignLeads = useCampaignStore((state) => state.bulkAddCampaignLeads);
  const fetchCampaignById = useCampaignStore((state) => state.fetchCampaignById);
  const isUpdatingCampaignLead = useCampaignStore((state) => state.isUpdatingCampaignLead);
  const isDeletingCampaignLead = useCampaignStore((state) => state.isDeletingCampaignLead);
  const fetchCampaignLeads = useCampaignStore((state) => state.fetchCampaignLeads);
  const addCampaignLead = useCampaignStore((state) => state.addCampaignLead);
  const updateCampaignLead = useCampaignStore((state) => state.updateCampaignLead);
  const deleteCampaignLead = useCampaignStore((state) => state.deleteCampaignLead);
  const clearCampaignLeads = useCampaignStore((state) => state.clearCampaignLeads);
  const setCampaignLeadsPage = useCampaignStore((state) => state.setCampaignLeadsPage);
  const campaignLeadsStatusFilter = useCampaignStore(
    (state) => state.campaignLeadsStatusFilter,
  );
  const setCampaignLeadsStatusFilter = useCampaignStore(
    (state) => state.setCampaignLeadsStatusFilter,
  );

  const totalPages = getTotalPages(campaignLeadsTotal, campaignLeadsLimit);
  const statusFilter: CampaignLeadsStatusFilter =
    campaignLeadsStatusFilter ?? "all";

  useEffect(() => {
    clearCampaignLeads();
    setCampaignLeadsPage(1);
    setCampaignLeadsStatusFilter(undefined);
  }, [
    campaignId,
    clearCampaignLeads,
    setCampaignLeadsPage,
    setCampaignLeadsStatusFilter,
  ]);

  useEffect(() => {
    void fetchCampaignLeads(campaignId, {
      page: campaignLeadsPage,
      limit: campaignLeadsLimit,
      status: campaignLeadsStatusFilter,
    });
  }, [
    campaignId,
    campaignLeadsPage,
    campaignLeadsLimit,
    campaignLeadsStatusFilter,
    fetchCampaignLeads,
  ]);

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
    [setCampaignLeadsPage, totalPages],
  );

  const handleStatusFilterChange = useCallback(
    (value: CampaignLeadsStatusFilter) => {
      setCampaignLeadsStatusFilter(value === "all" ? undefined : value);
      setCampaignLeadsPage(1);
    },
    [setCampaignLeadsPage, setCampaignLeadsStatusFilter],
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
      } catch (error) {
        showApiErrorToast(error);
        return false;
      }
    },
    [addCampaignLead, campaignId, campaignLeadsLimit, fetchCampaignLeads, setCampaignLeadsPage]
  );

  const saveCampaignLead = useCallback(
    async (campaignLeadId: string, payload: UpdateCampaignLeadRequest) => {
      try {
        await updateCampaignLead(campaignId, campaignLeadId, payload);
        showApiSuccessToast("Campaign lead updated.");
        return true;
      } catch (error) {
        showApiErrorToast(error);
        return false;
      }
    },
    [campaignId, updateCampaignLead]
  );

  const bulkAssignLeads = useCallback(
    async (leadDataIds: string[]) => {
      if (leadDataIds.length === 0) {
        showApiErrorToast("Select at least one lead.");
        return false;
      }

      try {
        const message = await bulkAddCampaignLeads(campaignId, {
          leads: leadDataIds.map((lead_data_id) => ({ lead_data_id }))
        });
        showApiSuccessToast(message);
        setCampaignLeadsPage(1);
        await fetchCampaignLeads(campaignId, { page: 1, limit: campaignLeadsLimit });
        void fetchCampaignById(campaignId);
        return true;
      } catch (error) {
        showApiErrorToast(error);
        return false;
      }
    },
    [
      bulkAddCampaignLeads,
      campaignId,
      campaignLeadsLimit,
      fetchCampaignById,
      fetchCampaignLeads,
      setCampaignLeadsPage
    ]
  );

  const removeCampaignLead = useCallback(
    async (campaignLeadId: string) => {
      try {
        await deleteCampaignLead(campaignId, campaignLeadId);
        showApiSuccessToast("Lead removed from campaign.");
        return true;
      } catch (error) {
        showApiErrorToast(error);
        return false;
      }
    },
    [campaignId, deleteCampaignLead]
  );

  const sendCampaignLeadEmail = useCallback(
    async (campaignLeadId: string) => {
      if (sendingEmailLeadId) return false;

      setSendingEmailLeadId(campaignLeadId);
      try {
        const response = await sendCampaignLeadEmails(campaignId, {
          campaign_lead_id: campaignLeadId
        });
        if (!response.success) {
          showApiErrorToast(response);
          return false;
        }

        showApiSuccessToast(response.message || "Email sent successfully.");
        await fetchCampaignLeads(campaignId, {
          page: campaignLeadsPage,
          limit: campaignLeadsLimit,
          status: campaignLeadsStatusFilter
        });
        void fetchCampaignById(campaignId);
        return true;
      } catch (error) {
        showApiErrorToast(error);
        return false;
      } finally {
        setSendingEmailLeadId(null);
      }
    },
    [
      campaignId,
      campaignLeadsLimit,
      campaignLeadsPage,
      campaignLeadsStatusFilter,
      fetchCampaignById,
      fetchCampaignLeads,
      sendingEmailLeadId
    ]
  );

  return {
    campaignLeads,
    campaignLeadsTotal,
    currentPage: campaignLeadsPage,
    totalPages,
    isFetchingCampaignLeads,
    isAddingCampaignLead,
    isBulkAddingCampaignLeads,
    isUpdatingCampaignLead,
    isDeletingCampaignLead,
    handlePageChange,
    statusFilter,
    handleStatusFilterChange,
    assignLead,
    bulkAssignLeads,
    saveCampaignLead,
    removeCampaignLead,
    sendCampaignLeadEmail,
    sendingEmailLeadId
  };
}
