import { z } from "zod";
import { CAMPAIGN_LEAD_SOURCE_VALUES, type CreateCampaignFollowUpRequest } from "@/types/campaign";

const mailTemplateSampleBaseSchema = z.object({
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject is too long"),
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

export const createCampaignSchema = z.object({
  name: z.string().trim().min(1, "Campaign name is required").max(120, "Campaign name is too long"),
  goal: z.string().trim().min(1, "Campaign goal is required").max(500, "Goal is too long"),
  target_zone: z.string().trim().min(1, "Target zone is required").max(180, "Target zone is too long"),
  call_to_action: z.string().trim().min(1, "Call to action is required").max(180, "Call to action is too long"),
  run_mode: z.enum(["auto", "manual"], {
    errorMap: () => ({ message: "Run mode must be auto or manual" })
  }),
  target_tone: z.string().trim().min(1, "Target tone is required").max(80, "Target tone is too long"),
  mail_training_instruction: z
    .string()
    .trim()
    .min(1, "Mail training instructions are required")
    .max(2000, "Instructions are too long"),
  mail_template_samples: z.array(mailTemplateSampleSchema),
  lead_source: z.enum(CAMPAIGN_LEAD_SOURCE_VALUES, {
    errorMap: () => ({ message: "Lead source must be new, old, or both" })
  }),
  sender_display_name: z
    .string()
    .trim()
    .min(1, "Sender display name is required")
    .max(120, "Sender display name is too long"),
  sender_address: z
    .string()
    .trim()
    .min(1, "Sender address is required")
    .max(180, "Sender address is too long"),
  sender_phone: z
    .string()
    .trim()
    .regex(/^\+?[1-9]\d{1,14}$/, "Please enter a valid phone number")
    .transform((val) => val.replace(/[^\d+]/g, ""))
    .refine((val) => val.length > 0, { message: "Sender phone is required" })
    .refine((val) => val.length <= 15, { message: "Sender phone must be less than 15 digits" }),
  target_leads: z
    .number({ invalid_type_error: "Target leads must be a number" })
    .int("Target leads must be a whole number")
    .min(1, "Target leads must be at least 1")
    .max(1000000, "Target leads is too high"),
  status: z.enum(["draft", "running", "paused", "completed"], {
    errorMap: () => ({ message: "Invalid campaign status" })
  })
});

export type CreateCampaignFormValues = z.infer<typeof createCampaignSchema>;
export type MailTemplateSampleFormValues = z.infer<typeof mailTemplateSampleSchema>;

export const createCampaignFollowUpSchema: z.ZodType<CreateCampaignFollowUpRequest> = z.object({
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

export function parseCreateCampaignFollowUpPayload(
  value: unknown
):
  | { success: true; data: CreateCampaignFollowUpRequest }
  | { success: false; error: z.ZodError } {
  const result = createCampaignFollowUpSchema.safeParse(value);
  if (!result.success) {
    return { success: false, error: result.error };
  }
  return { success: true, data: result.data };
}
