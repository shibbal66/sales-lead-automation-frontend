import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type DangerZoneSectionProps = {
  accountDeleting: boolean;
  onLogoutAllDevices: () => Promise<void>;
  onDeleteAccount: () => Promise<boolean>;
};

export function DangerZoneSection({
  accountDeleting,
  onLogoutAllDevices,
  onDeleteAccount
}: DangerZoneSectionProps) {
  const navigate = useNavigate();
  const [logoutAllLoading, setLogoutAllLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  return (
    <>
      <Card className="border-destructive/40 p-6 shadow-card">
        <h3 className="font-display text-lg font-bold text-destructive">Danger Zone</h3>
        <p className="mt-1 text-sm text-muted-foreground">Irreversible actions. Proceed with caution.</p>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-warning/30 bg-warning/5 p-4">
          <div>
            <p className="font-semibold">Logout from all devices</p>
            <p className="text-sm text-muted-foreground">Sign out all active sessions across devices.</p>
          </div>
          <Button
            variant="outline"
            disabled={logoutAllLoading}
            onClick={async () => {
              setLogoutAllLoading(true);
              try {
                await onLogoutAllDevices();
                navigate("/login", { replace: true });
              } finally {
                setLogoutAllLoading(false);
              }
            }}
          >
            {logoutAllLoading ? "Logging out..." : "Logout All Devices"}
          </Button>
        </div>
        <div className="mt-4 flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-4">
          <div>
            <p className="font-semibold">Delete Account</p>
            <p className="text-sm text-muted-foreground">Permanently delete your workspace and all data.</p>
          </div>
          <Button
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
            onClick={() => setDeleteOpen(true)}
          >
            Delete Account
          </Button>
        </div>
      </Card>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (accountDeleting) return;
          setDeleteOpen(open);
          if (!open) setConfirmText("");
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Delete account?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            This will permanently delete your workspace, leads, campaigns, and history. Type{" "}
            <span className="font-mono font-bold text-destructive">RAPIDAI</span> to confirm.
          </p>
          <Input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="Type RAPIDAI" />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={accountDeleting}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={confirmText !== "RAPIDAI" || accountDeleting}
              onClick={async () => {
                const ok = await onDeleteAccount();
                if (ok) {
                  setDeleteOpen(false);
                  setConfirmText("");
                  navigate("/login", { replace: true });
                }
              }}
            >
              {accountDeleting ? "Deleting..." : "Delete forever"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
