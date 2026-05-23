import type { AuthUser } from "@/core/types/user.types";
import type { ApiAuthUserPayload } from "@/types/auth";

/** Strip cache-bust query params so avatar URLs can be compared across API refreshes. */
export function normalizeAvatarSource(url?: string | null): string | undefined {
  const trimmed = typeof url === "string" ? url.trim() : "";
  if (!trimmed) return undefined;

  try {
    const parsed = new URL(trimmed);
    parsed.searchParams.delete("v");
    const normalized = parsed.toString();
    return normalized.endsWith("?") ? normalized.slice(0, -1) : normalized;
  } catch {
    return trimmed
      .replace(/([?&])v=\d+(&|$)/, (_, sep, tail) => (tail === "&" ? sep : ""))
      .replace(/\?$/, "");
  }
}

export function avatarSourcesMatch(
  next?: string | null,
  current?: string | null,
): boolean {
  const normalizedNext = normalizeAvatarSource(next);
  const normalizedCurrent = normalizeAvatarSource(current);
  if (!normalizedNext && !normalizedCurrent) return true;
  return normalizedNext === normalizedCurrent;
}

function toAvatarUrl(url?: string | null, bust = false): string | undefined {
  const trimmed = typeof url === "string" ? url.trim() : "";
  if (!trimmed) return undefined;
  if (!bust) return trimmed;
  const base = normalizeAvatarSource(trimmed) ?? trimmed;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}v=${Date.now()}`;
}

/** Maps API user (GET/PATCH/avatar upload) to client `AuthUser`. */
export function mapApiUserToAuthUser(
  apiUser: ApiAuthUserPayload,
  bustAvatar = false
): AuthUser {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name ?? undefined,
    isVerified: apiUser.isVerified ?? true,
    createdAt: apiUser.createdAt,
    role: apiUser.role,
    address: apiUser.address ?? undefined,
    contact: apiUser.contact ?? undefined,
    timezone: apiUser.timezone ?? undefined,
    notificationsEnabled: apiUser.notificationsEnabled ?? true,
    avatarUrl: toAvatarUrl(apiUser.profilePic ?? apiUser.avatarUrl, bustAvatar),
    authProvider: apiUser.authProvider
  };
}
