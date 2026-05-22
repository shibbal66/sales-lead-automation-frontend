import type { AuthUser } from "@/core/types/user.types";
import type { ApiAuthUserPayload } from "@/types/auth";

function toAvatarUrl(url?: string | null, bust = false): string | undefined {
  const trimmed = typeof url === "string" ? url.trim() : "";
  if (!trimmed) return undefined;
  if (!bust) return trimmed;
  const separator = trimmed.includes("?") ? "&" : "?";
  return `${trimmed}${separator}v=${Date.now()}`;
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
