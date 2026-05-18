import { useCallback, useEffect } from "react";
import { useCampaignStore } from "@/store/campaign/campaignStore";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import type { CreateCampaignFollowUpRequest, UpdateCampaignFollowUpRequest } from "@/types";

export function useCampaignFollowUps(campaignId: string) {
  const campaignFollowUps = useCampaignStore((state) => state.campaignFollowUps);
  const isFetchingCampaignFollowUps = useCampaignStore((state) => state.isFetchingCampaignFollowUps);
  const isCreatingCampaignFollowUp = useCampaignStore((state) => state.isCreatingCampaignFollowUp);
  const isUpdatingCampaignFollowUp = useCampaignStore((state) => state.isUpdatingCampaignFollowUp);
  const isDeletingCampaignFollowUp = useCampaignStore((state) => state.isDeletingCampaignFollowUp);
  const fetchCampaignFollowUps = useCampaignStore((state) => state.fetchCampaignFollowUps);
  const createCampaignFollowUp = useCampaignStore((state) => state.createCampaignFollowUp);
  const updateCampaignFollowUp = useCampaignStore((state) => state.updateCampaignFollowUp);
  const deleteCampaignFollowUp = useCampaignStore((state) => state.deleteCampaignFollowUp);
  const clearCampaignFollowUps = useCampaignStore((state) => state.clearCampaignFollowUps);

  useEffect(() => {
    clearCampaignFollowUps();
  }, [campaignId, clearCampaignFollowUps]);

  useEffect(() => {
    void fetchCampaignFollowUps(campaignId);
  }, [campaignId, fetchCampaignFollowUps]);

  useEffect(() => {
    return () => {
      clearCampaignFollowUps();
    };
  }, [clearCampaignFollowUps]);

  const addFollowUp = useCallback(
    async (payload: CreateCampaignFollowUpRequest) => {
      const name = payload.name.trim();
      if (!name) {
        showApiErrorToast("Follow-up name is required.");
        return false;
      }

      try {
        await createCampaignFollowUp(campaignId, { name, waiting_days: payload.waiting_days });
        showApiSuccessToast("Follow-up step added.");
        return true;
      } catch (error) {
        showApiErrorToast(error);
        return false;
      }
    },
    [campaignId, createCampaignFollowUp]
  );

  const saveFollowUp = useCallback(
    async (followUpId: string, payload: UpdateCampaignFollowUpRequest) => {
      const name = payload.name.trim();
      if (!name) {
        showApiErrorToast("Follow-up name is required.");
        return false;
      }

      try {
        await updateCampaignFollowUp(campaignId, followUpId, { name, waiting_days: payload.waiting_days });
        return true;
      } catch (error) {
        showApiErrorToast(error);
        return false;
      }
    },
    [campaignId, updateCampaignFollowUp]
  );

  const removeFollowUp = useCallback(
    async (followUpId: string) => {
      try {
        await deleteCampaignFollowUp(campaignId, followUpId);
        showApiSuccessToast("Follow-up step removed.");
        return true;
      } catch (error) {
        showApiErrorToast(error);
        return false;
      }
    },
    [campaignId, deleteCampaignFollowUp]
  );

  return {
    campaignFollowUps,
    isFetchingCampaignFollowUps,
    isCreatingCampaignFollowUp,
    isUpdatingCampaignFollowUp,
    isDeletingCampaignFollowUp,
    addFollowUp,
    saveFollowUp,
    removeFollowUp
  };
}
