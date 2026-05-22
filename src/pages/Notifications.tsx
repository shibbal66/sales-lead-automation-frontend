import { useCallback, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Sparkles,
  BellOff,
  Check,
} from "lucide-react";
import { TablePagination } from "@/components/layout/table-pagination";
import { NotificationsListSkeleton } from "@/components/skeletons";
import {
  NOTIFICATION_LIST_TABS,
  notificationIconByCategory,
  type NotificationListTab
} from "@/lib/notifications";
import { useNotificationsStore } from "@/store/notifications/notificationsStore";

export default function Notifications() {
  const [tab, setTab] = useState<NotificationListTab>("all");
  const navigate = useNavigate();

  const unreadCount = useNotificationsStore((state) => state.unreadCount);
  const items = useNotificationsStore((state) => state.items);
  const page = useNotificationsStore((state) => state.page);
  const totalPages = useNotificationsStore((state) => state.totalPages);
  const isFetchingList = useNotificationsStore((state) => state.isFetchingList);
  const fetchUnreadCount = useNotificationsStore((state) => state.fetchUnreadCount);
  const fetchNotifications = useNotificationsStore((state) => state.fetchNotifications);
  const markAllRead = useNotificationsStore((state) => state.markAllRead);
  const isMarkingAllRead = useNotificationsStore((state) => state.isMarkingAllRead);
  const markNotificationRead = useNotificationsStore((state) => state.markNotificationRead);
  const markingReadIds = useNotificationsStore((state) => state.markingReadIds);

  const loadList = useCallback(
    (nextTab: NotificationListTab, nextPage = 1) => {
      void fetchNotifications({ tab: nextTab, page: nextPage });
    },
    [fetchNotifications]
  );

  useEffect(() => {
    void fetchUnreadCount({ force: true });
  }, [fetchUnreadCount]);

  useEffect(() => {
    loadList(tab, 1);
  }, [tab, loadList]);

  const handleTabChange = (value: string) => {
    setTab(value as NotificationListTab);
  };

  const handlePageChange = (nextPage: number) => {
    loadList(tab, nextPage);
  };

  const handleMarkAllRead = async () => {
    const ok = await markAllRead();
    if (ok) {
      loadList(tab, page);
      void fetchUnreadCount({ force: true });
    }
  };

  const handleMarkRead = (id: string) => {
    void markNotificationRead(id);
  };

  const handleNotificationClick = (id: string, read: boolean, href?: string) => {
    if (!read) {
      void markNotificationRead(id).then((ok) => {
        if (ok && href) navigate(href);
      });
      return;
    }
    if (href) navigate(href);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => navigate("/settings?tab=notifications")}>
            <BellOff className="h-4 w-4" /> Preferences
          </Button>
          <Button
            onClick={() => void handleMarkAllRead()}
            disabled={unreadCount === 0 || isMarkingAllRead}
          >
            <Check className="h-4 w-4" /> Mark all read
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={handleTabChange}>
        <TabsList>
          {NOTIFICATION_LIST_TABS.map((f) => (
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
        {isFetchingList ? (
          <NotificationsListSkeleton />
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 p-12 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="font-display text-base font-bold">Nothing here</p>
            <p className="text-sm text-muted-foreground">No notifications match this filter.</p>
          </div>
        ) : (
          <>
            <ul className="divide-y divide-border">
              {items.map((n) => {
                const { Icon, tone } = notificationIconByCategory[n.type];
                return (
                  <li
                    key={n.id}
                    className={cn(
                      "group relative flex items-start gap-3 px-5 py-4 transition-colors hover:bg-muted/40",
                      !n.read && "bg-primary/[0.04]"
                    )}
                  >
                    {!n.read && (
                      <span className="absolute left-1.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" />
                    )}
                    <div className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-lg", tone)}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleNotificationClick(n.id, n.read, n.href)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="flex items-baseline justify-between gap-3">
                        <p
                          className={cn(
                            "text-sm leading-tight",
                            !n.read ? "font-semibold text-foreground" : "font-medium text-foreground/90"
                          )}
                        >
                          {n.title}
                        </p>
                        <span className="shrink-0 text-[11px] text-muted-foreground">{n.at}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.body}</p>
                    </button>
                    {!n.read ? (
                      <div className="flex shrink-0 items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-primary/30"
                          disabled={Boolean(markingReadIds[n.id])}
                          title="Mark as read"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleMarkRead(n.id);
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </Button>
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <TablePagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
      </Card>
    </div>
  );
}
