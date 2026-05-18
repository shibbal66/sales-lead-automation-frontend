import { create } from "zustand";
import { type AuthUser } from "../../core/types/user.types";
import { logout as logoutApi, logoutAll as logoutAllApi } from "../../services/auth/authServices";
import { showApiErrorToast, showApiSuccessToast } from "../../lib/apiToast";
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

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setCredentials: (payload: { user: AuthUser; token: string; refreshToken?: string }) => void;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  setLoading: (loading: boolean) => void;
  updateUser: (payload: Partial<AuthUser>) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
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
      isLoading: false
    });
  });

  return {
    user: hydrated.user,
    token: hydrated.token,
    isAuthenticated: hydrated.isAuthenticated,
    isLoading: !hydrated.token,

    setCredentials: ({ user, token, refreshToken }) => {
      setStoredUser(user);
      if (refreshToken) setRefreshToken(refreshToken);
      setAuthToken(token);
      set({ user, token, isAuthenticated: true, isLoading: false });
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

    initializeAuth: () => {
      const token = getAuthToken();
      const storedUser = getStoredUser();
      if (token && storedUser) {
        set({ user: storedUser, token, isAuthenticated: true, isLoading: false });
        return;
      }
      set({ isLoading: false });
    }
  };
});
