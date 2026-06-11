import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { resetPassword } from "@/services/auth/authServices";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import { resetPasswordSchema, type ResetPasswordFormValues } from "@/validators";
import { clearPendingPasswordReset, getPendingPasswordReset } from "@/utils/authStorage";

type ResetPasswordLocationState = {
  email?: string;
  otp?: string;
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const pending = getPendingPasswordReset();
  const { email: routeEmail, otp: routeOtp } = ((state as ResetPasswordLocationState) ||
    {}) as ResetPasswordLocationState;
  const resolvedEmail = routeEmail || pending?.email;
  const resolvedOtp = routeOtp || pending?.otp;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: { errors }
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
    defaultValues: {
      email: resolvedEmail || "",
      password: "",
      confirmPassword: ""
    }
  });

  useEffect(() => {
    if (!resolvedEmail || !resolvedOtp) {
      navigate("/reset-password-otp", {
        replace: true,
        state: resolvedEmail ? { email: resolvedEmail } : undefined
      });
      return;
    }

    setValue("email", resolvedEmail, { shouldValidate: true });
  }, [resolvedEmail, resolvedOtp, navigate, setValue]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!resolvedOtp) {
      navigate("/reset-password-otp", {
        replace: true,
        state: { email: data.email }
      });
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword({
        email: data.email,
        otp: resolvedOtp,
        password: data.password
      });

      if (!response.success) {
        showApiErrorToast(response);
        return;
      }

      clearPendingPasswordReset();
      showApiSuccessToast(
        response.message || "Password reset successful. Sign in with your new password."
      );
      navigate("/login", { replace: true });
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  if (!resolvedEmail || !resolvedOtp) {
    return null;
  }

  return (
    <AuthLayout
      headline="Choose a new password."
      subheadline="Your reset code is verified. Set a strong password for your account."
    >
      <h2 className="font-display text-2xl font-bold">Reset password</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Choose a new password for {resolvedEmail}
      </p>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your new password"
                  className="pr-10"
                  aria-invalid={!!errors.password}
                  {...field}
                  onChange={(e) => {
                    field.onChange(e);
                    void trigger("confirmPassword");
                  }}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              {errors.password?.message ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : null}
            </div>
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your new password"
                  className="pr-10"
                  aria-invalid={!!errors.confirmPassword}
                  {...field}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword?.message ? (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              ) : null}
            </div>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Resetting..." : "Reset password"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Need a new code?{" "}
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
