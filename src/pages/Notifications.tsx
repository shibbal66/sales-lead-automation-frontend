import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  MessageSquare, CalendarCheck, Megaphone, AlertTriangle, UserPlus, CheckCircle2,
  Sparkles, BellOff, Check,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type NotifType = "reply" | "meeting" | "campaign" | "system" | "lead";

interface Notif {
  id: string;
  type: NotifType;
  title: string;
  body: string;
  at: string;
  read: boolean;
  href?: string;
}

const seed: Notif[] = [
  { id: "n1", type: "reply", title: "Sarah Chen replied", body: "“This sounds interesting — can you send a deck before we chat?”", at: "2 min ago", read: false, href: "/leads" },
  { id: "n2", type: "meeting", title: "Meeting booked with Marcus Webb", body: "Acme Corp · Thu Apr 24, 10:30 AM PT", at: "18 min ago", read: false, href: "/meetings" },
  { id: "n3", type: "campaign", title: "Campaign 'Q2 Outbound — SaaS' sent 45 emails", body: "Daily batch completed successfully.", at: "1 hr ago", read: false, href: "/campaigns" },
  { id: "n4", type: "lead", title: "12 new leads enriched", body: "Enrichment job for 'EU Decision Makers' finished.", at: "3 hr ago", read: false, href: "/leads" },
  { id: "n5", type: "system", title: "Deliverability healthy", body: "Bounce rate dropped to 1.4% this week. Great work!", at: "5 hr ago", read: true },
  { id: "n6", type: "reply", title: "James Liu replied — Not Interested", body: "Auto-classified and removed from sequence.", at: "Yesterday", read: true, href: "/leads" },
  { id: "n7", type: "meeting", title: "Meeting cancelled — Priya Patel", body: "Lead requested to reschedule for next week.", at: "Yesterday", read: true, href: "/meetings" },
  { id: "n8", type: "system", title: "Plan usage at 75%", body: "You've used 18,750 of 25,000 emails this month.", at: "2 days ago", read: true, href: "/settings" },
  { id: "n9", type: "campaign", title: "Campaign 'APAC Pilot' moved to Draft", body: "Pending approval before launch.", at: "2 days ago", read: true, href: "/campaigns" },
  { id: "n10", type: "lead", title: "5 leads unsubscribed", body: "Auto-removed from all active campaigns.", at: "3 days ago", read: true },
];

const iconFor: Record<NotifType, { Icon: typeof MessageSquare; tone: string }> = {
  reply:    { Icon: MessageSquare, tone: "bg-primary/15 text-primary" },
  meeting:  { Icon: CalendarCheck, tone: "bg-success/15 text-success" },
  campaign: { Icon: Megaphone,     tone: "bg-info/15 text-info" },
  system:   { Icon: AlertTriangle, tone: "bg-warning/15 text-warning" },
  lead:     { Icon: UserPlus,      tone: "bg-brand-deep/15 text-brand-text" },
};

const filters = [
  { id: "all", label: "All" },
  { id: "unread", label: "Unread" },
  { id: "reply", label: "Replies" },
  { id: "meeting", label: "Meetings" },
  { id: "campaign", label: "Campaigns" },
  { id: "system", label: "System" },
] as const;

export default function Notifications() {
  const [items, setItems] = useState<Notif[]>(seed);
  const [tab, setTab] = useState<(typeof filters)[number]["id"]>("all");
  const navigate = useNavigate();

  const unreadCount = items.filter((n) => !n.read).length;

  const filtered = items.filter((n) => {
    if (tab === "all") return true;
    if (tab === "unread") return !n.read;
    return n.type === tab;
  });

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    toast({ title: "All notifications marked as read" });
  };

  const toggleRead = (id: string) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n)));

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}` : "You're all caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/settings")}>
            <BellOff className="h-4 w-4" /> Preferences
          </Button>
          <Button onClick={markAllRead} disabled={unreadCount === 0}>
            <Check className="h-4 w-4" /> Mark all read
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList>
          {filters.map((f) => (
            <TabsTrigger key={f.id} value={f.id}>
              {f.label}
              {f.id === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-brand-text">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <Card className="overflow-hidden shadow-card">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="font-display text-base font-bold">Nothing here</p>
            <p className="text-sm text-muted-foreground">No notifications match this filter.</p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {filtered.map((n) => {
              const { Icon, tone } = iconFor[n.type];
              return (
                <li
                  key={n.id}
                  className={cn(
                    "group relative flex items-start gap-3 px-5 py-4 transition-colors hover:bg-muted/40",
                    !n.read && "bg-primary/[0.04]",
                  )}
                >
                  {!n.read && (
                    <span className="absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
                  )}
                  <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg", tone)}>
                    <Icon className="h-4.5 w-4.5" />
                  </div>
                  <button
                    onClick={() => {
                      if (!n.read) toggleRead(n.id);
                      if (n.href) navigate(n.href);
                    }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <p className={cn("text-sm leading-tight", !n.read ? "font-semibold text-foreground" : "font-medium text-foreground/90")}>
                        {n.title}
                      </p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{n.at}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{n.body}</p>
                  </button>
                  <div className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleRead(n.id)}
                      title={n.read ? "Mark as unread" : "Mark as read"}
                    >
                      <CheckCircle2 className={cn("h-4 w-4", n.read ? "text-muted-foreground" : "text-primary")} />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
