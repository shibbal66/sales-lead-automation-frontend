import type { AuthUser, User } from "@/core/types/user.types";


export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
    user: AuthUser;
  };
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface SignupResponse {
  success: boolean;
  message: string;
  data?: {
    userId: string;
  };
}

export interface GoogleLoginRequest {
  token: string;
}

export interface GoogleAuthResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken?: string;
    refreshToken?: string;
    user?: AuthUser;
    url?: string;
  };
}






export interface VerifyOtpRequest {
  userId: string;
  otp: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data?: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface ResendOtpRequest {
  userId: string;
}

export interface ResendOtpResponse {
  success: boolean;
  message: string;
}

export interface LogoutAllResponse {
  success: boolean;
  message: string;
}