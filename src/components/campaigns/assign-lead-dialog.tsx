import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type AssignLeadDialogProps = {
  open: boolean;
  leadDataId: string;
  mailTemplate: string;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onLeadDataIdChange: (value: string) => void;
  onMailTemplateChange: (value: string) => void;
  onSubmit: () => void;
};

export function AssignLeadDialog({
  open,
  leadDataId,
  mailTemplate,
  isSubmitting,
  onOpenChange,
  onLeadDataIdChange,
  onMailTemplateChange,
  onSubmit
}: AssignLeadDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader><DialogTitle>Assign lead to campaign</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="lead-data-id">Lead ID</Label>
            <Input
              id="lead-data-id"
              value={leadDataId}
              onChange={(event) => onLeadDataIdChange(event.target.value)}
              placeholder="lead_abc123"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="campaign-mail-template">Campaign mail template</Label>
            <Textarea
              id="campaign-mail-template"
              rows={8}
              value={mailTemplate}
              onChange={(event) => onMailTemplateChange(event.target.value)}
              className="bg-muted/30"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Assigning..." : "Assign Lead"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
