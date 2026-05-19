import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { billingHistory } from "@/lib/mock-data";
import { getUserDisplayEmail, getUserDisplayName, getUserInitials } from "@/lib/userDisplay";
import { cn } from "@/lib/utils";
import type { AuthUser } from "@/core/types/user.types";
import {
  User, Mail, CreditCard, Users, Bell, AlertTriangle, Check, Plus,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/auth/authStore";
import { GoogleLinkCard } from "@/components/auth/google-link-card";

const sections = [
  { id: "profile", label: "Profile", icon: User },
  { id: "email", label: "Email Accounts", icon: Mail },
  { id: "billing", label: "Subscription & Billing", icon: CreditCard },
  { id: "team", label: "Team & Roles", icon: Users },
  { id: "notif", label: "Notifications", icon: Bell },
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

type ProfileFormState = {
  name: string;
  email: string;
  contact: string;
  address: string;
  timezone: string;
};

function formatUserRole(role?: string) {
  if (!role) return "User";
  const normalized = role.trim().toLowerCase();
  if (normalized === "admin") return "Admin";
  if (normalized === "manager") return "Manager";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

function formatAuthProvider(provider?: string) {
  if (!provider) return "Email";
  if (provider.toLowerCase() === "google") return "Gmail";
  return provider.charAt(0).toUpperCase() + provider.slice(1);
}

function UserAvatarCircle({ user, className }: { user: AuthUser | null; className?: string }) {
  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(user);

  if (user?.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt={displayName}
        className={cn("rounded-full object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "grid place-items-center rounded-full bg-gradient-brand font-bold text-primary-foreground",
        className
      )}
    >
      {initials}
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const updateUser = useAuthStore((state) => state.updateUser);
  const logoutAllDevices = useAuthStore((state) => state.logoutAllDevices);
  const section = settingsSectionFromTab(searchParams.get("tab"));

  const selectSection = (id: SettingsSectionId) => {
    setSearchParams({ tab: id }, { replace: true });
  };
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [profileForm, setProfileForm] = useState<ProfileFormState>({
    name: "",
    email: "",
    contact: "",
    address: "",
    timezone: "pt"
  });

  useEffect(() => {
    if (!user) return;
    setProfileForm({
      name: getUserDisplayName(user),
      email: user.email,
      contact: user.contact ?? "",
      address: user.address ?? "",
      timezone: "pt"
    });
  }, [user]);

  const currentTeamMember = useMemo(() => {
    if (!user) return null;
    return {
      id: user.id,
      name: getUserDisplayName(user),
      email: getUserDisplayEmail(user),
      role: formatUserRole(user.role)
    };
  }, [user]);


  const isGoogleAccount = user?.authProvider?.toLowerCase() === "google";

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[220px,1fr]">
      {/* Sub-nav */}
      <nav className="space-y-1">
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

      {/* Sections */}
      <div className="space-y-4">
        {section === "profile" && (
          <Card className="p-6 shadow-card">
            <h3 className="font-display text-lg font-bold">Profile</h3>
            <div className="mt-4 flex items-center gap-4">
              <UserAvatarCircle user={user} className="h-16 w-16 text-lg" />
              <Button variant="outline" disabled={!user}>Upload Avatar</Button>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="profile-name">Full name</Label>
                <Input
                  id="profile-name"
                  value={profileForm.name}
                  disabled={!user}
                  onChange={(event) => setProfileForm((current) => ({ ...current, name: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-email">Email</Label>
                <Input id="profile-email" value={profileForm.email} disabled readOnly />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="profile-contact">Phone</Label>
                <Input
                  id="profile-contact"
                  value={profileForm.contact}
                  disabled={!user}
                  onChange={(event) => setProfileForm((current) => ({ ...current, contact: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <Label htmlFor="profile-address">Address</Label>
                <Input
                  id="profile-address"
                  value={profileForm.address}
                  disabled={!user}
                  onChange={(event) => setProfileForm((current) => ({ ...current, address: event.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Timezone</Label>
                <Select
                  value={profileForm.timezone}
                  disabled={!user}
                  onValueChange={(value) => setProfileForm((current) => ({ ...current, timezone: value }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pt">(GMT-08:00) Pacific Time</SelectItem>
                    <SelectItem value="et">(GMT-05:00) Eastern Time</SelectItem>
                    <SelectItem value="utc">(GMT+00:00) UTC</SelectItem>
                    <SelectItem value="cet">(GMT+01:00) Central European Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <Button disabled={!user}>
                Save Changes
              </Button>
            </div>
          </Card>
        )}

        {section === "email" && (
          <>
            <GoogleLinkCard />
            <Card className="p-6 shadow-card">
              <h3 className="font-display text-lg font-bold">Connected Inboxes</h3>
              <p className="mt-1 text-sm text-muted-foreground">Connect Gmail to send personalized outreach from your address.</p>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-surface/40 p-4">
                <div className="flex items-center gap-3">
                  <UserAvatarCircle user={user} className="h-10 w-10 text-sm" />
                  <div>
                    <p className="font-semibold">{getUserDisplayEmail(user)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatAuthProvider(user?.authProvider)}
                      {user?.isVerified ? " · Verified" : ""}
                    </p>
                  </div>
                </div>
                <Button variant="outline" disabled={!isGoogleAccount}>
                  {isGoogleAccount ? "Disconnect" : "Not connected"}
                </Button>
              </div>
              
            </Card>
            <Card className="p-6 shadow-card">
              <h3 className="font-display text-lg font-bold">SendGrid (optional)</h3>
              <p className="mt-1 text-sm text-muted-foreground">For high-volume domains, connect a SendGrid API key.</p>
              <div className="mt-4 flex gap-2">
                <Input placeholder="SG.xxxxxxxxxxxxxxxxxxx" type="password" />
                <Button>Save Key</Button>
              </div>
            </Card>
          </>
        )}

        {section === "billing" && (
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
                      <p className="mt-1 font-display text-xl font-bold">{u.val.toLocaleString()}<span className="text-sm font-medium text-muted-foreground"> / {u.max.toLocaleString()}</span></p>
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
        )}

        {section === "team" && (
          <>
            <Card className="p-6 shadow-card">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">Team Members</h3>
                <Button onClick={() => setInviteOpen(true)}><Plus className="h-4 w-4" /> Invite Member</Button>
              </div>
              <div className="mt-4 space-y-2">
                {currentTeamMember ? (
                  <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                    <UserAvatarCircle user={user} className="h-9 w-9 text-xs" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{currentTeamMember.name}</p>
                      <p className="text-xs text-muted-foreground">{currentTeamMember.email}</p>
                    </div>
                    <span className={cn(
                      "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                      currentTeamMember.role === "Admin" ? "border-primary/30 bg-primary/15 text-brand-text" :
                      currentTeamMember.role === "Manager" ? "border-info/30 bg-info/15 text-info" : "border-border bg-muted text-muted-foreground"
                    )}>{currentTeamMember.role}</span>
                    <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-semibold text-muted-foreground">
                      You
                    </span>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sign in to view your team profile.</p>
                )}
              </div>
            </Card>

            <Card className="p-6 shadow-card">
              <h4 className="font-semibold">Role Permissions</h4>
              <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                <li><span className="font-semibold text-foreground">Admin —</span> full access including billing and team management.</li>
                <li><span className="font-semibold text-foreground">Manager —</span> create and manage campaigns, leads, inbox.</li>
                <li><span className="font-semibold text-foreground">User —</span> view-only with reply access in inbox.</li>
              </ul>
            </Card>
          </>
        )}

        {section === "notif" && (
          <Card className="p-6 shadow-card">
            <h3 className="font-display text-lg font-bold">Notifications</h3>
            <div className="mt-4 space-y-3">
              {[
                "Email me when a lead replies",
                "Email me when a meeting is booked",
                "Daily digest email (campaign performance summary)",
                "In-app notifications for replies",
                "In-app notifications for meetings",
              ].map((n, i) => (
                <div key={n} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <span className="text-sm">{n}</span>
                  <Switch defaultChecked={i !== 2} />
                </div>
              ))}
            </div>
          </Card>
        )}

        {section === "danger" && (
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
              <Button variant="outline" className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setDeleteOpen(true)}>
                Delete Account
              </Button>
            </div>
          </Card>
        )}
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
      <Dialog open={deleteOpen} onOpenChange={(o) => { setDeleteOpen(o); if (!o) setConfirmText(""); }}>
        <DialogContent>
          <DialogHeader><DialogTitle className="text-destructive">Delete account?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete your workspace, leads, campaigns, and history. Type <span className="font-mono font-bold text-destructive">RAPIDAI</span> to confirm.
          </p>
          <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="Type RAPIDAI" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={confirmText !== "RAPIDAI"}
              onClick={() => { setDeleteOpen(false); toast({ title: "Account deleted" }); }}
            >
              Delete forever
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
