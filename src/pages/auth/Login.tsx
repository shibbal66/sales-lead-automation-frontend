import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/auth-layout";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { AxiosError } from "axios";
import { login } from "@/services/auth/authServices";
import { useAuthStore } from "@/store/auth/authStore";
import { getApiErrorMessage, showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import { startGoogleOAuthRedirect } from "@/lib/googleAuth";
import { loginSchema, type LoginFormValues } from "@/validators";
import { mapApiUserToAuthUser } from "@/lib/mapAuthUser";
import { consumePendingAuthError, setPendingVerification } from "@/utils/authSorage";
import { AUTH_ERROR_CODE } from "@/types/auth";

function isEmailNotVerifiedPayload(payload: unknown): boolean {
  return (
    payload !== null &&
    typeof payload === "object" &&
    (payload as { code?: string }).code === AUTH_ERROR_CODE.EMAIL_NOT_VERIFIED
  );
}

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const setCredentials = useAuthStore((state) => state.setCredentials);

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    defaultValues: { email: "", password: "" }
  });

  useEffect(() => {
    const pendingMessage = consumePendingAuthError();
    if (pendingMessage) {
      showApiErrorToast(pendingMessage);
    }
  }, []);

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const response = await login({
        email: data.email,
        password: data.password
      });

      if (!response.success || !response.data) {
        if (response.code === AUTH_ERROR_CODE.EMAIL_NOT_VERIFIED) {
          setPendingVerification({ email: data.email });
          showApiSuccessToast(
            response.message || "Email not verified. A new verification code has been sent to your email."
          );
          navigate("/verify-otp", {
            replace: true,
            state: { email: data.email }
          });
          return;
        }
        showApiErrorToast(response);
        return;
      }

      setCredentials({
        user: mapApiUserToAuthUser(response.data.user),
        token: response.data.accessToken,
        refreshToken: response.data.refreshToken
      });

      showApiSuccessToast(response.message || "Login successful.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const errorBody = error instanceof AxiosError ? error.response?.data : error;
      if (isEmailNotVerifiedPayload(errorBody)) {
        setPendingVerification({ email: data.email });
        showApiSuccessToast(
          getApiErrorMessage(errorBody) ||
            "Email not verified. A new verification code has been sent to your email."
        );
        navigate("/verify-otp", {
          replace: true,
          state: { email: data.email }
        });
        return;
      }
      showApiErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = () => {
    setGoogleLoading(true);
    startGoogleOAuthRedirect();
  };

  return (
    <AuthLayout
      headline="Outbound that books meetings while you sleep."
      subheadline="Rapid AI writes, sends, and follows up — personalized for every lead."
    >
      <h2 className="font-display text-2xl font-bold">Welcome back</h2>
      <p className="mt-1 text-sm text-muted-foreground">Sign in to your Rapid AI workspace.</p>

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 space-y-4"
      >
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

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs font-medium text-brand-text hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pr-10"
                  aria-invalid={!!errors.password}
                  {...field}
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
              {errors.password?.message ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : null}
            </div>
          )}
        />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </Button>

        <GoogleAuthButton loading={googleLoading} onClick={onGoogleSignIn} />
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account?{" "}
        <Link to="/signup" className="font-semibold text-brand-text hover:underline">Sign up</Link>
      </p>
    </AuthLayout>
  );
}
