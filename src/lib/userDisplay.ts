import type { User } from "@/core/types/user.types";

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
