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
    validateOtp: "/auth/validate-otp",
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
    profile: "/user",
    avatar: "/user/avatar"
  } as const,

  dashboard: {
    summary: "/dashboard/summary",
    performance: "/dashboard/performance",
    activeCampaigns: "/dashboard/active-campaigns",
    recentActivity: "/dashboard/recent-activity",
    meetingStats: "/dashboard/meeting-stats"
  } as const,

  meeting: {
    list: "/meetings",
    create: "/meetings",
    byId: (id: string) => `/meetings/${id}`
  } as const,

  analytics: {
    overview: "/analytics/overview",
    sentVsReplies: "/analytics/sent-vs-replies",
    replyBreakdown: "/analytics/reply-breakdown",
    campaignComparison: "/analytics/campaign-comparison",
    campaignChart: "/analytics/campaign-chart"
  } as const,

  notifications: {
    list: "/notifications",
    unreadCount: "/notifications/unread-count",
    readAll: "/notifications/read-all",
    readById: (id: string) => `/notifications/${id}/read`,
    pushRegister: "/notifications/push/register",
    pushStatus: "/notifications/push/status"
  } as const,

  billing: {
    plans: "/billing/plans",
    subscription: "/billing/subscription",
    checkout: "/billing/checkout",
    upgrade: "/billing/upgrade",
    downgrade: "/billing/downgrade",
    cancel: "/billing/cancel",
    reactivate: "/billing/reactivate",
    portal: "/billing/portal",
    paymentMethods: "/billing/payment-methods",
    paymentMethodsDefault: "/billing/payment-methods/default",
    paymentMethodById: (paymentMethodId: string) => `/billing/payment-methods/${paymentMethodId}`,
    quota: "/billing/quota"
  } as const
};
