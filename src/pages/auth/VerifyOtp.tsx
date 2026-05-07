import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resendOtp, verifyOtp } from "@/services/auth/authServices";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import { verifyOtpSchema } from "@/validators";
import { useAuthStore } from "@/store/auth/authStore";
import { clearPendingVerification, getPendingVerification } from "@/utils/authSorage";
import type { AuthUser } from "@/core/types/user.types";

type VerifyOtpLocationState = {
  userId?: string;
  email?: string;
};

type VerifyOtpErrors = {
  userId?: string;
  otp?: string;
};

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const pending = getPendingVerification();
  const { userId, email } = ((state as VerifyOtpLocationState) || {}) as VerifyOtpLocationState;
  const resolvedUserId = userId || pending?.userId;
  const resolvedEmail = email || pending?.email;
  const setCredentials = useAuthStore((s) => s.setCredentials);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errors, setErrors] = useState<VerifyOtpErrors>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = verifyOtpSchema.safeParse({ userId: resolvedUserId, otp });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        userId: fieldErrors.userId?.[0],
        otp: fieldErrors.otp?.[0]
      });
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const response = await verifyOtp({ userId: parsed.data.userId, otp: parsed.data.otp });
      if (!response.success || !response.data?.accessToken || !response.data?.refreshToken) {
        showApiErrorToast(response);
        return;
      }

      const user: AuthUser = {
        id: parsed.data.userId,
        email: resolvedEmail || "unknown@example.com",
        isVerified: true
      };

      setCredentials({
        user,
        token: response.data.accessToken,
        refreshToken: response.data.refreshToken
      });
      clearPendingVerification();

      showApiSuccessToast(response.message || "Email verified successfully.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  const onResendCode = async () => {
    if (!resolvedUserId) {
      setErrors((prev) => ({ ...prev, userId: "Missing signup context. Please create your account again." }));
      return;
    }
    setResending(true);
    try {
      const response = await resendOtp({ userId: resolvedUserId });
      if (!response.success) {
        showApiErrorToast(response);
        return;
      }
      showApiSuccessToast(response.message || "A new verification code has been sent to your email.");
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      headline="Verify your email to continue."
      subheadline="Enter the 6-digit code sent to your inbox."
    >
      <h2 className="font-display text-2xl font-bold">Verify OTP</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {resolvedEmail ? `Code sent to ${resolvedEmail}` : "Enter the code from your email."}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="otp">6-digit OTP</Label>
          <Input
            id="otp"
            inputMode="numeric"
            maxLength={6}
            placeholder="Enter your OTP"
            value={otp}
            onChange={(e) => {
              setOtp(e.target.value.replace(/\D/g, ""));
              if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }));
            }}
            required
          />
          {errors.otp ? <p className="text-xs text-destructive">{errors.otp}</p> : null}
        </div>

        <Button type="submit" className="w-full" disabled={loading || !resolvedUserId}>
          {loading ? "Verifying..." : "Verify & Continue"}
        </Button>
      </form>

      {!resolvedUserId ? (
        <p className="mt-6 text-sm text-destructive">
          {errors.userId || "Missing signup context. Please create your account again."}
        </p>
      ) : null}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Didn't get code?{" "}
        <button
          type="button"
          onClick={onResendCode}
          className="font-semibold text-brand-text hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          disabled={resending || !resolvedUserId}
        >
          {resending ? "Resending..." : "Resend code"}
        </button>
      </p>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Need to change email?{" "}
        <Link to="/signup" className="font-semibold text-brand-text hover:underline">
          Go back to signup
        </Link>
      </p>
    </AuthLayout>
  );
}
