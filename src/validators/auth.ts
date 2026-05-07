import { z } from "zod";

/** Email: valid format, 5–254 chars, trimmed and lowercased */
const emailSchema = z
  .string()
  .min(1, "Email is required")
  .min(5, "Email must be at least 5 characters long")
  .max(254, "Email must be less than 254 characters long")
  .email("Please provide a valid email address")
  .transform((v) => v.trim().toLowerCase());

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

// --- Sign up (role is passed from URL/state; API requires PATIENT | DOCTOR) ---
export const signupSchema = z
  .object({
    email: emailSchema,
    password: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

/** Validate signup payload when sending to API (email + role + provider). */
export const signupPayloadSchema = z.object({
  email: emailSchema,
  role: z.enum(["PATIENT", "DOCTOR"], {
    errorMap: () => ({ message: "Role must be PATIENT or DOCTOR" })
  }),
  provider: z.enum(["EMAIL", "GOOGLE"], {
    errorMap: () => ({ message: "Provider must be EMAIL or GOOGLE" })
  })
});

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

// --- Verify OTP ---
export const verifyOtpSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  otp: otpSchema
});

export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>;

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

// --- Reset password (set new password after OTP) ---
export const resetPasswordSchema = z
  .object({
    newPassword: strongPasswordSchema,
    confirmPassword: z.string().min(1, "Please confirm your password")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

// --- Update password (PATCH /user/me): old + new required together, old !== new ---
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
