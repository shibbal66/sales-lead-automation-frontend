import { z } from "zod";
import { getCampaignLeadCapacity } from "@/lib/billing";
import { addressSchema, nameSchema, phoneSchema } from "@/validators/auth";
import {
  CAMPAIGN_LEAD_SOURCE_VALUES,
  type CreateCampaignFollowUpRequest,
  type CreateCampaignRequest
} from "@/types/campaign";

function includesLetter(value: string): boolean {
  return /\p{L}/u.test(value);
}

export const MAIL_TEMPLATE_SAMPLE_SUBJECT_MAX_LENGTH = 200;

export const mailTemplateSampleSubjectSchema = z
  .string()
  .trim()
  .min(1, "Subject is required")
  .max(
    MAIL_TEMPLATE_SAMPLE_SUBJECT_MAX_LENGTH,
    `Subject must be ${MAIL_TEMPLATE_SAMPLE_SUBJECT_MAX_LENGTH} characters or less`
  )
  .refine(includesLetter, {
    message: "Subject must include at least one letter"
  });

const mailTemplateSampleBaseSchema = z.object({
  subject: mailTemplateSampleSubjectSchema,
  body: z.string(),
  html: z.string(),
  text: z.string()
});

export const mailTemplateSampleSchema = mailTemplateSampleBaseSchema.superRefine((data, ctx) => {
  const hasBody = data.body.trim().length > 0;
  const hasHtml = data.html.trim().length > 0;
  const hasText = data.text.trim().length > 0;
  const filledCount = [hasBody, hasHtml, hasText].filter(Boolean).length;

  if (filledCount === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Enter content as plain body, HTML, or plain text.",
      path: ["body"]
    });
    return;
  }

  if (filledCount > 1) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Use only one content format per sample.",
      path: ["body"]
    });
    return;
  }

  const content = hasBody ? data.body.trim() : hasHtml ? data.html.trim() : data.text.trim();
  const max = 10000;
  if (content.length > max) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Content is too long",
      path: [hasBody ? "body" : hasHtml ? "html" : "text"]
    });
  }
}).transform((data) => ({
  subject: data.subject.trim(),
  body: data.body.trim(),
  html: data.html.trim(),
  text: data.text.trim()
}));

export const CAMPAIGN_NAME_MAX_LENGTH = 120;

const letterNumberSpacePattern = /^[\p{L}\p{N}\s]+$/u;
const letterNumberSpacePunctuationPattern = /^[\p{L}\p{N}\s\p{P}]+$/u;

export const campaignNameSchema = z
  .string()
  .trim()
  .min(1, "Campaign name is required")
  .max(CAMPAIGN_NAME_MAX_LENGTH, `Campaign name must be ${CAMPAIGN_NAME_MAX_LENGTH} characters or less`)
  .regex(letterNumberSpacePattern, "Campaign name must contain only letters, numbers, and spaces")
  .refine(includesLetter, {
    message: "Campaign name must include at least one letter"
  });

/** Strips invalid characters and enforces max length while typing. */
export function sanitizeCampaignNameInput(value: string): string {
  return value.replace(/[^\p{L}\p{N}\s]/gu, "").slice(0, CAMPAIGN_NAME_MAX_LENGTH);
}

export const TARGET_ZONE_MAX_LENGTH = 60;

export const targetZoneSchema = z
  .string()
  .trim()
  .min(1, "Target zone is required")
  .max(TARGET_ZONE_MAX_LENGTH, `Target zone must be ${TARGET_ZONE_MAX_LENGTH} characters or less`)
  .regex(letterNumberSpacePattern, "Target zone must contain only letters, numbers, and spaces")
  .refine(includesLetter, {
    message: "Target zone must include at least one letter"
  });

/** Strips invalid characters and enforces max length while typing. */
export function sanitizeCampaignTargetZoneInput(value: string): string {
  return value.replace(/[^\p{L}\p{N}\s]/gu, "").slice(0, TARGET_ZONE_MAX_LENGTH);
}

export const CALL_TO_ACTION_MAX_LENGTH = 120;

export const callToActionSchema = z
  .string()
  .trim()
  .min(1, "Call to action is required")
  .max(CALL_TO_ACTION_MAX_LENGTH, `Call to action must be ${CALL_TO_ACTION_MAX_LENGTH} characters or less`)
  .regex(
    letterNumberSpacePunctuationPattern,
    "Call to action must contain only letters, numbers, spaces, and punctuation"
  )
  .refine(includesLetter, {
    message: "Call to action must include at least one letter"
  });

/** Strips invalid characters and enforces max length while typing. */
export function sanitizeCampaignCallToActionInput(value: string): string {
  return value.replace(/[^\p{L}\p{N}\s\p{P}]/gu, "").slice(0, CALL_TO_ACTION_MAX_LENGTH);
}

export const MAIL_TRAINING_INSTRUCTION_MAX_LENGTH = 2000;

export const mailTrainingInstructionSchema = z
  .string()
  .trim()
  .min(1, "Mail training instructions are required")
  .max(
    MAIL_TRAINING_INSTRUCTION_MAX_LENGTH,
    `Instructions must be ${MAIL_TRAINING_INSTRUCTION_MAX_LENGTH} characters or less`
  )
  .refine(includesLetter, {
    message: "Mail training instructions must include at least one letter"
  });

export const CAMPAIGN_GOAL_MAX_LENGTH = 500;

export const campaignGoalSchema = z
  .string()
  .trim()
  .min(1, "Campaign goal is required")
  .max(CAMPAIGN_GOAL_MAX_LENGTH, `Campaign goal must be ${CAMPAIGN_GOAL_MAX_LENGTH} characters or less`)
  .refine(includesLetter, {
    message: "Campaign goal must include at least one letter"
  });

export const TARGET_LEADS_ABSOLUTE_MAX = 1_000_000;

export function buildTargetLeadsSchema(maxLeadsPerCampaign: number) {
  const limit = Math.max(1, Math.min(maxLeadsPerCampaign, TARGET_LEADS_ABSOLUTE_MAX));
  return z
    .number({ invalid_type_error: "Target leads must be a number" })
    .int("Target leads must be a whole number")
    .min(1, "Target leads must be at least 1")
    .max(
      limit,
      `Target leads cannot exceed your plan limit of ${limit.toLocaleString()}`
    );
}

export function buildBulkLeadAddCountSchema(options: {
  maxLeadsPerCampaign: number;
  currentLeadCount: number;
  campaignTargetLeads?: number;
}) {
  const { maxAllowed, remainingSlots } = getCampaignLeadCapacity(options);

  return z
    .number({ invalid_type_error: "Selection count must be a number" })
    .int()
    .min(1, "Select at least one lead.")
    .max(
      remainingSlots,
      remainingSlots === 0
        ? `This campaign already has the maximum of ${maxAllowed.toLocaleString()} leads allowed on your plan.`
        : `You can only add ${remainingSlots.toLocaleString()} more lead${remainingSlots === 1 ? "" : "s"} (${maxAllowed.toLocaleString()} max per campaign).`
    );
}

export function createCampaignSchemaForPlan(maxLeadsPerCampaign: number) {
  return z.object({
    name: campaignNameSchema,
    goal: campaignGoalSchema,
    target_zone: targetZoneSchema,
    call_to_action: callToActionSchema,
    run_mode: z.enum(["auto", "manual"], {
      errorMap: () => ({ message: "Run mode must be auto or manual" })
    }),
    target_tone: z.string().trim().min(1, "Target tone is required").max(80, "Target tone is too long"),
    mail_training_instruction: mailTrainingInstructionSchema,
    mail_template_samples: z.array(mailTemplateSampleSchema),
    lead_source: z.enum(CAMPAIGN_LEAD_SOURCE_VALUES, {
      errorMap: () => ({ message: "Lead source must be new, old, or both" })
    }),
    sender_display_name: nameSchema,
    sender_address: addressSchema,
    sender_phone: phoneSchema,
    target_leads: buildTargetLeadsSchema(maxLeadsPerCampaign),
    status: z.enum(["draft", "running", "paused", "completed"], {
      errorMap: () => ({ message: "Invalid campaign status" })
    })
  });
}

export const createCampaignSchema = createCampaignSchemaForPlan(TARGET_LEADS_ABSOLUTE_MAX);

export type CreateCampaignFormValues = z.infer<typeof createCampaignSchema>;
export type MailTemplateSampleFormValues = z.infer<typeof mailTemplateSampleSchema>;

export const createCampaignFollowUpSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120, "Name is too long"),
  waiting_days: z
    .number({ invalid_type_error: "Wait days must be a number" })
    .int("Wait days must be a whole number")
    .min(1, "Wait days must be at least 1")
    .max(365, "Wait days is too high"),
  body_template: z
    .string()
    .trim()
    .min(1, "Mail template is required")
    .max(1200, "Mail template is too long")
});

export type CreateCampaignFollowUpFormValues = CreateCampaignFollowUpRequest;

export type ParseCreateCampaignResult =
  | { success: true; data: CreateCampaignRequest }
  | { success: false; error: z.ZodError<CreateCampaignFormValues> };

export function parseCreateCampaignPayload(value: unknown): ParseCreateCampaignResult {
  const result = createCampaignSchema.safeParse(value);
  if (!result.success) {
    return { success: false as const, error: result.error };
  }
  const data = result.data;
  return {
    success: true as const,
    data: {
      name: data.name,
      goal: data.goal,
      target_zone: data.target_zone,
      call_to_action: data.call_to_action,
      run_mode: data.run_mode,
      target_tone: data.target_tone,
      mail_training_instruction: data.mail_training_instruction,
      mail_template_samples: data.mail_template_samples,
      lead_source: data.lead_source,
      sender_display_name: data.sender_display_name,
      sender_address: data.sender_address,
      sender_phone: data.sender_phone,
      target_leads: data.target_leads,
      status: data.status
    }
  };
}

export function parseCreateCampaignFollowUpPayload(
  value: unknown
):
  | { success: true; data: CreateCampaignFollowUpRequest }
  | { success: false; error: z.ZodError } {
  const result = createCampaignFollowUpSchema.safeParse(value);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, data: {
    name: result.data.name,
    waiting_days: result.data.waiting_days,
    body_template: result.data.body_template
  } };
}
