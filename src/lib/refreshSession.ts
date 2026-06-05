import axios from "axios";
import { END_POINT } from "./apiURL";
import { getRefreshToken, setAuthToken, setRefreshToken } from "@/utils/authStorage";
import type { RefreshTokenResponse } from "@/types";

export async function refreshSession(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const { data: body } = await axios.post<RefreshTokenResponse>(
    `${import.meta.env.VITE_API_BASE_URL}${END_POINT.auth.refresh}`,
    { refreshToken }
  );

  if (!body?.success || !body.data?.accessToken || !body.data?.refreshToken) {
    throw new Error(body?.message || "Invalid refresh token response");
  }

  setAuthToken(body.data.accessToken);
  setRefreshToken(body.data.refreshToken);
  return body.data.accessToken;
}
