import { Controller, type Control, type FieldErrors, type UseFormHandleSubmit } from "react-hook-form";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/settings/password-field";
import type { UpdatePasswordFormValues } from "@/validators";

type PasswordSectionProps = {
  profileLoading: boolean;
  passwordSaving: boolean;
  control: Control<UpdatePasswordFormValues>;
  errors: FieldErrors<UpdatePasswordFormValues>;
  onSubmit: ReturnType<UseFormHandleSubmit<UpdatePasswordFormValues>>;
  onNewPasswordChange: () => void;
};

export function PasswordSection({
  profileLoading,
  passwordSaving,
  control,
  errors,
  onSubmit,
  onNewPasswordChange
}: PasswordSectionProps) {
  const disabled = profileLoading || passwordSaving;

  return (
    <Card className="p-6 shadow-card">
      <h3 className="font-display text-lg font-bold">Password</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Update your password. You will need your current password to save changes.
      </p>
      <form noValidate onSubmit={onSubmit} className="mt-6 max-w-md space-y-4">
        <Controller
          name="oldPassword"
          control={control}
          render={({ field }) => (
            <PasswordField
              id="settings-old-password"
              label="Current password"
              value={field.value}
              disabled={disabled}
              error={errors.oldPassword?.message}
              onChange={field.onChange}
            />
          )}
        />
        <Controller
          name="newPassword"
          control={control}
          render={({ field }) => (
            <PasswordField
              id="settings-new-password"
              label="New password"
              value={field.value}
              disabled={disabled}
              error={errors.newPassword?.message}
              onChange={(value) => {
                field.onChange(value);
                onNewPasswordChange();
              }}
            />
          )}
        />
        <Controller
          name="confirmNewPassword"
          control={control}
          render={({ field }) => (
            <PasswordField
              id="settings-confirm-password"
              label="Confirm new password"
              value={field.value}
              disabled={disabled}
              error={errors.confirmNewPassword?.message}
              onChange={field.onChange}
            />
          )}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={disabled}>
            {passwordSaving ? "Updating..." : profileLoading ? "Loading..." : "Update password"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
