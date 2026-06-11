import { z } from "zod";
import {
  isValidOptionalPhoneNumber,
  isValidPhoneNumber,
  parsePhoneNumber,
  phoneLocalNumberSchemaForIso
} from "@/lib/phoneNumber";

const HOSTNAME_LABEL_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
const MAX_TLD_LENGTH = 6;

const hasValidEmailDomain = (email: string): boolean => {
  const atIndex = email.lastIndexOf("@");
  if (atIndex <= 0 || atIndex >= email.length - 1) {
    return false;
  }

  const labels = email.slice(atIndex + 1).split(".");
  if (labels.length < 2 || labels.some((label) => label.length === 0)) {
    return false;
  }

  const tld = labels[labels.length - 1];
  if (tld.length < 2 || tld.length > MAX_TLD_LENGTH || !/^[a-z]+$/i.test(tld)) {
    return false;
  }

  return labels.every(
    (label) => label.length <= 63 && HOSTNAME_LABEL_RE.test(label),
  );
};

/** Email: valid format, 5–254 chars, trimmed and lowercased on parse. */
export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email is required")
  .max(254, "Email must be less than 254 characters long")
  .email({ message: "Please provide a valid email address" })
  .refine(hasValidEmailDomain, {
    message: "Please provide a valid email address",
  });


/** Password: for login, only required (no complexity enforced). */
const passwordRequiredSchema = z.string().min(1, "Password is required");

/** Shared strong password rule for set/reset/update-password flows. */
export const strongPasswordSchema = z
  .string()
  .trim()
  .min(1, "Password is required")
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain uppercase, lowercase, number and special character")
  .regex(/[a-z]/, "Password must contain uppercase, lowercase, number and special character")
  .regex(/\d/, "Password must contain uppercase, lowercase, number and special character")
  .regex(/[^A-Za-z0-9]/, "Password must contain uppercase, lowercase, number and special character");

/** OTP: exactly 6 digits */
const otpSchema = z
  .string()
  .min(1, "Token is required")
  .length(6, "Token must be exactly 6 digits")
  .regex(/^\d{6}$/, "Token must be 6 digits");

/** Reason for OTP */
const otpReasonSchema = z.enum(["EMAIL_VERIFICATION", "PASSWORD_RESET"], {
  errorMap: () => ({ message: "Reason must be a valid reason" })
});

// --- Login ---
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordRequiredSchema
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// --- Shared profile fields ---
export const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(30, "Name must be less than 30 characters")
  .regex(/^[\p{L}\s]+$/u, "Name must contain only letters and spaces");

/** Full phone stored as E.164 (+countryCode + national digits). */
export const phoneSchema = z
  .string()
  .trim()
  .min(1, "Phone is required")
  .superRefine((value, ctx) => {
    if (isValidPhoneNumber(value)) return;
    const parsed = parsePhoneNumber(value);
    const localResult = phoneLocalNumberSchemaForIso(parsed.iso).safeParse(parsed.local);
    if (!localResult.success) {
      for (const issue of localResult.error.issues) {
        ctx.addIssue(issue);
      }
      return;
    }
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please enter a valid phone number"
    });
  });

export const addressSchema = z
  .string()
  .trim()
  .min(5, "Address is too short")
  .max(500, "Address is too long")
  .refine(
    (v) => (v.match(/[a-zA-Z]/g)?.length ?? 0) >= 3 && !/^\d+$/.test(v.replace(/\s/g, "")),
    "Address must include letters and not be only numbers"
  );

/** Optional phone: empty allowed; if provided, uses phoneSchema rules. */
export const optionalPhoneSchema = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    if (!value) return;
    if (isValidOptionalPhoneNumber(value)) return;
    const parsed = parsePhoneNumber(value);
    const localResult = phoneLocalNumberSchemaForIso(parsed.iso).safeParse(parsed.local);
    if (!localResult.success) {
      for (const issue of localResult.error.issues) {
        ctx.addIssue(issue);
      }
      return;
    }
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Please enter a valid phone number"
    });
  });

/** Optional address: empty allowed; if provided, uses addressSchema rules. */
export const optionalAddressSchema = z
  .string()
  .trim()
  .superRefine((value, ctx) => {
    if (!value) return;
    const result = addressSchema.safeParse(value);
    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue(issue);
      }
    }
  });

// --- Sign up ---
export const signupSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password"),
    address: addressSchema,
    contact: phoneSchema
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

/** POST /auth/signup body (no confirmPassword). */
export const signupPayloadSchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
  name: nameSchema,
  address: addressSchema,
  contact: phoneSchema
});

export type SignupPayload = z.infer<typeof signupPayloadSchema>;

// --- Settings profile (PATCH /user) ---
export const updateProfileSchema = z.object({
  name: nameSchema,
  contact: optionalPhoneSchema,
  address: optionalAddressSchema,
  timezone: z.string().trim().min(1, "Please select a timezone")
});

export type UpdateProfileFormValues = z.infer<typeof updateProfileSchema>;

/** Settings profile form (includes read-only email). */
export const profileSettingsSchema = updateProfileSchema.extend({
  email: emailSchema
});

export type ProfileSettingsFormValues = z.infer<typeof profileSettingsSchema>;

// --- Forgot password / Request OTP ---
export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// --- Request OTP (email + reason) ---
export const requestOtpSchema = z.object({
  email: emailSchema,
  reason: otpReasonSchema
});

export type RequestOtpFormValues = z.infer<typeof requestOtpSchema>;

// --- Validate OTP (check code without consuming it) ---
export const validateOtpSchema = z.object({
  email: emailSchema,
  otp: otpSchema
});

export type ValidateOtpFormValues = z.infer<typeof validateOtpSchema>;

// --- Verify OTP ---
export const verifyOtpSchema = z.object({
  email: emailSchema,
  otp: otpSchema
});

export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;

// --- Resend OTP (email verification) ---
export const resendOtpSchema = z.object({
  email: emailSchema
});

export type ResendOtpFormValues = z.infer<typeof resendOtpSchema>;

/** Add-password flow schema (token-based create password page). */
export const addPasswordSchema = z
  .object({
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export type AddPasswordFormValues = z.infer<typeof addPasswordSchema>;

// --- Reset password OTP step (email + OTP only) ---
export const resetPasswordOtpSchema = z.object({
  email: emailSchema,
  otp: otpSchema
});

export type ResetPasswordOtpFormValues = z.infer<typeof resetPasswordOtpSchema>;

// --- Reset password (new password only; OTP passed from prior step) ---
export const resetPasswordSchema = z
  .object({
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// --- Update password (PATCH /user): old + new required together, old !== new ---
export const updatePasswordSchema = z
  .object({
    oldPassword: passwordRequiredSchema,
    newPassword: strongPasswordSchema,
    confirmNewPassword: z.string().min(1, "Please confirm your new password")
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "New passwords do not match",
    path: ["confirmNewPassword"]
  })
  .refine((data) => data.oldPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"]
  });

export type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;
