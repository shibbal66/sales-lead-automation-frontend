import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "react-router-dom";
import { GoogleLinkCard } from "@/components/auth/google-link-card";
import { BillingSection } from "@/components/settings/billing-section";
import { DangerZoneSection } from "@/components/settings/danger-zone-section";
import { NotificationsSection } from "@/components/settings/notifications-section";
import { PasswordSection } from "@/components/settings/password-section";
import { ProfileSection } from "@/components/settings/profile-section";
import {
  settingsSectionFromTab,
  type SettingsSectionId
} from "@/components/settings/settings-config";
import { SettingsNav } from "@/components/settings/settings-nav";
import { resolveProfileTimezone } from "@/lib/profileTimezones";
import {
  emptyPasswordFormState,
  notificationPreferencesFromAuthUser,
  profileFormFromAuthUser,
  type NotificationPreferencesFormState
} from "@/lib/userProfile";
import { useAuthStore } from "@/store/auth/authStore";
import {
  profileSettingsSchema,
  updatePasswordSchema,
  type ProfileSettingsFormValues,
  type UpdatePasswordFormValues
} from "@/validators";

function emptyProfileFormDefaults(): ProfileSettingsFormValues {
  return {
    name: "",
    email: "",
    contact: "",
    address: "",
    timezone: resolveProfileTimezone()
  };
}

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const googleLink = useAuthStore((state) => state.googleLink);
  const profileLoading = useAuthStore((state) => state.profileLoading);
  const profileSaving = useAuthStore((state) => state.profileSaving);
  const avatarUploading = useAuthStore((state) => state.avatarUploading);
  const uploadAvatar = useAuthStore((state) => state.uploadAvatar);
  const deleteAvatar = useAuthStore((state) => state.deleteAvatar);
  const notificationPreferencesSaving = useAuthStore((state) => state.notificationPreferencesSaving);
  const passwordSaving = useAuthStore((state) => state.passwordSaving);
  const fetchCurrentUser = useAuthStore((state) => state.fetchCurrentUser);
  const saveProfile = useAuthStore((state) => state.saveProfile);
  const saveNotificationPreferences = useAuthStore((state) => state.saveNotificationPreferences);
  const savePassword = useAuthStore((state) => state.savePassword);
  const logoutAllDevices = useAuthStore((state) => state.logoutAllDevices);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const accountDeleting = useAuthStore((state) => state.accountDeleting);

  const section = settingsSectionFromTab(searchParams.get("tab"));
  const [mobileOpenSection, setMobileOpenSection] = useState<SettingsSectionId | null>(section);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferencesFormState>(() =>
    user ? notificationPreferencesFromAuthUser(user) : { notificationsEnabled: true }
  );

  const profileForm = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(profileSettingsSchema),
    mode: "onChange",
    defaultValues: user ? profileFormFromAuthUser(user) : emptyProfileFormDefaults()
  });

  const passwordForm = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    mode: "onChange",
    defaultValues: emptyPasswordFormState
  });

  useEffect(() => {
    void fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (!user || profileLoading || profileSaving) return;
    profileForm.reset(profileFormFromAuthUser(user));
  }, [user, profileLoading, profileSaving, profileForm]);

  useEffect(() => {
    if (!user || profileLoading || notificationPreferencesSaving) return;
    setNotificationPrefs(notificationPreferencesFromAuthUser(user));
  }, [user, profileLoading, notificationPreferencesSaving]);

  useEffect(() => {
    setMobileOpenSection(section);
  }, [section]);

  const selectSection = (id: SettingsSectionId) => {
    setSearchParams({ tab: id }, { replace: true });
  };

  const handleMobileToggle = (id: SettingsSectionId) => {
    if (mobileOpenSection === id) {
      setMobileOpenSection(null);
      return;
    }
    setMobileOpenSection(id);
    selectSection(id);
  };

  const onNotificationToggle = async (checked: boolean) => {
    const previous = notificationPrefs.notificationsEnabled;
    setNotificationPrefs({ notificationsEnabled: checked });
    const ok = await saveNotificationPreferences({ notificationsEnabled: checked });
    if (!ok) {
      setNotificationPrefs({ notificationsEnabled: previous });
    }
  };

  const renderSectionContent = (sectionId: SettingsSectionId) => {
    if (sectionId === "profile") {
      return (
        <ProfileSection
              user={user}
          profileLoading={profileLoading}
          profileSaving={profileSaving}
          avatarUploading={avatarUploading}
          control={profileForm.control}
          errors={profileForm.formState.errors}
          watch={profileForm.watch}
          onSubmit={profileForm.handleSubmit(async (data) => {
            await saveProfile(data);
          })}
          onUploadAvatar={(file) => void uploadAvatar(file)}
          onDeleteAvatar={() => void deleteAvatar()}
        />
      );
    }

    if (sectionId === "password") {
      return (
        <PasswordSection
          profileLoading={profileLoading}
          passwordSaving={passwordSaving}
          control={passwordForm.control}
          errors={passwordForm.formState.errors}
          onSubmit={passwordForm.handleSubmit(async (data) => {
            const ok = await savePassword(data);
            if (ok) {
              passwordForm.reset(emptyPasswordFormState);
            }
          })}
          onNewPasswordChange={() => void passwordForm.trigger("confirmNewPassword")}
        />
      );
    }

    if (sectionId === "notifications") {
      return (
        <NotificationsSection
          enabled={notificationPrefs.notificationsEnabled}
              disabled={profileLoading || notificationPreferencesSaving}
          onToggle={(checked) => void onNotificationToggle(checked)}
            />
      );
    }

    if (sectionId === "email") {
      return <GoogleLinkCard linkStatus={googleLink} statusLoading={profileLoading} />;
    }

    if (sectionId === "billing") {
      return <BillingSection />;
    }

    if (sectionId === "danger") {
      return (
        <DangerZoneSection
          accountDeleting={accountDeleting}
          onLogoutAllDevices={logoutAllDevices}
          onDeleteAccount={deleteAccount}
        />
      );
    }

    return null;
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px,1fr]">
      <SettingsNav
        activeSection={section}
        mobileOpenSection={mobileOpenSection}
        onSelectSection={selectSection}
        onMobileToggle={handleMobileToggle}
        renderSection={renderSectionContent}
      />
      <div className="hidden space-y-4 lg:block">{renderSectionContent(section)}</div>
    </div>
  );
}
