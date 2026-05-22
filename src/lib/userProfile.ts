import type { AuthUser, User } from "@/core/types/user.types";
import { mapApiUserToAuthUser } from "@/lib/mapAuthUser";
import { resolveProfileTimezone } from "@/lib/profileTimezones";
import type { ProfileSettingsFormValues, UpdatePasswordFormValues } from "@/validators";
import type { ApiUserProfile, UpdateUserProfileRequest, UserGoogleLinkData } from "@/types/user";

// --- Display (UI labels, avatars, sidebar) ---

export function getUserDisplayName(user: User | null): string {
  if (!user) return "User";
  const fromFirstLast = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fromFirstLast || user.name || user.email || "User";
}

export function getInitialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "?";
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function getUserInitials(user: User | null): string {
  return getInitialsFromName(getUserDisplayName(user));
}

export function getUserDisplayEmail(user: User | null): string {
  return user?.email || "No email";
}

// --- Profile API (GET/PATCH /user, form state) ---

export type ProfileFormState = ProfileSettingsFormValues;

export type NotificationPreferencesFormState = {
  notificationsEnabled: boolean;
};

export function profileFormFromApiUser(user: ApiUserProfile): ProfileFormState {
  return profileFormFromAuthUser(mapApiUserToAuthUser(user));
}

export function profileFormFromAuthUser(user: AuthUser): ProfileFormState {
  return {
    name: user.name?.trim() || getUserDisplayName(user),
    email: user.email,
    contact: user.contact?.trim() ?? "",
    address: user.address?.trim() ?? "",
    timezone: resolveProfileTimezone(user.timezone)
  };
}

export function buildUpdateProfilePayload(form: ProfileFormState): UpdateUserProfileRequest {
  return {
    name: form.name.trim(),
    address: form.address.trim(),
    contact: form.contact.trim(),
    timezone: form.timezone
  };
}

export function notificationPreferencesFromAuthUser(
  user: AuthUser
): NotificationPreferencesFormState {
  return {
    notificationsEnabled: user.notificationsEnabled ?? true
  };
}

export function buildUpdateNotificationPreferencesPayload(
  form: NotificationPreferencesFormState
): UpdateUserProfileRequest {
  return { notificationsEnabled: form.notificationsEnabled };
}

export const emptyPasswordFormState: UpdatePasswordFormValues = {
  oldPassword: "",
  newPassword: "",
  confirmNewPassword: ""
};

export function buildUpdatePasswordPayload(
  form: UpdatePasswordFormValues
): UpdateUserProfileRequest {
  return {
    oldPassword: form.oldPassword,
    password: form.newPassword
  };
}

export function formatGoogleLinkFromUserApi(
  google: UserGoogleLinkData | undefined,
  fallbackMessage?: string
): string {
  if (!google?.linked) {
    return fallbackMessage?.trim() || "Google account is not linked.";
  }
  const email = google.email?.trim();
  const calendar = google.calendarLinked ? "Calendar linked" : "Calendar not linked";
  return email ? `${email} · ${calendar}` : calendar;
}
