import { getToken, onMessage, type MessagePayload } from "firebase/messaging";
import { isFirebaseConfigured, messaging } from "@/lib/firebase";

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export async function registerMessagingServiceWorker(): Promise<ServiceWorkerRegistration | undefined> {
  if (!("serviceWorker" in navigator)) return undefined;

  try {
    return await navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" });
  } catch (error) {
    console.error("Failed to register Firebase messaging service worker:", error);
    return undefined;
  }
}

export async function requestFcmToken(): Promise<string | undefined> {
  if (!isFirebaseConfigured() || !messaging) {
    return undefined;
  }

  if (!VAPID_KEY) {
    console.warn("VITE_FIREBASE_VAPID_KEY is not set; cannot obtain an FCM token.");
    return undefined;
  }

  try {
    if (!("Notification" in window)) {
      console.warn("This browser does not support notifications.");
      return undefined;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("Notification permission denied.");
      return undefined;
    }

    const serviceWorkerRegistration = await registerMessagingServiceWorker();
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration
    });

    return token || undefined;
  } catch (error) {
    console.error("An error occurred while retrieving the FCM token:", error);
    return undefined;
  }
}

export function subscribeToForegroundMessages(
  handler: (payload: MessagePayload) => void
): () => void {
  if (!messaging) return () => undefined;

  return onMessage(messaging, handler);
}
