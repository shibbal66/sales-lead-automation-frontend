import { useEffect, useMemo, useState } from "react";
import {
  buildCampaignUpdatePayload,
  CAMPAIGN_DETAIL_STATUSES,
  CAMPAIGN_LEAD_SOURCES,
  CAMPAIGN_TONES,
  type CampaignDetailFormState,
  type CampaignDetailRunMode,
  type CampaignDetailStatus,
  type CampaignDetailViewModel,
  type CampaignTone
} from "@/lib/campaignPresentation";
import type { CampaignLeadSource, MailTemplateSample } from "@/types";
import type { UpdateCampaignRequest } from "@/types";

const DEFAULT_MAIL_TEMPLATE =
  "Write in a warm, conversational tone. Mention the company's recent product launches if available from their website. Always reference the specific pain point of scaling sales teams. Keep emails under 120 words. End with a soft CTA asking for a 15-minute call.";

function resolveTone(value: string): CampaignTone {
  return (CAMPAIGN_TONES as readonly string[]).includes(value) ? (value as CampaignTone) : CAMPAIGN_TONES[0];
}

function createFormState(campaign: CampaignDetailViewModel): CampaignDetailFormState {
  return {
    name: campaign.name,
    goal: campaign.goal,
    targetZone: campaign.targetZone,
    callToAction: campaign.callToAction,
    leadSource: campaign.leadSource,
    runMode: campaign.runMode,
    mailTemplate: campaign.mailTrainingInstruction || DEFAULT_MAIL_TEMPLATE,
    exampleTraining: "",
    mailTemplateSamples: campaign.mailTemplateSamples.map((sample) => ({ ...sample })),
    tone: resolveTone(campaign.targetTone),
    targetLeads: campaign.targetLeads,
    status: campaign.status
  };
}

export function useCampaignDetailForm(campaign: CampaignDetailViewModel) {
  const [form, setForm] = useState<CampaignDetailFormState>(() => createFormState(campaign));
  const initialState = useMemo(() => createFormState(campaign), [campaign]);

  useEffect(() => {
    setForm(createFormState(campaign));
  }, [campaign]);

  const hasChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialState),
    [form, initialState]
  );

  const buildUpdatePayload = (): UpdateCampaignRequest => buildCampaignUpdatePayload(form, initialState);

  return {
    form,
    setName: (name: string) => setForm((current) => ({ ...current, name })),
    setGoal: (goal: string) => setForm((current) => ({ ...current, goal })),
    setTargetZone: (targetZone: string) => setForm((current) => ({ ...current, targetZone })),
    setCallToAction: (callToAction: string) => setForm((current) => ({ ...current, callToAction })),
    setLeadSource: (leadSource: CampaignLeadSource) => setForm((current) => ({ ...current, leadSource })),
    setRunMode: (runMode: CampaignDetailRunMode) => setForm((current) => ({ ...current, runMode })),
    setMailTemplate: (mailTemplate: string) => setForm((current) => ({ ...current, mailTemplate })),
    setExampleTraining: (exampleTraining: string) => setForm((current) => ({ ...current, exampleTraining })),
    setMailTemplateSamples: (mailTemplateSamples: MailTemplateSample[]) =>
      setForm((current) => ({ ...current, mailTemplateSamples })),
    setTone: (tone: CampaignTone) => setForm((current) => ({ ...current, tone })),
    setTargetLeads: (targetLeads: number) => setForm((current) => ({ ...current, targetLeads })),
    setStatus: (status: CampaignDetailStatus) => setForm((current) => ({ ...current, status })),
    hasChanges,
    buildUpdatePayload,
    statusOptions: CAMPAIGN_DETAIL_STATUSES,
    leadSourceOptions: CAMPAIGN_LEAD_SOURCES,
    toneOptions: CAMPAIGN_TONES
  };
}
