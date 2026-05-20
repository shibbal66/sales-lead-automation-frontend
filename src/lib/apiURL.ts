export const END_POINT = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    google: "/auth/google",
    googleCallback: "/auth/google/callback",
    googleToken: "/auth/google/token",
    googleStatus: "/auth/google/status",
    refresh: "/auth/refresh",
    verifyOtp: "/auth/verify-otp",
    forgotPassword: "/auth/forgot-password",
    resetPassword: "/auth/reset-password",
    resendOtp: "/auth/resend-otp",
    logout: "/auth/logout",
    logoutAll: "/auth/logout-all",
  },

  campaign: {
    create: "/campaigns",
  },

  lead: {
    list: "/leads"
  },

  user: {
    profile: "/user"
  } as const,

  dashboard: {
    summary: "/dashboard/summary",
    performance: "/dashboard/performance",
    activeCampaigns: "/dashboard/active-campaigns",
    recentActivity: "/dashboard/recent-activity"
  } as const,

  meeting: {
    list: "/meetings",
    create: "/meetings",
    byId: (id: string) => `/meetings/${id}`
  } as const
};
