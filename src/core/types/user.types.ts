

export interface User {
  id?: string;
  email?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  authProvider?: string;
  isVerified?: boolean;
  role?: string;
  address?: string | null;
  contact?: string | null;
  timezone?: string | null;
  notificationsEnabled?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser extends User {
  id: string;
  email: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
