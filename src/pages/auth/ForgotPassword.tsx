import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/auth-layout";
import { useState } from "react";
import { forgotPassword } from "@/services/auth/authServices";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import { forgotPasswordSchema, type ForgotPasswordFormValues } from "@/validators";
import { setPendingPasswordReset } from "@/utils/authStorage";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onChange",
    defaultValues: { email: "" }
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setLoading(true);
    try {
      const response = await forgotPassword({ email: data.email });
      if (!response.success) {
        showApiErrorToast(response);
        return;
      }

      showApiSuccessToast(
        response.message ||
          "If an account with this email exists and has a password, a reset code has been sent."
      );
      setPendingPasswordReset({ email: data.email });
      navigate("/reset-password-otp", {
        replace: true,
        state: { email: data.email }
      });
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Reset your password securely."
      subheadline="We'll email you a 6-digit code to choose a new password."
    >
      <h2 className="font-display text-2xl font-bold">Forgot password</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter your email and we&apos;ll send you a reset code.
      </p>

      <form noValidate onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.com"
                aria-invalid={!!errors.email}
                {...field}
              />
              {errors.email?.message ? (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              ) : null}
            </div>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Sending..." : "Send reset code"}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Remember your password?{" "}
        <Link to="/login" className="font-semibold text-brand-text hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
