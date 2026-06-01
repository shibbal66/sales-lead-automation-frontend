import { useEffect } from "react";
import { useAuthStore } from "@/store/auth/authStore";
import { isFirebaseConfigured } from "@/lib/firebase";
import { subscribeToForegroundMessages } from "@/services/fcm/fcmService";
import { syncFcmPushRegistration } from "@/services/fcm/fcmPush";
import { useNotificationsStore } from "@/store/notifications/notificationsStore";

export function useFcmPush(): void {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const fetchUnreadCount = useNotificationsStore((state) => state.fetchUnreadCount);
  const invalidateUnreadCount = useNotificationsStore((state) => state.invalidateUnreadCount);

  useEffect(() => {
    if (!isAuthenticated || !isFirebaseConfigured()) return;

    void syncFcmPushRegistration();
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !isFirebaseConfigured()) return;

    const unsubscribe = subscribeToForegroundMessages(() => {
      invalidateUnreadCount();
      void fetchUnreadCount({ force: true });
    });

    return unsubscribe;
  }, [fetchUnreadCount, invalidateUnreadCount, isAuthenticated]);
}
