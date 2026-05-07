import type { NavigateFunction } from "react-router-dom";
import { googleSignIn } from "@/services/auth/authServices";
import type { AuthUser } from "@/core/types/user.types";
import { showApiErrorToast } from "@/lib/apiToast";

type SetCredentials = (payload: { user: AuthUser; token: string; refreshToken?: string }) => void;

export async function signInWithGoogle(params: {
  setCredentials: SetCredentials;
  navigate: NavigateFunction;
  onSuccessToast: (message: string) => void;
}) {
  const { setCredentials, navigate, onSuccessToast } = params;
  const response = await googleSignIn();

  // Redirect-based OAuth fallback
  if (response.data?.url) {
    window.location.href = response.data.url;
    return;
  }

  if (!response.success || !response.data?.accessToken || !response.data?.refreshToken || !response.data?.user) {
    showApiErrorToast(response);
    return;
  }

  const apiUser = response.data.user;
  const nameParts = (apiUser.name || "").trim().split(/\s+/).filter(Boolean);
  const user: AuthUser = {
    id: apiUser.id,
    email: apiUser.email,
    isVerified: apiUser.isVerified ?? true,
    createdAt: apiUser.createdAt,
    firstName: nameParts[0],
    lastName: nameParts.slice(1).join(" ") || undefined
  };

  setCredentials({
    user,
    token: response.data.accessToken,
    refreshToken: response.data.refreshToken
  });

  onSuccessToast(response.message || "Google authentication successful.");
  navigate("/dashboard", { replace: true });
}
