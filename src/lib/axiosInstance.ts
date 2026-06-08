import axios, { type AxiosInstance, type AxiosError } from "axios";
import { clearAuthStorage, getAuthToken, getRefreshToken, setPendingAuthError } from "@/utils/authStorage";
import { refreshSession } from "@/lib/refreshSession";
import { getApiErrorMessage, setSuppressApiErrorToasts } from "@/lib/apiToast";
import {
  isAuthEndpoint,
  isTokenExpiredPayload,
  shouldRefreshAccessToken,
  tokenExpiredResponseToAxiosError,
  type AuthAwareAxiosRequestConfig
} from "@/lib/authTokenErrors";

const LOGIN_PATH = "/login";

type RetryableAxiosRequestConfig = AuthAwareAxiosRequestConfig & { _retry?: boolean };

type QueueItem = {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
};

let isRefreshing = false;
let isHandlingAuthFailure = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown = null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error != null) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

const setAuthorizationHeader = (request: AuthAwareAxiosRequestConfig, token: string) => {
  request.headers.Authorization = `Bearer ${token}`;
};

const handleRefreshFailure = async (refreshError: unknown) => {
  if (isHandlingAuthFailure) return;

  isHandlingAuthFailure = true;
  setSuppressApiErrorToasts(true);
  processQueue(refreshError, null);

  try {
    const { unregisterFcmPushToken } = await import("@/services/fcm/fcmPush");
    await unregisterFcmPushToken({ skipAuthRefresh: true });
    clearAuthStorage();
    setPendingAuthError(getApiErrorMessage(refreshError));
    window.location.href = LOGIN_PATH;
  } finally {
    isHandlingAuthFailure = false;
  }
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  withCredentials: true
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      setAuthorizationHeader(config, token);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => {
    if (isTokenExpiredPayload(response.data) && !isAuthEndpoint(response.config?.url)) {
      return Promise.reject(tokenExpiredResponseToAxiosError(response));
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig | undefined;

    if (originalRequest && shouldRefreshAccessToken(error, originalRequest)) {
      if (originalRequest._retry) {
        isRefreshing = false;
        await handleRefreshFailure(error);
        return Promise.reject(error);
      }

      if (!getRefreshToken()) {
        await handleRefreshFailure(new Error("No refresh token available"));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            setAuthorizationHeader(originalRequest, token as string);
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshSession();
        setAuthorizationHeader(originalRequest, newAccessToken);
        processQueue(null, newAccessToken);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        await handleRefreshFailure(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
