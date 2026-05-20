import type { AuthUser, User } from "@/core/types/user.types";
import { mapApiUserToAuthUser } from "@/lib/mapAuthUser";
import { resolveProfileTimezone } from "@/lib/profileTimezones";
import type { ApiUserProfile, UpdateUserProfileRequest, UserGoogleLinkData } from "@/types/user";

// --- Display (UI labels, avatars, sidebar) ---

export function getUserDisplayName(user: User | null): string {
  if (!user) return "User";
  const fromFirstLast = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return fromFirstLast || user.name || user.email || "User";
}

export function getUserInitials(user: User | null): string {
  const displayName = getUserDisplayName(user);
  const parts = displayName.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "U";
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || "U";
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

export function getUserDisplayEmail(user: User | null): string {
  return user?.email || "No email";
}

// --- Profile API (GET/PATCH /user, form state) ---

export type ProfileFormState = {
  name: string;
  email: string;
  contact: string;
  address: string;
  timezone: string;
  profilePic: string;
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
    timezone: resolveProfileTimezone(user.timezone),
    profilePic: user.avatarUrl?.trim() ?? ""
  };
}

export function buildUpdateProfilePayload(form: ProfileFormState): UpdateUserProfileRequest {
  return {
    name: form.name.trim(),
    address: form.address.trim(),
    contact: form.contact.trim(),
    timezone: form.timezone,
    ...(form.profilePic.trim() ? { profilePic: form.profilePic.trim() } : {})
  };
}

export function authUserFromApiProfile(user: ApiUserProfile): AuthUser {
  return mapApiUserToAuthUser(user);
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
