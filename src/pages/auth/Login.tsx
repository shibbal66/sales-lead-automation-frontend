import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/auth-layout";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { login } from "@/services/auth/authServices";
import { useAuthStore } from "@/store/auth/authStore";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import { signInWithGoogle } from "@/lib/googleAuth";
import { loginSchema } from "@/validators";
import type { AuthUser } from "@/core/types/user.types";

type LoginErrors = {
  email?: string;
  password?: string;
};

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<LoginErrors>({});
  const setCredentials = useAuthStore((state) => state.setCredentials);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0]
      });
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const response = await login({ email, password });
      if (!response.success || !response.data) {
        showApiErrorToast(response);
        return;
      }

      const apiUser = response.data.user;
      const user: AuthUser = {
        id: apiUser.id,
        email: apiUser.email,
        isVerified: apiUser.isVerified,
        createdAt: apiUser.createdAt
      };

      setCredentials({
        user,
        token: response.data.accessToken,
        refreshToken: response.data.refreshToken
      });

      showApiSuccessToast(response.message || "Login successful.");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle({
        setCredentials,
        navigate,
        onSuccessToast: showApiSuccessToast
      });
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Outbound that books meetings while you sleep."
      subheadline="Rapid AI writes, sends, and follows up — personalized for every lead."
    >
      <h2 className="font-display text-2xl font-bold">Welcome back</h2>
      <p className="mt-1 text-sm text-muted-foreground">Sign in to your Rapid AI workspace.</p>

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
              if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            required
          />
          {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
        </div>
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
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
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
