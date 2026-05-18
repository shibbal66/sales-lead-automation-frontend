import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { resetPassword } from "@/services/auth/authServices";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import { resetPasswordSchema } from "@/validators";
import { useAuthStore } from "@/store/auth/authStore";
import { clearPendingPasswordReset, getPendingPasswordReset } from "@/utils/authSorage";
import { mapApiUserToAuthUser } from "@/lib/mapAuthUser";

type ResetPasswordLocationState = {
  email?: string;
};

type ResetPasswordErrors = {
  email?: string;
  otp?: string;
  password?: string;
  confirmPassword?: string;
};

export default function ResetPassword() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const pending = getPendingPasswordReset();
  const { email: routeEmail } = ((state as ResetPasswordLocationState) || {}) as ResetPasswordLocationState;
  const resolvedEmail = routeEmail || pending?.email;

  const setCredentials = useAuthStore((s) => s.setCredentials);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ResetPasswordErrors>({});

  const clearFieldError = (field: keyof ResetPasswordErrors) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = resetPasswordSchema.safeParse({
      email: resolvedEmail,
      otp,
      password,
      confirmPassword
    });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        otp: fieldErrors.otp?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0]
      });
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const response = await resetPassword({
        email: parsed.data.email,
        otp: parsed.data.otp,
        password: parsed.data.password
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
      clearPendingPasswordReset();

      showApiSuccessToast(response.message || "Password reset successful.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Choose a new password."
      subheadline="Enter the 6-digit code from your email and set a new password."
    >
      <h2 className="font-display text-2xl font-bold">Reset password</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {resolvedEmail
          ? `Code sent to ${resolvedEmail}`
          : "Enter the code from your email and your new password."}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div className="space-y-3">
          <Label htmlFor="otp">Reset code</Label>
          <InputOTP
            id="otp"
            maxLength={6}
            value={otp}
            onChange={(value) => {
              setOtp(value);
              clearFieldError("otp");
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

        <div className="space-y-1.5">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearFieldError("password");
              }}
              className="pr-10"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password ? <p className="text-xs text-destructive">{errors.password}</p> : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirmPassword">Confirm new password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearFieldError("confirmPassword");
              }}
              className="pr-10"
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword ? (
            <p className="text-xs text-destructive">{errors.confirmPassword}</p>
          ) : null}
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={loading || !resolvedEmail || otp.length !== 6}
        >
          {loading ? "Resetting..." : "Reset password"}
        </Button>
      </form>

      {!resolvedEmail ? (
        <p className="mt-6 text-sm text-destructive">
          {errors.email || "Missing reset context. Please request a new code."}
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
