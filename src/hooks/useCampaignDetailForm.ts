import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildCampaignUpdatePayload,
  CAMPAIGN_DETAIL_STATUSES,
  CAMPAIGN_LEAD_SOURCES,
  CAMPAIGN_TONES,
  type CampaignDetailFormErrors,
  type CampaignDetailFormState,
  type CampaignDetailRunMode,
  type CampaignDetailStatus,
  type CampaignDetailViewModel,
  type CampaignTone,
  validateCampaignDetailForm,
  VALIDATED_CAMPAIGN_DETAIL_FIELDS
} from "@/lib/campaignPresentation";
import { getMaxLeadsPerCampaign } from "@/lib/billing";
import { useBillingStore } from "@/store/billing/billingStore";
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
    status: campaign.status,
    senderDisplayName: campaign.senderDisplayName,
    senderAddress: campaign.senderAddress,
    senderPhone: campaign.senderPhone
  };
}

export function useCampaignDetailForm(campaign: CampaignDetailViewModel) {
  const subscription = useBillingStore((state) => state.subscription);
  const maxLeadsPerCampaign = getMaxLeadsPerCampaign(subscription);

  const [form, setForm] = useState<CampaignDetailFormState>(() => createFormState(campaign));
  const [errors, setErrors] = useState<CampaignDetailFormErrors>({});
  const initialState = useMemo(() => createFormState(campaign), [campaign]);

  useEffect(() => {
    setForm(createFormState(campaign));
    setErrors({});
  }, [campaign]);

  const applyFieldErrors = useCallback(
    (fields: Array<keyof CampaignDetailFormState>, fieldErrors: CampaignDetailFormErrors) => {
      setErrors((prev) => {
        const next = { ...prev };
        fields.forEach((field) => {
          next[field] = fieldErrors[field] || "";
        });
        return next;
      });
    },
    []
  );

  const validateFields = useCallback(
    (formState: CampaignDetailFormState, fields: Array<keyof CampaignDetailFormState>) => {
      const result = validateCampaignDetailForm(formState, fields, { maxLeadsPerCampaign });
      applyFieldErrors(fields, result.fieldErrors);
      return result.ok;
    },
    [applyFieldErrors, maxLeadsPerCampaign]
  );

  const patchField = useCallback(
    <K extends keyof CampaignDetailFormState>(field: K, value: CampaignDetailFormState[K]) => {
      if (field === "exampleTraining") {
        setForm((current) => ({ ...current, exampleTraining: value as string }));
        return;
      }

      setForm((current) => {
        const next = { ...current, [field]: value };
        if (VALIDATED_CAMPAIGN_DETAIL_FIELDS.includes(field)) {
          validateFields(next, [field]);
        }
        return next;
      });
    },
    [validateFields]
  );

  const validateForm = useCallback(() => {
    return validateFields(form, VALIDATED_CAMPAIGN_DETAIL_FIELDS);
  }, [form, validateFields]);

  const hasChanges = useMemo(
    () => JSON.stringify(form) !== JSON.stringify(initialState),
    [form, initialState]
  );

  const hasValidationErrors = useMemo(
    () => Object.values(errors).some((message) => Boolean(message)),
    [errors]
  );

  const buildUpdatePayload = (): UpdateCampaignRequest => buildCampaignUpdatePayload(form, initialState);

  return {
    form,
    errors,
    patchField,
    validateForm,
    hasChanges,
    hasValidationErrors,
    buildUpdatePayload,
    statusOptions: CAMPAIGN_DETAIL_STATUSES,
    leadSourceOptions: CAMPAIGN_LEAD_SOURCES,
    toneOptions: CAMPAIGN_TONES
  };
}
