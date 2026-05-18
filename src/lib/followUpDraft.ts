import type { CampaignFollowUpApiModel } from "@/types";

export type FollowUpDraft = { name: string; waiting_days: number; body_template: string };

export function buildFollowUpDrafts(followUps: CampaignFollowUpApiModel[]): Record<string, FollowUpDraft> {
  return Object.fromEntries(
    followUps.map((step) => [
      step.id,
      { name: step.name, waiting_days: step.waiting_days, body_template: step.body_template ?? "" }
    ])
  );
}

export function isFollowUpDraftDirty(step: CampaignFollowUpApiModel, draft: FollowUpDraft) {
  return (
    draft.name.trim() !== step.name ||
    draft.waiting_days !== step.waiting_days ||
    draft.body_template !== (step.body_template ?? "")
  );
}

export function getDirtyFollowUpIds(
  followUps: CampaignFollowUpApiModel[],
  drafts: Record<string, FollowUpDraft>
) {
  return followUps
    .filter((step) => {
      const draft = drafts[step.id];
      return draft ? isFollowUpDraftDirty(step, draft) : false;
    })
    .map((step) => step.id);
}

export function normalizeFollowUpPayload(payload: FollowUpDraft) {
  return {
    name: payload.name.trim(),
    waiting_days: payload.waiting_days,
    body_template: payload.body_template.trim()
  };
}
