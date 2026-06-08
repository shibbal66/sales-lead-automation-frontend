import axiosInstance from "./axiosInstance";
import type { AuthAwareAxiosRequestConfig } from "./authTokenErrors";

export type ApiInvokerOptions = {
  skipAuthRefresh?: boolean;
};

async function apiInvoker<T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  data?: object,
  params?: object,
  options?: ApiInvokerOptions
): Promise<T> {
  try {
    const config: AuthAwareAxiosRequestConfig = { url, method, data, params };
    if (options?.skipAuthRefresh) {
      config._skipAuthRefresh = true;
    }
    const response = await axiosInstance(config);
    return response.data;
  } catch (error) {
    console.error(`API call to ${url} failed: `, error);
    throw error;
  }
}

export default apiInvoker;
