import axiosInstance from "./axiosInstance";

async function apiInvoker<T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
  data?: object,
  params?: object
): Promise<T> {
  try {
    const response = await axiosInstance({ url, method, data, params });
    return response.data;
  } catch (error) {
    console.error(`API call to ${url} failed: `, error);
    throw error;
  }
}

export default apiInvoker;
