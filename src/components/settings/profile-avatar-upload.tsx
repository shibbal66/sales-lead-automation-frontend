import { useRef } from "react";
import type { AuthUser } from "@/core/types/user.types";
import { cn } from "@/lib/utils";
import { UserProfileAvatar } from "@/components/user-profile-avatar";
import { Camera, Loader2, Trash2 } from "lucide-react";

const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;

type ProfileAvatarUploadProps = {
  user: AuthUser | null;
  disabled?: boolean;
  uploading?: boolean;
  onUpload: (file: File) => void;
  onDelete?: () => void;
  onInvalidFile?: (message: string) => void;
};

export function ProfileAvatarUpload({
  user,
  disabled,
  uploading,
  onUpload,
  onDelete,
  onInvalidFile,
}: ProfileAvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const hasAvatar = Boolean(user?.avatarUrl?.trim());

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      onInvalidFile?.("Please choose a JPG, PNG, WEBP, or GIF image.");
      return;
    }
    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      onInvalidFile?.("Image must be 5 MB or smaller.");
      return;
    }

    onUpload(file);
  };

  return (
    <div className="flex flex-col items-center gap-3 pb-6">
      <div className="group relative h-28 w-28">
        <div
          className={cn(
            "h-28 w-28 overflow-hidden rounded-full ring-2 ring-border",
            uploading && "opacity-60",
          )}
        >
          <UserProfileAvatar user={user} className="h-full w-full" initialsClassName="text-2xl font-bold" />
        </div>

        {!uploading ? (
          <button
            type="button"
            disabled={disabled}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "absolute inset-0 grid place-items-center rounded-full bg-background/55 text-foreground",
              "opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
              "disabled:pointer-events-none disabled:opacity-0",
            )}
            aria-label="Upload profile photo"
          >
            <Camera className="h-7 w-7" />
          </button>
        ) : (
          <div
            className="absolute inset-0 grid place-items-center rounded-full bg-background/50"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden />
            <span className="sr-only">Updating profile photo</span>
          </div>
        )}

        {!uploading && hasAvatar && onDelete ? (
          <button
            type="button"
            disabled={disabled}
            onClick={onDelete}
            className={cn(
              "absolute bottom-0 -right-2 z-10 grid h-7 w-7 place-items-center rounded-full border border-border bg-card text-destructive shadow-sm transition-colors",
              "hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50",
            )}
            aria-label="Remove profile photo"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={handleFileChange}
      />
      <p className="text-center text-xs text-muted-foreground">JPG, PNG, WEBP or GIF · max 5 MB</p>
    </div>
  );
}
