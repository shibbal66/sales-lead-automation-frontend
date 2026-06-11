import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { validateOtp } from "@/services/auth/authServices";
import { showApiErrorToast } from "@/lib/apiToast";
import { resetPasswordOtpSchema, type ResetPasswordOtpFormValues } from "@/validators";
import { getPendingPasswordReset, setPendingPasswordReset } from "@/utils/authStorage";

type ResetPasswordOtpLocationState = {
  email?: string;
};

export default function ResetPasswordOtp() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const pending = getPendingPasswordReset();
  const { email: routeEmail } = ((state as ResetPasswordOtpLocationState) || {}) as ResetPasswordOtpLocationState;
  const resolvedEmail = routeEmail || pending?.email;
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm<ResetPasswordOtpFormValues>({
    resolver: zodResolver(resetPasswordOtpSchema),
    mode: "onChange",
    defaultValues: { email: resolvedEmail || "", otp: "" }
  });

  const otp = watch("otp");

  useEffect(() => {
    if (resolvedEmail) {
      setValue("email", resolvedEmail, { shouldValidate: true });
    }
  }, [resolvedEmail, setValue]);

  const onSubmit = async (data: ResetPasswordOtpFormValues) => {
    setLoading(true);
    try {
      const response = await validateOtp({
        email: data.email,
        otp: data.otp,
        purpose: "password_reset"
      });

      if (!response.success || !response.data?.valid) {
        showApiErrorToast(response);
        return;
      }

      setPendingPasswordReset({ email: data.email, otp: data.otp });
      navigate("/reset-password", {
        replace: true,
        state: { email: data.email, otp: data.otp }
      });
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Enter your reset code."
      subheadline="We'll verify the 6-digit code from your email before you choose a new password."
    >
      <h2 className="font-display text-2xl font-bold">Verify reset code</h2>
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
              <Label htmlFor="otp">Reset code</Label>
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
          {loading ? "Verifying..." : "Continue"}
        </Button>
      </form>

      {!resolvedEmail ? (
        <p className="mt-6 text-sm text-destructive">
          {errors.email?.message || "Missing reset context. Please request a new code."}
        </p>
      ) : null}

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Didn&apos;t get a code?{" "}
        <Link to="/forgot-password" className="font-semibold text-brand-text hover:underline">
          Request a new code
        </Link>
      </p>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        <Link to="/login" className="font-semibold text-brand-text hover:underline">
          ← Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
