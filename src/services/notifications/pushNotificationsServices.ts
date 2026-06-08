import apiInvoker from "@/lib/apiInvoker";
import { END_POINT } from "@/lib/apiURL";
import type {
  GetPushNotificationStatusResponse,
  RegisterPushTokenRequest,
  RegisterPushTokenResponse,
  UnregisterPushTokenRequest,
  UnregisterPushTokenResponse
} from "@/types/notifications";

export function registerPushToken(payload: RegisterPushTokenRequest) {
  return apiInvoker<RegisterPushTokenResponse>(
    END_POINT.notifications.pushRegister,
    "POST",
    payload
  );
}

export function unregisterPushToken(
  payload: UnregisterPushTokenRequest,
  options?: { skipAuthRefresh?: boolean }
) {
  return apiInvoker<UnregisterPushTokenResponse>(
    END_POINT.notifications.pushRegister,
    "DELETE",
    payload,
    undefined,
    { skipAuthRefresh: options?.skipAuthRefresh }
  );
}

export function getPushNotificationStatus() {
  return apiInvoker<GetPushNotificationStatusResponse>(
    END_POINT.notifications.pushStatus,
    "GET"
  );
}
