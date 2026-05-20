import type { AuthUser } from "@/core/types/user.types";
import type { ApiAuthUserPayload } from "@/types/auth";

export function mapApiUserToAuthUser(apiUser: ApiAuthUserPayload): AuthUser {
  const nameParts = (apiUser.name || "").trim().split(/\s+/).filter(Boolean);

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
    avatarUrl: apiUser.profilePic ?? apiUser.avatarUrl ?? undefined,
    authProvider: apiUser.authProvider
  };
}
