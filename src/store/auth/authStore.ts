import { create } from "zustand";
import { type AuthUser } from "../../core/types/user.types";
import { logout as logoutApi, logoutAll as logoutAllApi } from "../../services/auth/authServices";
import {
  deleteCurrentUser,
  deleteUserAvatar,
  getCurrentUser,
  updateCurrentUser,
  uploadUserAvatar
} from "../../services/user/userServices";
import { showApiErrorToast, showApiSuccessToast } from "../../lib/apiToast";
import {
  buildUpdateNotificationPreferencesPayload,
  buildUpdatePasswordPayload,
  buildUpdateProfilePayload,
  type NotificationPreferencesFormState,
  type ProfileFormState
} from "../../lib/userProfile";
import { avatarSourcesMatch, mapApiUserToAuthUser } from "../../lib/mapAuthUser";
import type { ApiUserProfile, UpdateUserProfileRequest, UserGoogleLinkData } from "../../types/user";
import type { UpdatePasswordFormValues } from "../../validators";
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
} from "@/utils/authStorage";
import { syncFcmPushRegistration, unregisterFcmPushToken } from "@/services/fcm/fcmPush";

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
  get: () => AuthState,
  apiUser: ApiUserProfile,
  google?: UserGoogleLinkData,
  options?: { bustAvatar?: boolean },
) {
  const currentAvatarUrl = get().user?.avatarUrl;
  let user = mapApiUserToAuthUser(apiUser, options?.bustAvatar);

  if (
    !options?.bustAvatar &&
    currentAvatarUrl &&
    user.avatarUrl &&
    avatarSourcesMatch(user.avatarUrl, currentAvatarUrl)
  ) {
    user = { ...user, avatarUrl: currentAvatarUrl };
  }

  setStoredUser(user);
  set({
    user,
    isAuthenticated: true,
    ...(google !== undefined ? { googleLink: google } : {}),
  });
}

function commitUserAvatar(
  set: (partial: Partial<AuthState>) => void,
  get: () => AuthState,
  avatarUrl: string
) {
  const current = get().user;
  if (!current) return;
  const user = { ...current, avatarUrl };
  setStoredUser(user);
  set({ user });
}

async function patchCurrentUser(
  set: (partial: Partial<AuthState>) => void,
  get: () => AuthState,
  payload: UpdateUserProfileRequest,
  successMessage: string,
): Promise<boolean> {
  const response = await updateCurrentUser(payload);
  if (!response.success || !response.data?.user) {
    showApiErrorToast(response);
    return false;
  }
  applyProfileData(set, get, response.data.user, response.data.google);
  showApiSuccessToast(successMessage || response.message);
  return true;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  googleLink: UserGoogleLinkData | null;
  profileLoading: boolean;
  profileSaving: boolean;
  avatarUploading: boolean;
  notificationPreferencesSaving: boolean;
  passwordSaving: boolean;
  accountDeleting: boolean;
  setCredentials: (payload: { user: AuthUser; token: string; refreshToken?: string }) => void;
  logout: () => Promise<void>;
  logoutAllDevices: () => Promise<void>;
  deleteAccount: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
  setUser: (user: AuthUser) => void;
  updateUser: (payload: Partial<AuthUser>) => void;
  fetchCurrentUser: () => Promise<boolean>;
  saveProfile: (form: ProfileFormState) => Promise<boolean>;
  uploadAvatar: (file: File) => Promise<boolean>;
  deleteAvatar: () => Promise<boolean>;
  saveNotificationPreferences: (form: NotificationPreferencesFormState) => Promise<boolean>;
  savePassword: (form: UpdatePasswordFormValues) => Promise<boolean>;
  initializeAuth: () => Promise<void>;
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
      profileSaving: false,
      avatarUploading: false,
      notificationPreferencesSaving: false,
      passwordSaving: false,
      accountDeleting: false
    });
  });

  return {
    user: hydrated.user,
    token: hydrated.token,
    isAuthenticated: hydrated.isAuthenticated,
    isLoading: hydrated.isAuthenticated,
    googleLink: null,
    profileLoading: false,
    profileSaving: false,
    avatarUploading: false,
    notificationPreferencesSaving: false,
    passwordSaving: false,
    accountDeleting: false,

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
        await unregisterFcmPushToken();
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
      await unregisterFcmPushToken();
      showApiSuccessToast(response.message || "Logged out from all devices.");
      clearAuthStorage();
    },

    deleteAccount: async () => {
      set({ accountDeleting: true });
      try {
        const response = await deleteCurrentUser();
        if (!response.success) {
          showApiErrorToast(response);
          return false;
        }
        showApiSuccessToast(response.message || "Account deleted successfully.");
        await unregisterFcmPushToken();
        clearAuthStorage();
        return true;
      } catch (error) {
        showApiErrorToast(error);
        return false;
      } finally {
        set({ accountDeleting: false });
      }
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

        applyProfileData(set, get, response.data.user, response.data.google ?? null);
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
        return await patchCurrentUser(
          set,
          get,
          buildUpdateProfilePayload(form),
          "Profile updated successfully.",
        );
      } catch (error) {
        showApiErrorToast(error);
        return false;
      } finally {
        set({ profileSaving: false });
      }
    },

    uploadAvatar: async (file) => {
      const previousAvatarUrl = get().user?.avatarUrl;
      const previewUrl = URL.createObjectURL(file);
      commitUserAvatar(set, get, previewUrl);
      set({ avatarUploading: true });

      try {
        const response = await uploadUserAvatar(file);
        if (!response.success || !response.data?.user) {
          showApiErrorToast(response);
          return false;
        }

        applyProfileData(set, get, response.data.user, undefined, { bustAvatar: true });
        if (!get().user?.avatarUrl) {
          showApiErrorToast("Upload succeeded but no profile image URL was returned.");
          return false;
        }
        showApiSuccessToast(response.message || "Profile image uploaded.");
        return true;
      } catch (error) {
        showApiErrorToast(error);
        const current = get().user;
        if (current) {
          const user = { ...current, avatarUrl: previousAvatarUrl };
          setStoredUser(user);
          set({ user });
        }
        return false;
      } finally {
        URL.revokeObjectURL(previewUrl);
        set({ avatarUploading: false });
      }
    },

    deleteAvatar: async () => {
      if (!get().user?.avatarUrl) return false;

      set({ avatarUploading: true });
      try {
        const response = await deleteUserAvatar();
        if (!response.success || !response.data?.user) {
          showApiErrorToast(response);
          return false;
        }

        applyProfileData(set, get, response.data.user);
        showApiSuccessToast(response.message || "Profile image removed.");
        return true;
      } catch (error) {
        showApiErrorToast(error);
        return false;
      } finally {
        set({ avatarUploading: false });
      }
    },

    saveNotificationPreferences: async (form) => {
      set({ notificationPreferencesSaving: true });
      try {
        const ok = await patchCurrentUser(
          set,
          get,
          buildUpdateNotificationPreferencesPayload(form),
          "Notification preferences updated.",
        );
        if (ok && form.notificationsEnabled) {
          void syncFcmPushRegistration();
        }
        return ok;
      } catch (error) {
        showApiErrorToast(error);
        return false;
      } finally {
        set({ notificationPreferencesSaving: false });
      }
    },

    savePassword: async (form) => {
      set({ passwordSaving: true });
      try {
        return await patchCurrentUser(
          set,
          get,
          buildUpdatePasswordPayload(form),
          "Password updated successfully.",
        );
      } catch (error) {
        showApiErrorToast(error);
        return false;
      } finally {
        set({ passwordSaving: false });
      }
    },

    initializeAuth: async () => {
      const token = getAuthToken();
      const storedUser = getStoredUser();

      if (!token || !storedUser) {
        set({ isLoading: false });
        return;
      }

      set({ user: storedUser, token, isAuthenticated: true, isLoading: false });
      void get().fetchCurrentUser();
    }
  };
});
