import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { billingHistory } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  User, Mail, CreditCard, Bell, AlertTriangle, Check, KeyRound, ChevronDown,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { showApiErrorToast } from "@/lib/apiToast";
import { useAuthStore } from "@/store/auth/authStore";
import { GoogleLinkCard } from "@/components/auth/google-link-card";
import { PhoneNumberField } from "@/components/shared/phone-number-field";
import { PasswordField } from "@/components/settings/password-field";
import { ProfileAvatarUpload } from "@/components/settings/profile-avatar-upload";
import { UserProfileAvatar } from "@/components/user-profile-avatar";
import { profileTimezoneSelectOptions, resolveProfileTimezone } from "@/lib/profileTimezones";
import {
  getUserDisplayEmail,
  getUserDisplayName,
  emptyPasswordFormState,
  notificationPreferencesFromAuthUser,
  profileFormFromAuthUser,
  type NotificationPreferencesFormState
} from "@/lib/userProfile";
import {
  profileSettingsSchema,
  updatePasswordSchema,
  type ProfileSettingsFormValues,
  type UpdatePasswordFormValues
} from "@/validators";

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "password", label: "Password", icon: KeyRound },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "email", label: "Email Accounts", icon: Mail },
  { id: "billing", label: "Subscription & Billing", icon: CreditCard },
  // { id: "team", label: "Team & Roles", icon: Users },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
] as const;

type SettingsSectionId = (typeof sections)[number]["id"];

const SETTINGS_SECTION_IDS = new Set<SettingsSectionId>(sections.map((s) => s.id));

function settingsSectionFromTab(tab: string | null): SettingsSectionId {
  if (tab && SETTINGS_SECTION_IDS.has(tab as SettingsSectionId)) {
    return tab as SettingsSectionId;
  }
  return "profile";
}

function emptyProfileFormDefaults(): ProfileSettingsFormValues {
  return {
    name: "",
    email: "",
    contact: "",
    address: "",
    timezone: resolveProfileTimezone()
  };
}

function formatUserRole(role?: string) {
  if (!role) return "User";
  const normalized = role.trim().toLowerCase();
  if (normalized === "admin") return "Admin";
  if (normalized === "manager") return "Manager";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export default function Settings() {
  const navigate = useNavigate();
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

  const selectSection = (id: SettingsSectionId) => {
    setSearchParams({ tab: id }, { replace: true });
  };
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [mobileOpenSection, setMobileOpenSection] = useState<SettingsSectionId | null>(section);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferencesFormState>(() =>
    user ? notificationPreferencesFromAuthUser(user) : { notificationsEnabled: true }
  );

  const {
    control: profileControl,
    handleSubmit: handleProfileSubmit,
    reset: resetProfileForm,
    watch: watchProfile,
    formState: { errors: profileErrors }
  } = useForm<ProfileSettingsFormValues>({
    resolver: zodResolver(profileSettingsSchema),
    mode: "onChange",
    defaultValues: user ? profileFormFromAuthUser(user) : emptyProfileFormDefaults()
  });

  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    trigger: triggerPasswordField,
    formState: { errors: passwordErrors }
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    mode: "onChange",
    defaultValues: emptyPasswordFormState
  });

  useEffect(() => {
    void fetchCurrentUser();
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (!user || profileLoading || profileSaving) return;
    resetProfileForm(profileFormFromAuthUser(user));
  }, [user, profileLoading, profileSaving, resetProfileForm]);

  useEffect(() => {
    if (!user || profileLoading || notificationPreferencesSaving) return;
    setNotificationPrefs(notificationPreferencesFromAuthUser(user));
  }, [user, profileLoading, notificationPreferencesSaving]);

  useEffect(() => {
    setMobileOpenSection(section);
  }, [section]);

  const onSaveProfile = handleProfileSubmit(async (data: ProfileSettingsFormValues) => {
    await saveProfile(data);
  });

  const onNotificationToggle = async (checked: boolean) => {
    const previous = notificationPrefs.notificationsEnabled;
    setNotificationPrefs({ notificationsEnabled: checked });
    const ok = await saveNotificationPreferences({ notificationsEnabled: checked });
    if (!ok) {
      setNotificationPrefs({ notificationsEnabled: previous });
    }
  };

  const onSavePassword = handlePasswordSubmit(async (data) => {
    const ok = await savePassword(data);
    if (ok) {
      resetPasswordForm(emptyPasswordFormState);
    }
  });

  const onDeleteAccount = async () => {
    const ok = await deleteAccount();
    if (!ok) return;
    setDeleteOpen(false);
    setConfirmText("");
    navigate("/login", { replace: true });
  };

  const profileTimezone = watchProfile("timezone");

  const timezoneOptions = useMemo(
    () => profileTimezoneSelectOptions(profileTimezone),
    [profileTimezone]
  );

  const currentTeamMember = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      name: getUserDisplayName(user),
      email: getUserDisplayEmail(user),
      role: formatUserRole(user.role)
    };
  }, [user]);

  const renderSectionContent = (sectionId: SettingsSectionId) => {
    if (sectionId === "profile") {
      return (
        <Card className="p-6 shadow-card">
          <h3 className="font-display text-lg font-bold">Profile</h3>
          <div className="mt-6">
            <ProfileAvatarUpload
              user={user}
              disabled={profileLoading || profileSaving || avatarUploading}
              uploading={avatarUploading}
              onUpload={(file) => void uploadAvatar(file)}
              onDelete={() => void deleteAvatar()}
              onInvalidFile={(message) => showApiErrorToast(message)}
            />
          </div>
          <form noValidate onSubmit={onSaveProfile} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Controller
                name="name"
                control={profileControl}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-name">Full name</Label>
                    <Input
                      id="profile-name"
                      disabled={profileLoading || profileSaving || avatarUploading}
                      aria-invalid={!!profileErrors.name}
                      {...field}
                    />
                    {profileErrors.name?.message ? (
                      <p className="text-xs text-destructive">{profileErrors.name.message}</p>
                    ) : null}
                  </div>
                )}
              />
              <Controller
                name="email"
                control={profileControl}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-email">Email</Label>
                    <Input id="profile-email" disabled readOnly {...field} />
                  </div>
                )}
              />
              <Controller
                name="contact"
                control={profileControl}
                render={({ field }) => (
                  <PhoneNumberField
                    id="profile-contact"
                    label="Phone"
                    value={field.value}
                    disabled={profileLoading || profileSaving || avatarUploading}
                    onChange={field.onChange}
                    error={profileErrors.contact?.message}
                  />
                )}
              />
              <Controller
                name="address"
                control={profileControl}
                render={({ field }) => (
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="profile-address">Address</Label>
                    <Input
                      id="profile-address"
                      placeholder="City, country"
                      disabled={profileLoading || profileSaving || avatarUploading}
                      aria-invalid={!!profileErrors.address}
                      {...field}
                    />
                    {profileErrors.address?.message ? (
                      <p className="text-xs text-destructive">{profileErrors.address.message}</p>
                    ) : null}
                  </div>
                )}
              />
              <Controller
                name="timezone"
                control={profileControl}
                render={({ field }) => (
                  <div className="space-y-1.5">
                    <Label>Timezone</Label>
                    <Select
                      value={field.value}
                      disabled={profileLoading || profileSaving || avatarUploading}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger aria-invalid={!!profileErrors.timezone}>
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
                    {profileErrors.timezone?.message ? (
                      <p className="text-xs text-destructive">{profileErrors.timezone.message}</p>
                    ) : null}
                  </div>
                )}
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={profileLoading || profileSaving || avatarUploading}>
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

    if (sectionId === "password") {
      return (
        <Card className="p-6 shadow-card">
          <h3 className="font-display text-lg font-bold">Password</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your password. You will need your current password to save changes.
          </p>
          <form noValidate onSubmit={onSavePassword} className="mt-6 max-w-md space-y-4">
            <Controller
              name="oldPassword"
              control={passwordControl}
              render={({ field }) => (
                <PasswordField
                  id="settings-old-password"
                  label="Current password"
                  value={field.value}
                  disabled={profileLoading || passwordSaving}
                  error={passwordErrors.oldPassword?.message}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="newPassword"
              control={passwordControl}
              render={({ field }) => (
                <PasswordField
                  id="settings-new-password"
                  label="New password"
                  value={field.value}
                  disabled={profileLoading || passwordSaving}
                  error={passwordErrors.newPassword?.message}
                  onChange={(value) => {
                    field.onChange(value);
                    void triggerPasswordField("confirmNewPassword");
                  }}
                />
              )}
            />
            <Controller
              name="confirmNewPassword"
              control={passwordControl}
              render={({ field }) => (
                <PasswordField
                  id="settings-confirm-password"
                  label="Confirm new password"
                  value={field.value}
                  disabled={profileLoading || passwordSaving}
                  error={passwordErrors.confirmNewPassword?.message}
                  onChange={field.onChange}
                />
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={profileLoading || passwordSaving}>
                {passwordSaving ? "Updating..." : profileLoading ? "Loading..." : "Update password"}
              </Button>
            </div>
          </form>
        </Card>
      );
    }

    if (sectionId === "notifications") {
      return (
        <Card className="p-6 shadow-card">
          <h3 className="font-display text-lg font-bold">Notification preferences</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Control whether you receive in-app and email notifications for replies, meetings, campaigns, and system
            updates.
          </p>
          <div className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="notifications-enabled" className="text-base font-semibold">
                Enable notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                When off, you will not receive new notification alerts until you turn this back on.
              </p>
            </div>
            <Switch
              id="notifications-enabled"
              checked={notificationPrefs.notificationsEnabled}
              disabled={profileLoading || notificationPreferencesSaving}
              onCheckedChange={(checked) => void onNotificationToggle(checked)}
            />
          </div>
        </Card>
      );
    }

    if (sectionId === "email") {
      return <GoogleLinkCard linkStatus={googleLink} statusLoading={profileLoading} />;
    }

    if (sectionId === "billing") {
      return (
        <>
          <Card className="p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-display text-lg font-bold">Pro Plan</h3>
                <p className="text-sm text-muted-foreground">$149 / month · billed monthly</p>
              </div>
              <Button>Upgrade Plan</Button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                { label: "Leads", val: 2148, max: 5000 },
                { label: "Active campaigns", val: 3, max: 5 },
              ].map((u) => {
                const pct = Math.round((u.val / u.max) * 100);
                return (
                  <div key={u.label} className="rounded-lg border border-border p-4">
                    <p className="text-xs text-muted-foreground">{u.label}</p>
                    <p className="mt-1 font-display text-xl font-bold">
                      {u.val.toLocaleString()}
                      <span className="text-sm font-medium text-muted-foreground"> / {u.max.toLocaleString()}</span>
                    </p>
                    <Progress value={pct} className="mt-2 h-1.5" />
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="overflow-hidden shadow-card">
            <div className="p-6 pb-0">
              <h3 className="font-display text-lg font-bold">Compare Plans</h3>
              <p className="mt-1 text-sm text-muted-foreground">Pick the plan that matches your outreach volume.</p>
            </div>
            <div className="grid grid-cols-1 gap-px bg-border p-px md:grid-cols-3">
              {[
                {
                  name: "Pro",
                  price: "$149",
                  priceSuffix: "/mo",
                  leads: "5,000 leads",
                  campaigns: "5 campaigns",
                  current: true,
                  cta: "Current Plan",
                  features: ["AI email generation", "Multi-inbox sending", "Reply tracking", "Basic analytics"],
                },
                {
                  name: "Plus",
                  price: "$399",
                  priceSuffix: "/mo",
                  leads: "20,000 leads",
                  campaigns: "20 campaigns",
                  cta: "Upgrade to Plus",
                  features: ["Everything in Pro", "Advanced analytics", "AI reply handling", "Priority support"],
                },
                {
                  name: "Enterprise",
                  price: "Custom",
                  priceSuffix: "",
                  leads: "Unlimited leads",
                  campaigns: "Unlimited campaigns",
                  cta: "Contact Admin",
                  contact: true,
                  features: ["Custom plan built by admin", "Dedicated success manager", "SSO & advanced security", "Custom integrations"],
                },
              ].map((plan) => (
                <div key={plan.name} className={cn("flex flex-col gap-3 bg-card p-5", plan.current && "ring-2 ring-primary")}>
                  <div className="flex items-center justify-between">
                    <p className="font-display text-lg font-bold">{plan.name}</p>
                    {plan.current && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-brand-text">Current</span>}
                  </div>
                  <p className="font-display text-2xl font-bold">
                    {plan.price}
                    {plan.priceSuffix && <span className="text-xs text-muted-foreground"> {plan.priceSuffix}</span>}
                  </p>
                  <div className="space-y-1.5 rounded-lg bg-muted/40 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Leads</span>
                      <span className="font-semibold">{plan.leads}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Campaigns</span>
                      <span className="font-semibold">{plan.campaigns}</span>
                    </div>
                  </div>
                  <ul className="flex-1 space-y-1.5 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant={plan.current ? "outline" : plan.contact ? "outline" : "default"}
                    disabled={plan.current}
                    className="mt-1 w-full"
                    onClick={() => {
                      if (plan.contact) {
                        toast({ title: "Request sent", description: "Your admin will reach out with a custom plan." });
                      } else if (!plan.current) {
                        toast({ title: `Upgrading to ${plan.name}`, description: "Redirecting to checkout..." });
                      }
                    }}
                  >
                    {plan.cta}
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="overflow-hidden shadow-card">
            <div className="p-6"><h3 className="font-display text-lg font-bold">Billing History</h3></div>
            <div className="divide-y divide-border">
              {billingHistory.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-4 text-sm">
                  <span>{b.date}</span>
                  <span className="font-mono">{b.amount}</span>
                  <a href="#" className="text-brand-text hover:underline">{b.invoice}</a>
                </div>
              ))}
            </div>
          </Card>
        </>
      );
    }

    if (sectionId === "danger") {
      return (
        <Card className="border-destructive/40 p-6 shadow-card">
          <h3 className="font-display text-lg font-bold text-destructive">Danger Zone</h3>
          <p className="mt-1 text-sm text-muted-foreground">Irreversible actions. Proceed with caution.</p>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-warning/30 bg-warning/5 p-4">
            <div>
              <p className="font-semibold">Logout from all devices</p>
              <p className="text-sm text-muted-foreground">Sign out all active sessions across devices.</p>
            </div>
            <Button
              variant="outline"
              onClick={async () => {
                setLogoutAllLoading(true);
                try {
                  await logoutAllDevices();
                  navigate("/login", { replace: true });
                } finally {
                  setLogoutAllLoading(false);
                }
              }}
              disabled={logoutAllLoading}
            >
              {logoutAllLoading ? "Logging out..." : "Logout All Devices"}
            </Button>
          </div>
          <div className="mt-4 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <div>
              <p className="font-semibold">Delete Account</p>
              <p className="text-sm text-muted-foreground">Permanently delete your workspace and all data.</p>
            </div>
            <Button
              variant="outline"
              className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => setDeleteOpen(true)}
            >
              Delete Account
            </Button>
          </div>
        </Card>
      );
    }

    return null;
  };


  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px,1fr]">
      {/* Sub-nav (desktop) */}
      <nav className="hidden space-y-2 lg:block">
        {sections.map((s) => {
          const Icon = s.icon;
          const active = section === s.id;
          return (
            <button
              key={s.id}
              onClick={() => selectSection(s.id)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary/15 text-brand-text" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                s.id === "danger" && active && "bg-destructive/10 text-destructive",
              )}
            >
              <Icon className="h-4 w-4" /> {s.label}
            </button>
          );
        })}
      </nav>

      {/* Mobile accordion */}
      <div className="space-y-2 lg:hidden">
        {sections.map((s) => {
          const Icon = s.icon;
          const open = mobileOpenSection === s.id;
          return (
            <div key={s.id} className="rounded-lg border border-border/70 bg-card">
              <button
                onClick={() => {
                  if (open) {
                    setMobileOpenSection(null);
                    return;
                  }
                  setMobileOpenSection(s.id);
                  selectSection(s.id);
                }}
                className={cn(
                  "flex w-full items-center justify-between gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors mb-1",
                  open ? "bg-primary/10 text-brand-text" : "text-foreground hover:bg-muted",
                  s.id === "danger" && open && "bg-destructive/10 text-destructive",
                )}
                aria-expanded={open}
                aria-controls={`settings-section-${s.id}`}
              >
                <span className="flex items-center gap-2.5">
                  <Icon className="h-4 w-4" />
                  {s.label}
                </span>
                <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
              </button>
              {open ? (
                <div id={`settings-section-${s.id}`} className="space-y-4 p-2 pt-0">
                  {renderSectionContent(s.id)}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Desktop sections */}
      <div className="hidden space-y-4 lg:block">
        {renderSectionContent(section)}
      </div>

      {/* Invite */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Invite a team member</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Email</Label><Input placeholder="teammate@company.com" /></div>
            <div className="space-y-1.5">
              <Label>Role</Label>
              <Select defaultValue="Manager">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Admin">Admin</SelectItem>
                  <SelectItem value="Manager">Manager</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={() => { setInviteOpen(false); toast({ title: "Invitation sent" }); }}>Send Invite</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog
        open={deleteOpen}
        onOpenChange={(o) => {
          if (accountDeleting) return;
          setDeleteOpen(o);
          if (!o) setConfirmText("");
        }}
      >
        <DialogContent>
          <DialogHeader><DialogTitle className="text-destructive">Delete account?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete your workspace, leads, campaigns, and history. Type <span className="font-mono font-bold text-destructive">RAPIDAI</span> to confirm.
          </p>
          <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="Type RAPIDAI" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={accountDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirmText !== "RAPIDAI" || accountDeleting}
              onClick={() => void onDeleteAccount()}
            >
              {accountDeleting ? "Deleting..." : "Delete forever"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
