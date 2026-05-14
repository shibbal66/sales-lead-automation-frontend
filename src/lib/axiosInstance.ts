import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearAuthStorage, getAuthToken } from "@/utils/authSorage";
import { refreshSession } from "@/lib/refreshSession";
import { END_POINT } from "@/lib/apiURL";

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

const isOnLoginPage = () => window.location.pathname === LOGIN_PATH;

/** Clears persisted auth via `authSorage` only, then redirects to login when appropriate. */
const clearAuthAndRedirect = () => {
  clearAuthStorage();
  if (isOnLoginPage()) return;
  window.location.href = LOGIN_PATH;
};

/** Do not run refresh for auth endpoints (avoids loops and masks real login errors). */
const shouldSkipRefreshForRequest = (url?: string): boolean => {
  if (!url) return true;
  return (
    url.includes(END_POINT.auth.login) ||
    url.includes(END_POINT.auth.refresh) ||
    url.includes(END_POINT.auth.signup) ||
    url.includes(END_POINT.auth.verifyOtp) ||
    url.includes(END_POINT.auth.resendOtp) ||
    url.includes(END_POINT.auth.googleLogin)
  );
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

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !shouldSkipRefreshForRequest(originalRequest.url)
    ) {
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
      } catch {
        processQueue(error, null);
        clearAuthAndRedirect();
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
