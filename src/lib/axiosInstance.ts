import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearAuthStorage, getAuthToken, setPendingAuthError } from "@/utils/authSorage";
import { refreshSession } from "@/lib/refreshSession";
import { getApiErrorMessage, setSuppressApiErrorToasts } from "@/lib/apiToast";
import { shouldRefreshAccessToken } from "@/lib/authTokenErrors";

const LOGIN_PATH = "/login";

type RetryableAxiosRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

type QueueItem = {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
};

let isRefreshing = false;
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

const setAuthorizationHeader = (request: InternalAxiosRequestConfig, token: string) => {
  request.headers.Authorization = `Bearer ${token}`;
};

const handleRefreshFailure = async (refreshError: unknown) => {
  setSuppressApiErrorToasts(true);
  processQueue(refreshError, null);
  const { unregisterFcmPushToken } = await import("@/services/fcm/fcmPush");
  await unregisterFcmPushToken();
  clearAuthStorage();
  setPendingAuthError(getApiErrorMessage(refreshError));
  window.location.href = LOGIN_PATH;
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
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig;

    if (originalRequest && !originalRequest._retry && shouldRefreshAccessToken(error, originalRequest)) {
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
