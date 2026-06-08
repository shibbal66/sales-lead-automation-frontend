import { getAuthToken } from "@/utils/authStorage";
import { getDeviceLabel } from "@/lib/fcm/deviceLabel";
import {
  clearStoredFcmToken,
  getStoredFcmToken,
  setStoredFcmToken
} from "@/lib/fcm/fcmTokenStorage";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  registerPushToken,
  unregisterPushToken
} from "@/services/notifications/pushNotificationsServices";
import { requestFcmToken } from "@/services/fcm/fcmService";

export async function syncFcmPushRegistration(): Promise<void> {
  if (!isFirebaseConfigured() || !getAuthToken()) return;

  const fcmToken = await requestFcmToken();
  if (!fcmToken) return;

  const storedToken = getStoredFcmToken();
  if (storedToken === fcmToken) return;

  const response = await registerPushToken({
    fcmToken,
    deviceLabel: getDeviceLabel()
  });

  if (response.success) {
    setStoredFcmToken(fcmToken);
  }
}

export async function unregisterFcmPushToken(options?: {
  skipAuthRefresh?: boolean;
}): Promise<void> {
  const fcmToken = getStoredFcmToken();
  if (!fcmToken) return;

  try {
    if (getAuthToken()) {
      await unregisterPushToken({ fcmToken }, { skipAuthRefresh: options?.skipAuthRefresh });
    }
  } catch (error) {
    console.warn("Failed to unregister FCM token:", error);
  } finally {
    clearStoredFcmToken();
  }
}
