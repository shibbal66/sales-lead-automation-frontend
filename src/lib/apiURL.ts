export const END_POINT = {
  auth: {
    login: "/auth/login",
    signup: "/auth/signup",
    googleLogin: "/auth/google",
    refresh: "/auth/refresh",
    verifyOtp: "/auth/verify-otp",
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
    me: "/me"
  } as const
};
