import { Button } from "@/components/ui/button";
import { startGoogleOAuthRedirect } from "@/lib/googleAuth";

type GoogleAuthButtonProps = {
  loading?: boolean;
  /** Defaults to GET /auth/google browser redirect. */
  onClick?: () => void;
  className?: string;
  label?: string;
};

export function GoogleAuthButton({
  loading = false,
  onClick,
  className,
  label = "Continue with Google"
}: GoogleAuthButtonProps) {
  const handleClick = onClick ?? (() => startGoogleOAuthRedirect());
  return (
    <Button
      type="button"
      variant="outline"
      className={className ?? "w-full"}
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        "Redirecting…"
      ) : (
        <>
          <img src="/google.png" alt="" width={20} height={20} aria-hidden />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}
