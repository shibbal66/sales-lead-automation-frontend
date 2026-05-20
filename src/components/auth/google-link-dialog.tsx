import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { startGoogleOAuthRedirect } from "@/lib/googleAuth";

type GoogleLinkDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  /** Called immediately before redirecting to Google OAuth (e.g. store return path). */
  onBeforeConnect?: () => void;
};

export function GoogleLinkDialog({
  open,
  onOpenChange,
  title = "Connect your Google account",
  description = "Link Gmail to send campaign emails. You will be redirected to Google to authorize access, then returned here to activate your campaign.",
  onBeforeConnect
}: GoogleLinkDialogProps) {
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (!open) setConnecting(false);
  }, [open]);

  const handleConnect = () => {
    setConnecting(true);
    onBeforeConnect?.();
    onOpenChange(false);
    startGoogleOAuthRedirect();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <GoogleAuthButton loading={connecting} onClick={handleConnect} label="Continue with Google" />
      </DialogContent>
    </Dialog>
  );
}
