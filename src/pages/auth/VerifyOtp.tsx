import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { resendOtp, verifyOtp } from "@/services/auth/authServices";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import { resendOtpSchema, verifyOtpSchema } from "@/validators";
import { useAuthStore } from "@/store/auth/authStore";
import { clearPendingVerification, getPendingVerification } from "@/utils/authSorage";
import { mapApiUserToAuthUser } from "@/lib/mapAuthUser";

type VerifyOtpLocationState = {
  email?: string;
};

type VerifyOtpErrors = {
  email?: string;
  otp?: string;
};

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const pending = getPendingVerification();
  const { email: routeEmail } = ((state as VerifyOtpLocationState) || {}) as VerifyOtpLocationState;
  const resolvedEmail = routeEmail || pending?.email;
  const setCredentials = useAuthStore((s) => s.setCredentials);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [errors, setErrors] = useState<VerifyOtpErrors>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = verifyOtpSchema.safeParse({ email: resolvedEmail, otp });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        otp: fieldErrors.otp?.[0]
      });
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const response = await verifyOtp({
        email: parsed.data.email,
        otp: parsed.data.otp
      });

      const { data } = response;
      if (!response.success || !data?.accessToken || !data.refreshToken || !data.user?.id) {
        showApiErrorToast(response);
        return;
      }

      setCredentials({
        user: mapApiUserToAuthUser(data.user),
        token: data.accessToken,
        refreshToken: data.refreshToken
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
    const parsed = resendOtpSchema.safeParse({ email: resolvedEmail });
    if (!parsed.success) {
      const emailError = parsed.error.flatten().fieldErrors.email?.[0];
      setErrors((prev) => ({
        ...prev,
        email: emailError || "Missing signup context. Please create your account again."
      }));
      return;
    }
    setErrors((prev) => ({ ...prev, email: undefined }));

    setResending(true);
    try {
      const response = await resendOtp({ email: parsed.data.email });
      if (!response.success) {
        showApiErrorToast(response);
        return;
      }
      setOtp("");
      showApiSuccessToast(
        response.message || "A new verification code has been sent to your email."
      );
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthLayout
      headline="Verify your email to continue."
      subheadline="Enter the 6-digit code we sent to your inbox."
    >
      <h2 className="font-display text-2xl font-bold">Verify your email</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {resolvedEmail
          ? `Enter the 6-digit code sent to ${resolvedEmail}`
          : "Enter the 6-digit code from your email."}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-6">
        <div className="space-y-3">
          <Label htmlFor="otp">Verification code</Label>
          <InputOTP
            id="otp"
            maxLength={6}
            value={otp}
            onChange={(value) => {
              setOtp(value);
              if (errors.otp) setErrors((prev) => ({ ...prev, otp: undefined }));
            }}
          >
            <InputOTPGroup className="w-full justify-between">
              <InputOTPSlot index={0} className="h-12 w-11 text-lg" />
              <InputOTPSlot index={1} className="h-12 w-11 text-lg" />
              <InputOTPSlot index={2} className="h-12 w-11 text-lg" />
              <InputOTPSlot index={3} className="h-12 w-11 text-lg" />
              <InputOTPSlot index={4} className="h-12 w-11 text-lg" />
              <InputOTPSlot index={5} className="h-12 w-11 text-lg" />
            </InputOTPGroup>
          </InputOTP>
          {errors.otp ? <p className="text-xs text-destructive">{errors.otp}</p> : null}
        </div>

        <Button type="submit" className="w-full" disabled={loading || !resolvedEmail || otp.length !== 6}>
          {loading ? "Verifying..." : "Verify & Continue"}
        </Button>
      </form>

      {!resolvedEmail ? (
        <p className="mt-6 text-sm text-destructive">
          {errors.email || "Missing signup context. Please create your account again."}
        </p>
      ) : null}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Didn&apos;t get a code?{" "}
        <button
          type="button"
          onClick={onResendCode}
          className="font-semibold text-brand-text hover:underline disabled:cursor-not-allowed disabled:opacity-60"
          disabled={resending || !resolvedEmail}
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
