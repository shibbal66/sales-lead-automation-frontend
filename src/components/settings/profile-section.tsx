import { useMemo } from "react";
import { Controller, type Control, type FieldErrors, type UseFormHandleSubmit, type UseFormWatch } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProfileAvatarUpload } from "@/components/settings/profile-avatar-upload";
import { PhoneNumberField } from "@/components/shared/phone-number-field";
import { profileTimezoneSelectOptions } from "@/lib/profileTimezones";
import { showApiErrorToast } from "@/lib/apiToast";
import type { AuthUser } from "@/core/types/user.types";
import type { ProfileSettingsFormValues } from "@/validators";

type ProfileSectionProps = {
  user: AuthUser | null;
  profileLoading: boolean;
  profileSaving: boolean;
  avatarUploading: boolean;
  control: Control<ProfileSettingsFormValues>;
  errors: FieldErrors<ProfileSettingsFormValues>;
  watch: UseFormWatch<ProfileSettingsFormValues>;
  onSubmit: ReturnType<UseFormHandleSubmit<ProfileSettingsFormValues>>;
  onUploadAvatar: (file: File) => void;
  onDeleteAvatar: () => void;
};

export function ProfileSection({
  user,
  profileLoading,
  profileSaving,
  avatarUploading,
  control,
  errors,
  watch,
  onSubmit,
  onUploadAvatar,
  onDeleteAvatar
}: ProfileSectionProps) {
  const profileTimezone = watch("timezone");
  const timezoneOptions = useMemo(
    () => profileTimezoneSelectOptions(profileTimezone),
    [profileTimezone]
  );
  const disabled = profileLoading || profileSaving || avatarUploading;

  return (
    <Card className="p-6 shadow-card">
      <h3 className="font-display text-lg font-bold">Profile</h3>
      <div className="mt-6">
        <ProfileAvatarUpload
          user={user}
          disabled={disabled}
          uploading={avatarUploading}
          onUpload={onUploadAvatar}
          onDelete={onDeleteAvatar}
          onInvalidFile={(message) => showApiErrorToast(message)}
        />
      </div>
      <form noValidate onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label htmlFor="profile-name">Full name</Label>
                <Input id="profile-name" disabled={disabled} aria-invalid={!!errors.name} {...field} />
                {errors.name?.message ? (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                ) : null}
              </div>
            )}
          />
          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label htmlFor="profile-email">Email</Label>
                <Input
                  id="profile-email"
                  disabled
                  readOnly
                  aria-invalid={!!errors.email}
                  {...field}
                />
                {errors.email?.message ? (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                ) : null}
              </div>
            )}
          />
          <Controller
            name="contact"
            control={control}
            render={({ field }) => (
              <PhoneNumberField
                id="profile-contact"
                label="Phone"
                value={field.value}
                disabled={disabled}
                onChange={field.onChange}
                error={errors.contact?.message}
              />
            )}
          />
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="profile-address">Address</Label>
                <Input
                  id="profile-address"
                  placeholder="City, country"
                  disabled={disabled}
                  aria-invalid={!!errors.address}
                  {...field}
                />
                {errors.address?.message ? (
                  <p className="text-xs text-destructive">{errors.address.message}</p>
                ) : null}
              </div>
            )}
          />
          <Controller
            name="timezone"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label>Timezone</Label>
                <Select value={field.value} disabled={disabled} onValueChange={field.onChange}>
                  <SelectTrigger aria-invalid={!!errors.timezone}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timezoneOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.timezone?.message ? (
                  <p className="text-xs text-destructive">{errors.timezone.message}</p>
                ) : null}
              </div>
            )}
          />
        </div>
        <div className="flex justify-end">
          <Button type="submit" disabled={disabled}>
            {profileSaving
              ? "Saving..."
              : avatarUploading
                ? "Uploading photo..."
                : profileLoading
                  ? "Loading..."
                  : "Save Changes"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
