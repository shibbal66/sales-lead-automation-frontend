import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/auth-layout";
import { useState } from "react";
import { forgotPassword } from "@/services/auth/authServices";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import { forgotPasswordSchema } from "@/validators";
import { setPendingPasswordReset } from "@/utils/authSorage";

type ForgotPasswordErrors = {
  email?: string;
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ForgotPasswordErrors>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = forgotPasswordSchema.safeParse({ email });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({ email: fieldErrors.email?.[0] });
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const response = await forgotPassword({ email: parsed.data.email });
      if (!response.success) {
        showApiErrorToast(response);
        return;
      }

      showApiSuccessToast(
        response.message ||
          "If an account with this email exists and has a password, a reset code has been sent."
      );
      setPendingPasswordReset({ email: parsed.data.email });
      navigate("/reset-password", {
        replace: true,
        state: { email: parsed.data.email }
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

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({});
            }}
            required
          />
          {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
        </div>

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
