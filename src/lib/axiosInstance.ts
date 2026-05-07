import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { END_POINT } from "./apiURL";
import { clearAuthStorage, getAuthToken, getRefreshToken, setAuthToken, setRefreshToken } from "../utils/authSorage";
import { showApiErrorToast } from "./apiToast";

const LOGIN_PATH = "/login";
const REFRESH_PATH = END_POINT.auth.refresh;
const GOOGLE_LOGIN_PATH = END_POINT.auth.googleLogin;

const isAuthRequest = (url?: string) =>
  url?.includes(END_POINT.auth.login) || url?.includes(REFRESH_PATH) || url?.includes(GOOGLE_LOGIN_PATH);

const isExpiredTokenError = (error: AxiosError): boolean => {
  const status = error.response?.status;
  const message = (error.response?.data as { message?: string } | undefined)?.message?.toLowerCase() ?? "";
  const tokenExpiredByMessage =
    message.includes("token expired") ||
    message.includes("access token expired") ||
    message.includes("use /auth/refresh");

  if (status === 401) return true;
  if (status === 403 && tokenExpiredByMessage) return true;
  // Some backends return 500 for expired token; fall back to message-based detection.
  if (status === 500 && tokenExpiredByMessage) return true;
  if (tokenExpiredByMessage) return true;
  return false;
};

type QueueItem = {
  resolve: (value: string) => void;
  reject: (reason?: unknown) => void;
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: Error | null = null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    } else {
      promise.reject(new Error("Failed to refresh access token."));
    }
  });
  failedQueue = [];
};

const setAuthorizationHeader = (request: InternalAxiosRequestConfig, token: string) => {
  if (request.headers && typeof (request.headers as { set?: unknown }).set === "function") {
    (request.headers as { set: (key: string, value: string) => void }).set("Authorization", `Bearer ${token}`);
    return;
  }
  request.headers = request.headers ?? ({} as InternalAxiosRequestConfig["headers"]);
  (request.headers as Record<string, string>).Authorization = `Bearer ${token}`;
};

const isOnLoginPage = () => window.location.pathname === LOGIN_PATH;

/** Clear auth and redirect to login. If already on login, only clear (no redirect); caller will show toast. */
const clearAuthAndRedirect = () => {
  clearAuthStorage();
  if (isOnLoginPage()) return;
  window.location.href = LOGIN_PATH;
};

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = getRefreshToken();

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}${REFRESH_PATH}`, { refreshToken });

  const { data } = response.data;

  if (!data?.accessToken || !data?.refreshToken) {
    throw new Error("Invalid refresh token response");
  }

  setAuthToken(data.accessToken);
  setRefreshToken(data.refreshToken);

  return data.accessToken;
};

const axiosInstance: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  withCredentials: true
});

// Request interceptor - Add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle 401 (refresh token). 403s are surfaced to callers.
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Network/request failure (no response received from server)
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        showApiErrorToast(new Error("Request timed out. Please try again."));
      } else {
        showApiErrorToast(new Error("Network error. Please check your internet connection."));
      }
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized - Try to refresh token (skip for login/refresh requests so only the actual failed API error is shown)
    if (isExpiredTokenError(error) && originalRequest && !originalRequest._retry && !isAuthRequest(originalRequest.url)) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            setAuthorizationHeader(originalRequest, token);
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await refreshAccessToken();

        setAuthorizationHeader(originalRequest, newAccessToken);
        processQueue(null, newAccessToken);

        return axiosInstance(originalRequest);
      } catch {
        processQueue(error, null);
        clearAuthAndRedirect();
        // Reject with original request error so UI shows the failed API's error, not refresh error (no refresh toast)
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    // Non-auth API failures are surfaced here for consistent toasts.
    if (!isAuthRequest(originalRequest?.url)) {
      showApiErrorToast(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
