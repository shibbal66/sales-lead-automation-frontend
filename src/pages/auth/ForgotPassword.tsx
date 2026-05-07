import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/components/auth/auth-layout";
import { useState } from "react";
import { CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  return (
    <AuthLayout
      headline="Reset your password in one click."
      subheadline="We'll email you a secure link to set a new password."
    >
      {sent ? (
        <div className="rounded-xl border border-success/30 bg-success/10 p-6 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-success" />
          <h2 className="mt-4 font-display text-xl font-bold">Check your inbox</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            We've sent a password reset link to your email.
          </p>
          <Link to="/login" className="mt-6 inline-block text-sm font-semibold text-brand-text hover:underline">
            ← Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <h2 className="font-display text-2xl font-bold">Forgot password</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enter your email and we'll send you a reset link.</p>

          <form
            onSubmit={(e) => { e.preventDefault(); setSent(true); }}
            className="mt-8 space-y-4"
          >
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@company.com" required />
            </div>
            <Button type="submit" className="w-full">Send Reset Link</Button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Remember your password?{" "}
            <Link to="/login" className="font-semibold text-brand-text hover:underline">Sign in</Link>
          </p>
        </>
      )}
    </AuthLayout>
  );
}
