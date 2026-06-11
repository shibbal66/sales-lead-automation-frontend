import { z } from "zod";
import { datetimeLocalValueToIsoUtc } from "@/lib/dateFormatting";
import { emailSchema } from "@/validators/auth";
import {
  isAllowedMeetingStartLocal,
  MEETING_PAST_DATE_MESSAGE
} from "@/lib/meetings/meetingDates";

const letterNumberSpacePattern = /^[\p{L}\p{N}\s]+$/u;

function includesLetter(value: string): boolean {
  return /\p{L}/u.test(value);
}

export const MEETING_TITLE_MAX_LENGTH = 200;

export const meetingTitleSchema = z
  .string()
  .trim()
  .min(1, "Title is required")
  .max(MEETING_TITLE_MAX_LENGTH, `Title must be ${MEETING_TITLE_MAX_LENGTH} characters or less`)
  .regex(letterNumberSpacePattern, "Title must contain only letters, numbers, and spaces")
  .refine(includesLetter, {
    message: "Title must include at least one letter"
  });

/** Strips invalid characters and enforces max length while typing. */
export function sanitizeMeetingTitleInput(value: string): string {
  return value.replace(/[^\p{L}\p{N}\s]/gu, "").slice(0, MEETING_TITLE_MAX_LENGTH);
}

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
    title: meetingTitleSchema,
    description: z.string().trim().max(2000, "Description is too long").optional(),
    startLocal: datetimeLocalField,
    endLocal: datetimeLocalField,
    attendee_email: emailSchema,
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
    if (!isAllowedMeetingStartLocal(data.startLocal)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: MEETING_PAST_DATE_MESSAGE,
        path: ["startLocal"]
      });
    }
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
    title: meetingTitleSchema,
    description: z.string().trim().max(2000, "Description is too long").optional(),
    startLocal: datetimeLocalField,
    endLocal: datetimeLocalField,
    attendee_email: emailSchema,
    status: z.enum(["scheduled", "completed"])
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
