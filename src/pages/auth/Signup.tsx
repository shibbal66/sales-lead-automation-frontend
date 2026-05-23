import { Link, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { startGoogleOAuthRedirect } from "@/lib/googleAuth";
import { setPendingVerification } from "@/utils/authSorage";
import { PhoneNumberField } from "@/components/shared/phone-number-field";
import { signupSchema, type SignupFormValues } from "@/validators";
import type { SignupRequest } from "@/types/auth";

const signupDefaultValues: SignupFormValues = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  address: "",
  contact: ""
};

export default function Signup() {
  const navigate = useNavigate();
  const [accept, setAccept] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    control,
    handleSubmit,
    trigger,
    formState: { errors }
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: "onChange",
    defaultValues: signupDefaultValues
  });

  const onSubmit = async (data: SignupFormValues) => {
    const payload: SignupRequest = {
      email: data.email,
      password: data.password,
      name: data.name,
      address: data.address,
      contact: data.contact
    };

    setLoading(true);
    try {
      const response = await signup(payload);

      const verifiedEmail = response.data?.email ?? payload.email;
      if (!response.success || !verifiedEmail) {
        showApiErrorToast(response);
        return;
      }

      showApiSuccessToast(
        response.message || "Account created. Check your email for your 6-digit verification code."
      );
      setPendingVerification({ email: verifiedEmail });
      navigate("/verify-otp", {
        replace: true,
        state: { email: verifiedEmail }
      });
    } catch (error) {
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
      headline="Start booking meetings on autopilot."
      subheadline="Free to try. Connect Gmail, import leads, and launch your first campaign in minutes."
    >
      <h2 className="font-display text-2xl font-bold">Create your account</h2>
      <p className="mt-1 text-sm text-muted-foreground">Join 4,000+ revenue teams using Rapid AI.</p>

      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 space-y-4"
      >
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Doe"
                aria-invalid={!!errors.name}
                {...field}
              />
              {errors.name?.message ? (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              ) : null}
            </div>
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label htmlFor="email">Work email</Label>
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="contact"
            control={control}
            render={({ field }) => (
              <PhoneNumberField
                id="contact"
                label="Contact"
                value={field.value}
                onChange={field.onChange}
                error={errors.contact?.message}
              />
            )}
          />
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <div className="space-y-1.5">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  type="text"
                  placeholder="City, country"
                  aria-invalid={!!errors.address}
                  {...field}
                />
                {errors.address?.message ? (
                  <p className="text-xs text-destructive">{errors.address.message}</p>
                ) : null}
              </div>
            )}
          />
        </div>

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <div className="space-y-1.5">
              <Label htmlFor="pw">Password</Label>
              <div className="relative">
                <Input
                  id="pw"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              <Label htmlFor="cpw">Confirm password</Label>
              <div className="relative">
                <Input
                  id="cpw"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
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
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.confirmPassword?.message ? (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              ) : null}
            </div>
          )}
        />

        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <Checkbox checked={accept} onCheckedChange={(v) => setAccept(!!v)} className="mt-0.5" />
          <span>
            I agree to the{" "}
            <a className="text-brand-text hover:underline" href="#">
              Terms of Service
            </a>{" "}
            and{" "}
            <a className="text-brand-text hover:underline" href="#">
              Privacy Policy
            </a>
            .
          </span>
        </label>

        <Button type="submit" className="w-full" disabled={!accept || loading}>
          {loading ? "Creating..." : "Create Account"}
        </Button>

        <GoogleAuthButton loading={googleLoading} onClick={onGoogleSignIn} />
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-text hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
