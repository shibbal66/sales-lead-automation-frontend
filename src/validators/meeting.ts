import { z } from "zod";
import { datetimeLocalValueToIsoUtc } from "@/lib/dateFormatting";

const optionalUuidSchema = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || z.string().uuid().safeParse(v).success, "Invalid selection");

const datetimeLocalField = z
  .string()
  .min(1, "Date and time is required")
  .refine((v) => datetimeLocalValueToIsoUtc(v) !== null, "Invalid date and time");

export const createMeetingSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
    description: z.string().trim().max(2000, "Description is too long").optional(),
    startLocal: datetimeLocalField,
    endLocal: datetimeLocalField,
    attendee_email: z
      .string()
      .trim()
      .min(1, "Attendee email is required")
      .email("Please provide a valid email address"),
    campaign_id: optionalUuidSchema,
    campaign_lead_id: optionalUuidSchema,
    sync_google: z.boolean().default(true),
    add_google_meet: z.boolean().default(true)
  })
  .superRefine((data, ctx) => {
    meetingDatetimeRefine(
      { startLocal: data.startLocal, endLocal: data.endLocal },
      ctx
    );
    if (data.campaign_lead_id && !data.campaign_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Select a campaign when linking a campaign lead",
        path: ["campaign_id"]
      });
    }
  });

export type CreateMeetingFormValues = z.infer<typeof createMeetingSchema>;

const meetingDatetimeRefine = (
  data: { startLocal: string; endLocal: string },
  ctx: z.RefinementCtx
) => {
  const startIso = datetimeLocalValueToIsoUtc(data.startLocal);
  const endIso = datetimeLocalValueToIsoUtc(data.endLocal);
  if (!startIso || !endIso) return;
  if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "End must be after start",
      path: ["endLocal"]
    });
  }
};

export const updateMeetingSchema = z
  .object({
    title: z.string().trim().min(1, "Title is required").max(200, "Title is too long"),
    description: z.string().trim().max(2000, "Description is too long").optional(),
    startLocal: datetimeLocalField,
    endLocal: datetimeLocalField,
    attendee_email: z
      .string()
      .trim()
      .min(1, "Attendee email is required")
      .email("Please provide a valid email address"),
    status: z.enum(["scheduled", "completed", "cancelled"])
  })
  .superRefine(meetingDatetimeRefine);

export type UpdateMeetingFormValues = z.infer<typeof updateMeetingSchema>;

export function buildUpdateMeetingPayload(values: UpdateMeetingFormValues) {
  const start_at = datetimeLocalValueToIsoUtc(values.startLocal)!;
  const end_at = datetimeLocalValueToIsoUtc(values.endLocal)!;
  return {
    title: values.title,
    description: values.description?.trim() || undefined,
    start_at,
    end_at,
    attendee_email: values.attendee_email.trim().toLowerCase(),
    status: values.status
  };
}

export function buildCreateMeetingPayload(values: CreateMeetingFormValues) {
  const start_at = datetimeLocalValueToIsoUtc(values.startLocal)!;
  const end_at = datetimeLocalValueToIsoUtc(values.endLocal)!;
  return {
    title: values.title,
    description: values.description?.trim() || undefined,
    start_at,
    end_at,
    attendee_email: values.attendee_email.trim().toLowerCase(),
    campaign_id: values.campaign_id,
    campaign_lead_id: values.campaign_lead_id,
    sync_google: values.sync_google,
    add_google_meet: values.add_google_meet
  };
}
