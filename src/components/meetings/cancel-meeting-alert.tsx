import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog";
import type { Meeting } from "@/types/meeting";

type CancelMeetingAlertProps = {
  meeting: Meeting | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  isLoading?: boolean;
};

export function CancelMeetingAlert({
  meeting,
  open,
  onOpenChange,
  onConfirm,
  isLoading
}: CancelMeetingAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel this meeting?</AlertDialogTitle>
          <AlertDialogDescription>
            {meeting
              ? `"${meeting.leadName}" will be marked as cancelled.`
              : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Keep meeting</AlertDialogCancel>
          <Button
            variant="destructive"
            disabled={isLoading}
            onClick={() => void onConfirm()}
          >
            {isLoading ? "Cancelling…" : "Cancel meeting"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
