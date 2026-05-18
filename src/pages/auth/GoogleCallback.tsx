import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AuthLayout } from "@/components/auth/auth-layout";
import { completeGoogleOAuthFromCallback } from "@/lib/googleAuth";
import { useAuthStore } from "@/store/auth/authStore";
import { showApiSuccessToast } from "@/lib/apiToast";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setCredentials = useAuthStore((state) => state.setCredentials);

  useEffect(() => {
    void completeGoogleOAuthFromCallback(searchParams, {
      setCredentials,
      navigate,
      onSuccessToast: showApiSuccessToast
    });
  }, [navigate, searchParams, setCredentials]);

  return (
    <AuthLayout
      headline="Signing you in with Google"
      subheadline="Please wait while we complete authentication."
    >
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">Completing Google sign-in…</p>
      </div>
    </AuthLayout>
  );
}
