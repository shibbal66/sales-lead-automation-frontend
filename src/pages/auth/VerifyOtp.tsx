import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { resendOtp, validateOtp, verifyOtp } from "@/services/auth/authServices";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import { resendOtpSchema, verifyOtpSchema, type VerifyOtpFormValues } from "@/validators";
import { useAuthStore } from "@/store/auth/authStore";
import { clearPendingVerification, getPendingVerification } from "@/utils/authStorage";
import { mapApiUserToAuthUser } from "@/lib/mapAuthUser";

type VerifyOtpLocationState = {
  email?: string;
};

export default function VerifyOtp() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const pending = getPendingVerification();
  const { email: routeEmail } = ((state as VerifyOtpLocationState) || {}) as VerifyOtpLocationState;
  const resolvedEmail = routeEmail || pending?.email;
  const setCredentials = useAuthStore((s) => s.setCredentials);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<VerifyOtpFormValues>({
    resolver: zodResolver(verifyOtpSchema),
    mode: "onChange",
    defaultValues: { email: resolvedEmail || "", otp: "" }
  });

  const otp = watch("otp");

  useEffect(() => {
    if (resolvedEmail) {
      setValue("email", resolvedEmail, { shouldValidate: true });
    }
  }, [resolvedEmail, setValue]);

  const onSubmit = async (data: VerifyOtpFormValues) => {
    setLoading(true);
    try {
      const validateResponse = await validateOtp({
        email: data.email,
        otp: data.otp,
        purpose: "email_verification"
      });

      if (!validateResponse.success || !validateResponse.data?.valid) {
        showApiErrorToast(validateResponse);
        return;
      }

      const response = await verifyOtp({
        email: data.email,
        otp: data.otp
      });

      const { data: responseData } = response;
      if (!response.success || !responseData?.accessToken || !responseData.refreshToken || !responseData.user?.id) {
        showApiErrorToast(response);
        return;
      }

      setCredentials({
        user: mapApiUserToAuthUser(responseData.user),
        token: responseData.accessToken,
        refreshToken: responseData.refreshToken
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
      return;
    }

    setResending(true);
    try {
      const response = await resendOtp({ email: parsed.data.email });
      if (!response.success) {
        showApiErrorToast(response);
        return;
      }
      setValue("otp", "");
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

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <Controller
          name="otp"
          control={control}
          render={({ field }) => (
            <div className="space-y-3">
              <Label htmlFor="otp">Verification code</Label>
              <InputOTP
                id="otp"
                maxLength={6}
                value={field.value}
                onChange={field.onChange}
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
              {errors.otp?.message ? (
                <p className="text-xs text-destructive">{errors.otp.message}</p>
              ) : null}
            </div>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading || !resolvedEmail || otp.length !== 6}>
          {loading ? "Verifying..." : "Verify & Continue"}
        </Button>
      </form>

      {!resolvedEmail ? (
        <p className="mt-6 text-sm text-destructive">
          {errors.email?.message || "Missing signup context. Please create your account again."}
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
