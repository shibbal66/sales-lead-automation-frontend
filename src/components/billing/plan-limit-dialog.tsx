import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getPlanLimitDialogTitle } from "@/lib/planLimit";
import { usePlanLimitStore } from "@/store/planLimit/planLimitStore";

export function PlanLimitDialog() {
  const navigate = useNavigate();
  const open = usePlanLimitStore((state) => state.open);
  const message = usePlanLimitStore((state) => state.message);
  const code = usePlanLimitStore((state) => state.code);
  const closeDialog = usePlanLimitStore((state) => state.closeDialog);

  const handleUpgrade = () => {
    closeDialog();
    navigate("/settings?tab=billing");
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) closeDialog();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{getPlanLimitDialogTitle(code)}</AlertDialogTitle>
          <AlertDialogDescription>{message}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <Button onClick={handleUpgrade}>View plans</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
