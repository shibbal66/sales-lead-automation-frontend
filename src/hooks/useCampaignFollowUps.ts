import { useEffect } from "react";
import { useShallow } from "zustand/react/shallow";
import { getDirtyFollowUpIds } from "@/lib/followUpDraft";
import {
  selectCampaignFollowUps,
  selectFollowUpDrafts,
  useCampaignFollowUpStore
} from "@/store/campaign/campaignFollowUpStore";
import type { CreateCampaignFollowUpRequest } from "@/types";

export function useCampaignFollowUps(campaignId: string) {
  const items = useCampaignFollowUpStore(selectCampaignFollowUps);
  const drafts = useCampaignFollowUpStore(selectFollowUpDrafts);
  const dirtyFollowUpIds = useCampaignFollowUpStore(
    useShallow((state) => getDirtyFollowUpIds(state.items, state.drafts))
  );
  const hasFollowUpChanges = dirtyFollowUpIds.length > 0;
  const expandedBodyIds = useCampaignFollowUpStore((state) => state.expandedBodyIds);
  const editingIds = useCampaignFollowUpStore((state) => state.editingIds);
  const isFetching = useCampaignFollowUpStore((state) => state.isFetching);
  const isCreating = useCampaignFollowUpStore((state) => state.isCreating);
  const isUpdating = useCampaignFollowUpStore((state) => state.isUpdating);
  const isDeleting = useCampaignFollowUpStore((state) => state.isDeleting);
  const createFollowUp = useCampaignFollowUpStore((state) => state.createFollowUp);
  const deleteFollowUp = useCampaignFollowUpStore((state) => state.deleteFollowUp);
  const updateDraft = useCampaignFollowUpStore((state) => state.updateDraft);
  const toggleBodyExpanded = useCampaignFollowUpStore((state) => state.toggleBodyExpanded);
  const startEditing = useCampaignFollowUpStore((state) => state.startEditing);
  const stopEditing = useCampaignFollowUpStore((state) => state.stopEditing);
  const discardChanges = useCampaignFollowUpStore((state) => state.discardChanges);
  const saveDirtyChanges = useCampaignFollowUpStore((state) => state.saveDirtyChanges);

  useEffect(() => {
    void useCampaignFollowUpStore.getState().loadFollowUps(campaignId);
    return () => useCampaignFollowUpStore.getState().reset();
  }, [campaignId]);

  const addFollowUp = (payload: CreateCampaignFollowUpRequest) => createFollowUp(campaignId, payload);

  const removeFollowUp = (followUpId: string) => deleteFollowUp(campaignId, followUpId);

  return {
    campaignFollowUps: items,
    followUpDrafts: drafts,
    dirtyFollowUpIds,
    hasFollowUpChanges,
    expandedBodyIds,
    editingIds,
    isFetchingCampaignFollowUps: isFetching,
    isCreatingCampaignFollowUp: isCreating,
    isUpdatingCampaignFollowUp: isUpdating,
    isDeletingCampaignFollowUp: isDeleting,
    addFollowUp,
    removeFollowUp,
    updateDraft,
    toggleBodyExpanded,
    startEditing,
    stopEditing,
    discardChanges,
    saveDirtyChanges
  };
}
