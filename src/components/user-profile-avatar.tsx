import type { User } from "@/core/types/user.types";
import { cn } from "@/lib/utils";
import { getInitialsFromName, getUserDisplayName, getUserInitials } from "@/lib/userProfile";

type UserProfileAvatarBaseProps = {
  className?: string;
  initialsClassName?: string;
  /** Fixed width/height in px (e.g. lead rows). Omit to size via `className`. */
  size?: number;
};

type UserProfileAvatarProps = UserProfileAvatarBaseProps &
  (
    | { user: User | null; name?: never }
    | { name: string; user?: never }
  );

export function UserProfileAvatar({
  user,
  name,
  size,
  className,
  initialsClassName
}: UserProfileAvatarProps) {
  const isNameMode = name !== undefined;
  const displayName = isNameMode ? name : getUserDisplayName(user);
  const initials = isNameMode ? getInitialsFromName(name) : getUserInitials(user);
  const avatarUrl = !isNameMode ? user?.avatarUrl?.trim() : undefined;
  const sizeStyle = size ? { width: size, height: size } : undefined;

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName}
        style={sizeStyle}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      style={sizeStyle}
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-gradient-brand font-semibold text-primary-foreground",
        !size && className,
        initialsClassName ?? (size ? "text-xs" : undefined)
      )}
    >
      {initials}
    </div>
  );
}
