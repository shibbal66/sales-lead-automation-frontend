import { z } from "zod";

export const createCampaignSchema = z.object({
  name: z.string().trim().min(1, "Campaign name is required").max(120, "Campaign name is too long"),
  goal: z.string().trim().min(1, "Campaign goal is required").max(500, "Goal is too long"),
  target_zone: z.string().trim().min(1, "Target zone is required").max(180, "Target zone is too long"),
  call_to_action: z.string().trim().min(1, "Call to action is required").max(180, "Call to action is too long"),
  run_mode: z.enum(["auto", "manual"], {
    errorMap: () => ({ message: "Run mode must be auto or manual" })
  }),
  lead_source: z.enum(["new", "existing", "both"], {
    errorMap: () => ({ message: "Lead source must be new, existing, or both" })
  }),
  mail_template: z.string().trim().min(1, "Mail template is required").max(6000, "Mail template is too long"),
  example_training: z.string().trim().min(1, "Example training is required").max(6000, "Example training is too long"),
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
