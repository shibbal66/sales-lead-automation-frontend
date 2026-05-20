import { create } from "zustand";
import { type AuthUser } from "../../core/types/user.types";
import { logout as logoutApi, logoutAll as logoutAllApi } from "../../services/auth/authServices";
import { getCurrentUser, updateCurrentUser } from "../../services/user/userServices";
import { showApiErrorToast, showApiSuccessToast } from "../../lib/apiToast";
import {
  authUserFromApiProfile,
  buildUpdateProfilePayload,
  type ProfileFormState
} from "../../lib/userProfile";
import type { UserGoogleLinkData } from "../../types/user";
import {
  clearAuthStorage,
  getAuthToken,
  getRefreshToken,
  getStoredUser,
  registerAccessTokenSync,
  registerAuthClearSync,
  setAuthToken,
  setRefreshToken,
  setStoredUser
} from "../../utils/authSorage";

function getHydratedAuth(): { user: AuthUser | null; token: string | null; isAuthenticated: boolean } {
  if (typeof window === "undefined") return { user: null, token: null, isAuthenticated: false };
  const token = getAuthToken();
  const storedUser = getStoredUser();
  if (!token || !storedUser) return { user: null, token, isAuthenticated: false };
  return { user: storedUser, token, isAuthenticated: true };
}

const hydrated = getHydratedAuth();

function applyProfileData(
  set: (partial: Partial<AuthState>) => void,
  apiUser: Parameters<typeof authUserFromApiProfile>[0],
  google?: UserGoogleLinkData
) {
  const user = authUserFromApiProfile(apiUser);
  setStoredUser(user);
  set({
    user,
    isAuthenticated: true,
    ...(google !== undefined ? { googleLink: google } : {})
  });
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  googleLink: UserGoogleLinkData | null;
  profileLoading: boolean;
  profileSaving: boolean;
  setCredentials: (payload: { user: AuthUser; token: string; refreshToken?: string }) => void;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  setUser: (user: AuthUser) => void;
  updateUser: (payload: Partial<AuthUser>) => void;
  fetchCurrentUser: () => Promise<boolean>;
  saveProfile: (form: ProfileFormState) => Promise<boolean>;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  registerAccessTokenSync((token) => {
    const storedUser = getStoredUser();
    set({
      token,
      isAuthenticated: Boolean(token && storedUser),
      isLoading: false
    });
  });

  registerAuthClearSync(() => {
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      googleLink: null,
      profileLoading: false,
      profileSaving: false
    });
  });

  return {
    user: hydrated.user,
    token: hydrated.token,
    isAuthenticated: hydrated.isAuthenticated,
    isLoading: !hydrated.token,
    googleLink: null,
    profileLoading: false,
    profileSaving: false,

    setCredentials: ({ user, token, refreshToken }) => {
      setStoredUser(user);
      if (refreshToken) setRefreshToken(refreshToken);
      setAuthToken(token);
      set({ user, token, isAuthenticated: true, isLoading: false });
      void get().fetchCurrentUser();
    },

    setUser: (user) => {
      setStoredUser(user);
      set({ user, isAuthenticated: true });
    },

    logout: async () => {
      const refreshToken = getRefreshToken();
      try {
        if (refreshToken) {
          const response = await logoutApi({ refreshToken });
          if (response.success) {
            showApiSuccessToast(response.message || "Logged out successfully.");
          }
        }
      } finally {
        clearAuthStorage();
      }
    },

    logoutAllDevices: async () => {
      const response = await logoutAllApi();
      if (!response.success) {
        showApiErrorToast(response);
        return Promise.reject(response);
      }
      showApiSuccessToast(response.message || "Logged out from all devices.");
      clearAuthStorage();
    },

    setLoading: (isLoading) => set({ isLoading }),

    updateUser: (payload) =>
      set((state) => {
        if (!state.user) return state;
        const definedPayload = Object.fromEntries(
          Object.entries(payload).filter(([, value]) => value !== undefined)
        ) as Partial<AuthUser>;
        const user = { ...state.user, ...definedPayload };
        setStoredUser(user);
        return { user };
      }),

    fetchCurrentUser: async () => {
      if (!getAuthToken()) return false;
      set({ profileLoading: true });
      try {
        const response = await getCurrentUser();
        if (!response.success || !response.data?.user) {
          showApiErrorToast(response);
          return false;
        }
        applyProfileData(set, response.data.user, response.data.google ?? null);
        return true;
      } catch (error) {
        showApiErrorToast(error);
        return false;
      } finally {
        set({ profileLoading: false });
      }
    },

    saveProfile: async (form) => {
      set({ profileSaving: true });
      try {
        const response = await updateCurrentUser(buildUpdateProfilePayload(form));
        if (!response.success || !response.data?.user) {
          showApiErrorToast(response);
          return false;
        }
        const { user: apiUser, google } = response.data;
        applyProfileData(set, apiUser, google);
        showApiSuccessToast(response.message || "Profile updated successfully.");
        return true;
      } catch (error) {
        showApiErrorToast(error);
        return false;
      } finally {
        set({ profileSaving: false });
      }
    },

    initializeAuth: () => {
      const token = getAuthToken();
      const storedUser = getStoredUser();
      if (token && storedUser) {
        set({ user: storedUser, token, isAuthenticated: true, isLoading: false });
        void get().fetchCurrentUser();
        return;
      }
      set({ isLoading: false });
    }
  };
});
