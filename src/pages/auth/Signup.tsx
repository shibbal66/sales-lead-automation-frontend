import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthLayout } from "@/components/auth/auth-layout";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { signup } from "@/services/auth/authServices";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import { signInWithGoogle } from "@/lib/googleAuth";
import { useAuthStore } from "@/store/auth/authStore";
import { setPendingVerification } from "@/utils/authSorage";
import { signupSchema } from "@/validators";

type SignupErrors = {
  email?: string;
  password?: string;
  confirmPassword?: string;
};

export default function Signup() {
  const navigate = useNavigate();
  const [accept, setAccept] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [errors, setErrors] = useState<SignupErrors>({});
  const setCredentials = useAuthStore((state) => state.setCredentials);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ email, password, confirmPassword });
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        email: fieldErrors.email?.[0],
        password: fieldErrors.password?.[0],
        confirmPassword: fieldErrors.confirmPassword?.[0]
      });
      return;
    }
    setErrors({});

    setLoading(true);
    try {
      const response = await signup({
        email: parsed.data.email,
        password: parsed.data.password
      });

      if (!response.success || !response.data?.userId) {
        showApiErrorToast(response);
        return;
      }

      showApiSuccessToast(response.message || "Account created.");
      setPendingVerification({ userId: response.data.userId, email: parsed.data.email });
      navigate("/verify-otp", {
        replace: true,
        state: { userId: response.data.userId, email: parsed.data.email }
      });
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
      headline="Start booking meetings on autopilot."
      subheadline="Free to try. Connect Gmail, import leads, and launch your first campaign in minutes."
    >
      <h2 className="font-display text-2xl font-bold">Create your account</h2>
      <p className="mt-1 text-sm text-muted-foreground">Join 4,000+ revenue teams using Rapid AI.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
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
          <Label htmlFor="pw">Password</Label>
          <div className="relative">
            <Input
              id="pw"
              type={showPassword ? "text" : "password"}
              value={password}
              placeholder="Enter your password"
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
        <div className="space-y-1.5">
          <Label htmlFor="cpw">Confirm password</Label>
          <div className="relative">
            <Input
              id="cpw"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              placeholder="Confirm your password"
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
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
          {errors.confirmPassword ? <p className="text-xs text-destructive">{errors.confirmPassword}</p> : null}
        </div>
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <Checkbox checked={accept} onCheckedChange={(v) => setAccept(!!v)} className="mt-0.5" />
          <span>I agree to the <a className="text-brand-text hover:underline" href="#">Terms of Service</a> and <a className="text-brand-text hover:underline" href="#">Privacy Policy</a>.</span>
        </label>

        <Button type="submit" className="w-full" disabled={!accept || loading}>
          {loading ? "Creating..." : "Create Account"}
        </Button>

        <GoogleAuthButton loading={googleLoading} onClick={onGoogleSignIn} />
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-text hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
