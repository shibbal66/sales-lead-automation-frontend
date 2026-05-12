import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearAuthStorage, getAuthToken } from "../utils/authSorage";
import { isAuthEndpoint } from "./authTokenErrors";
import { refreshSession } from "./refreshSession";

const LOGIN_PATH = "/login";

type RetryableAxiosRequestConfig = InternalAxiosRequestConfig & { _retry?: boolean };

type QueueItem = {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown | null = null, token: string | null = null) => {
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

const isOnLoginPage = () => window.location.pathname === LOGIN_PATH;

/** Clear auth and redirect to login. If already on login, only clear (no redirect). */
const clearAuthAndRedirect = () => {
  clearAuthStorage();
  if (isOnLoginPage()) return;
  window.location.href = LOGIN_PATH;
};

/** Backend may signal an expired access token with 401 or 500 on protected routes. */
const shouldAttemptTokenRefresh = (error: AxiosError, request?: RetryableAxiosRequestConfig): boolean => {
  const status = error.response?.status;
  if (!request || request._retry) return false;
  if (isAuthEndpoint(request.url)) return false;
  return status === 401 || status === 500;
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableAxiosRequestConfig;

    if (shouldAttemptTokenRefresh(error, originalRequest)) {
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
      } catch (refreshError: unknown) {
        processQueue(refreshError, null);
        clearAuthAndRedirect();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
