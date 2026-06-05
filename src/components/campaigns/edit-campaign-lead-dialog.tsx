import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { datetimeLocalValueToIsoUtc, isoToDatetimeLocalValue } from "@/lib/dateFormatting";
import { showApiErrorToast } from "@/lib/apiToast";
import {
  CAMPAIGN_LEAD_STATUSES,
  CAMPAIGN_LEAD_STATUS_OPTIONS,
  type CampaignLeadApiModel,
  type CampaignLeadStatus,
  type UpdateCampaignLeadRequest
} from "@/types";

function normalizeCampaignLeadStatus(value: string): CampaignLeadStatus {
  return (CAMPAIGN_LEAD_STATUSES as readonly string[]).includes(value)
    ? (value as CampaignLeadStatus)
    : "pending";
}

type EditCampaignLeadDialogProps = {
  open: boolean;
  lead: CampaignLeadApiModel | null;
  isSubmitting: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (payload: UpdateCampaignLeadRequest) => void;
};

export function EditCampaignLeadDialog({
  open,
  lead,
  isSubmitting,
  onOpenChange,
  onSave
}: EditCampaignLeadDialogProps) {
  const [status, setStatus] = useState<CampaignLeadStatus>(() => normalizeCampaignLeadStatus(lead?.status ?? "pending"));
  const [sentAtLocal, setSentAtLocal] = useState(() => isoToDatetimeLocalValue(lead?.sent_at ?? null));
  const [mailTemplate, setMailTemplate] = useState(() => lead?.mail_template ?? "");

  useEffect(() => {
    if (!lead) return;
    setStatus(normalizeCampaignLeadStatus(lead.status));
    setSentAtLocal(isoToDatetimeLocalValue(lead.sent_at));
    setMailTemplate(lead.mail_template ?? "");
  }, [lead]);

  const handleSubmit = () => {
    const trimmedTemplate = mailTemplate.trim();
    if (!trimmedTemplate) {
      showApiErrorToast("Mail template is required.");
      return;
    }
    const sentAtIso = status === "sent" ? datetimeLocalValueToIsoUtc(sentAtLocal) : null;
    onSave({
      status,
      sent_at: sentAtIso,
      mail_template: trimmedTemplate
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto scrollbar-thin sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit campaign lead</DialogTitle>
          {lead ? (
            <p className="text-sm text-muted-foreground">
              {lead.lead_email?.trim() || `Lead ID: ${lead.lead_data_id}`}
              {lead.lead_name?.trim() ? ` · ${lead.lead_name.trim()}` : ""}
            </p>
          ) : null}
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="campaign-lead-status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as CampaignLeadStatus)}>
              <SelectTrigger id="campaign-lead-status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {CAMPAIGN_LEAD_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {status === "sent" ? (
            <div className="space-y-1.5">
              <Label htmlFor="campaign-lead-sent-at">Sent at</Label>
              <DateTimePicker
                id="campaign-lead-sent-at"
                value={sentAtLocal}
                onChange={setSentAtLocal}
                placeholder="Pick date and time"
                disabled={isSubmitting}
              />
              <p className="text-xs text-muted-foreground">Leave empty to clear sent time (sends null).</p>
            </div>
          ) : null}
          <div className="space-y-1.5">
            <Label htmlFor="campaign-lead-mail-template">Mail template</Label>
            <Textarea
              id="campaign-lead-mail-template"
              rows={8}
              value={mailTemplate}
              onChange={(e) => setMailTemplate(e.target.value)}
              className="bg-muted/30"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !lead}>
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
