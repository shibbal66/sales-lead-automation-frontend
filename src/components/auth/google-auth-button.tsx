import { Button } from "@/components/ui/button";

type GoogleAuthButtonProps = {
  loading: boolean;
  onClick: () => void;
  className?: string;
};

export function GoogleAuthButton({ loading, onClick, className }: GoogleAuthButtonProps) {
  return (
    <Button type="button" variant="outline" className={className ?? "w-full"} onClick={onClick} disabled={loading}>
      {loading ? "Connecting..." :  (
        <>
          <img src="/google.png" alt="Google" width={20} height={20} /> <span>Continue with Google</span>
        </>
      )}
    </Button>
  );
}
