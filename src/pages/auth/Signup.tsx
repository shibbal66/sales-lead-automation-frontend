import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AuthLayout } from "@/components/auth/auth-layout";
import { useState } from "react";

export default function Signup() {
  const navigate = useNavigate();
  const [accept, setAccept] = useState(true);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/dashboard");
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
          <Label htmlFor="name">Full name</Label>
          <Input id="name" placeholder="Jane Doe" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">Work email</Label>
          <Input id="email" type="email" placeholder="you@company.com" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="pw">Password</Label>
            <Input id="pw" type="password" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cpw">Confirm</Label>
            <Input id="cpw" type="password" required />
          </div>
        </div>
        <label className="flex items-start gap-2 text-sm text-muted-foreground">
          <Checkbox checked={accept} onCheckedChange={(v) => setAccept(!!v)} className="mt-0.5" />
          <span>I agree to the <a className="text-brand-text hover:underline" href="#">Terms of Service</a> and <a className="text-brand-text hover:underline" href="#">Privacy Policy</a>.</span>
        </label>

        <Button type="submit" className="w-full" disabled={!accept}>Create Account</Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-brand-text hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  );
}
