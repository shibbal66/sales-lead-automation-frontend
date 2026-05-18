import { create } from "zustand";
import {
  createCampaignFollowUp as createCampaignFollowUpApi,
  deleteCampaignFollowUp as deleteCampaignFollowUpApi,
  getCampaignFollowUps as getCampaignFollowUpsApi,
  updateCampaignFollowUp as updateCampaignFollowUpApi
} from "@/services/campaign/campaignServices";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import {
  buildFollowUpDrafts,
  getDirtyFollowUpIds,
  normalizeFollowUpPayload,
  type FollowUpDraft
} from "@/lib/followUpDraft";
import type {
  CampaignFollowUpApiModel,
  CreateCampaignFollowUpRequest,
  UpdateCampaignFollowUpRequest
} from "@/types";

const followUpInitialState = {
  campaignId: null as string | null,
  items: [] as CampaignFollowUpApiModel[],
  drafts: {} as Record<string, FollowUpDraft>,
  expandedBodyIds: [] as string[],
  editingIds: [] as string[],
  isFetching: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false
};

type CampaignFollowUpStoreState = typeof followUpInitialState & {
  loadFollowUps: (campaignId: string) => Promise<void>;
  reset: () => void;
  createFollowUp: (campaignId: string, payload: CreateCampaignFollowUpRequest) => Promise<boolean>;
  updateFollowUp: (
    campaignId: string,
    followUpId: string,
    payload: UpdateCampaignFollowUpRequest
  ) => Promise<boolean>;
  deleteFollowUp: (campaignId: string, followUpId: string) => Promise<boolean>;
  updateDraft: (followUpId: string, patch: Partial<FollowUpDraft>) => void;
  toggleBodyExpanded: (followUpId: string) => void;
  startEditing: (followUpId: string) => void;
  stopEditing: (followUpId: string) => void;
  discardChanges: () => void;
  saveDirtyChanges: () => Promise<boolean>;
};

function applyFollowUpItems(items: CampaignFollowUpApiModel[]) {
  return {
    items,
    drafts: buildFollowUpDrafts(items),
    expandedBodyIds: [],
    editingIds: []
  };
}

function removeFollowUpFromUiState(
  state: Pick<CampaignFollowUpStoreState, "expandedBodyIds" | "editingIds" | "drafts">,
  followUpId: string
) {
  const { [followUpId]: _removed, ...drafts } = state.drafts;
  return {
    drafts,
    expandedBodyIds: state.expandedBodyIds.filter((id) => id !== followUpId),
    editingIds: state.editingIds.filter((id) => id !== followUpId)
  };
}

export const useCampaignFollowUpStore = create<CampaignFollowUpStoreState>((set, get) => ({
  ...followUpInitialState,

  reset: () =>
    set({
      campaignId: null,
      items: [],
      drafts: {},
      expandedBodyIds: [],
      editingIds: [],
      isFetching: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false
    }),

  loadFollowUps: async (campaignId) => {
    const { campaignId: activeCampaignId } = get();
    if (activeCampaignId !== campaignId) {
      set({ ...followUpInitialState, campaignId });
    }

    set({ isFetching: true });
    try {
      const response = await getCampaignFollowUpsApi(campaignId);
      if (!response.success) {
        showApiErrorToast(response);
        return;
      }
      set({
        campaignId,
        ...applyFollowUpItems(response.data?.followUps ?? [])
      });
    } finally {
      set({ isFetching: false });
    }
  },

  createFollowUp: async (campaignId, payload) => {
    const name = payload.name.trim();
    if (!name) {
      showApiErrorToast("Follow-up name is required.");
      return false;
    }

    set({ isCreating: true });
    try {
      const response = await createCampaignFollowUpApi(campaignId, {
        name,
        waiting_days: payload.waiting_days,
        body_template: payload.body_template.trim()
      });
      if (!response.success || !response.data?.followUp) {
        showApiErrorToast(response);
        return false;
      }

      const followUp = response.data.followUp;
      set((state) => ({
        campaignId,
        items: [...state.items, followUp],
        drafts: { ...state.drafts, [followUp.id]: buildFollowUpDrafts([followUp])[followUp.id] }
      }));
      showApiSuccessToast("Follow-up step added.");
      return true;
    } catch (error) {
      showApiErrorToast(error);
      return false;
    } finally {
      set({ isCreating: false });
    }
  },

  updateFollowUp: async (campaignId, followUpId, payload) => {
    const name = payload.name.trim();
    if (!name) {
      showApiErrorToast("Follow-up name is required.");
      return false;
    }

    set({ isUpdating: true });
    try {
      const response = await updateCampaignFollowUpApi(campaignId, followUpId, {
        name,
        waiting_days: payload.waiting_days,
        body_template: payload.body_template.trim()
      });
      if (!response.success) {
        showApiErrorToast(response);
        return false;
      }

      const followUp = response.data?.followUp;
      set((state) => {
        const existing = state.items.find((item) => item.id === followUpId);
        if (!followUp && !existing) return state;

        const nextItem =
          followUp ??
          ({
            ...existing!,
            name,
            waiting_days: payload.waiting_days,
            body_template: payload.body_template.trim()
          } satisfies CampaignFollowUpApiModel);

        const items = state.items.map((item) => (item.id === followUpId ? nextItem : item));
        return {
          items,
          drafts: {
            ...state.drafts,
            [followUpId]: buildFollowUpDrafts([nextItem])[followUpId]
          }
        };
      });
      return true;
    } catch (error) {
      showApiErrorToast(error);
      return false;
    } finally {
      set({ isUpdating: false });
    }
  },

  deleteFollowUp: async (campaignId, followUpId) => {
    set({ isDeleting: true });
    try {
      const response = await deleteCampaignFollowUpApi(campaignId, followUpId);
      if (!response.success) {
        showApiErrorToast(response);
        return false;
      }

      set((state) => ({
        items: state.items.filter((item) => item.id !== followUpId),
        ...removeFollowUpFromUiState(state, followUpId)
      }));
      showApiSuccessToast("Follow-up step removed.");
      return true;
    } catch (error) {
      showApiErrorToast(error);
      return false;
    } finally {
      set({ isDeleting: false });
    }
  },

  updateDraft: (followUpId, patch) => {
    set((state) => {
      const current = state.drafts[followUpId];
      if (!current) return state;
      return { drafts: { ...state.drafts, [followUpId]: { ...current, ...patch } } };
    });
  },

  toggleBodyExpanded: (followUpId) => {
    set((state) => {
      const expanded = new Set(state.expandedBodyIds);
      if (expanded.has(followUpId)) expanded.delete(followUpId);
      else expanded.add(followUpId);
      return { expandedBodyIds: [...expanded] };
    });
  },

  startEditing: (followUpId) => {
    set((state) => ({
      editingIds: state.editingIds.includes(followUpId) ? state.editingIds : [...state.editingIds, followUpId],
      expandedBodyIds: state.expandedBodyIds.filter((id) => id !== followUpId)
    }));
  },

  stopEditing: (followUpId) => {
    set((state) => ({
      editingIds: state.editingIds.filter((id) => id !== followUpId)
    }));
  },

  discardChanges: () => {
    set((state) => ({
      drafts: buildFollowUpDrafts(state.items),
      expandedBodyIds: [],
      editingIds: []
    }));
  },

  saveDirtyChanges: async () => {
    const { campaignId, items, drafts } = get();
    if (!campaignId) return false;

    const dirtyIds = getDirtyFollowUpIds(items, drafts);
    if (dirtyIds.length === 0) return true;

    const results = await Promise.all(
      dirtyIds.map((followUpId) => {
        const draft = drafts[followUpId];
        if (!draft) return Promise.resolve(false);
        return get().updateFollowUp(campaignId, followUpId, normalizeFollowUpPayload(draft));
      })
    );

    if (results.every(Boolean)) {
      set({ editingIds: [] });
      showApiSuccessToast("Follow-up steps saved.");
      return true;
    }
    return false;
  }
}));

export function selectCampaignFollowUps(state: CampaignFollowUpStoreState) {
  return state.items;
}

export function selectFollowUpDrafts(state: CampaignFollowUpStoreState) {
  return state.drafts;
}
