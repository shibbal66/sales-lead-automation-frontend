import { PhoneNumberField } from "@/components/shared/phone-number-field";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { CampaignDetailFormErrors } from "@/lib/campaignPresentation";
import { Mail, Phone, User } from "lucide-react";

type CampaignSenderDetailsCardProps = {
  senderDisplayName: string;
  senderAddress: string;
  senderPhone: string;
  errors: CampaignDetailFormErrors;
  onSenderDisplayNameChange: (value: string) => void;
  onSenderAddressChange: (value: string) => void;
  onSenderPhoneChange: (value: string) => void;
};

function senderPlaceholder(value: string) {
  return value.trim() ? undefined : "Not set";
}

export function CampaignSenderDetailsCard({
  senderDisplayName,
  senderAddress,
  senderPhone,
  errors,
  onSenderDisplayNameChange,
  onSenderAddressChange,
  onSenderPhoneChange
}: CampaignSenderDetailsCardProps) {
  const senderIncomplete =
    !senderDisplayName.trim() || !senderAddress.trim() || !senderPhone.trim();
  const hasSenderErrors =
    Boolean(errors.senderDisplayName) || Boolean(errors.senderAddress) || Boolean(errors.senderPhone);

  return (
    <Card
      className={cn(
        "p-5 shadow-card",
        (senderIncomplete || hasSenderErrors) && "border-warning/40"
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="font-display text-base font-bold">Sender details</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Shown as the sender on outbound emails for this campaign.
          </p>
        </div>
        {senderIncomplete && !hasSenderErrors ? (
          <span className="shrink-0 self-start rounded-full bg-warning/15 px-2.5 py-1 text-[11px] font-semibold text-warning">
            Incomplete
          </span>
        ) : null}
      </div>

      <div className="mt-4 flex gap-4 flex-wrap ">
        <div className="space-y-1.5">
          <Label htmlFor="sender-display-name" className="flex items-center gap-1.5 text-xs">
            <User className="h-3.5 w-3.5" /> Display name
          </Label>
          <Input
            id="sender-display-name"
            value={senderDisplayName}
            placeholder={senderPlaceholder(senderDisplayName)}
            onChange={(event) => onSenderDisplayNameChange(event.target.value)}
          />
          {errors.senderDisplayName ? (
            <p className="text-xs text-destructive">{errors.senderDisplayName}</p>
          ) : null}
        </div>
       
        <div className="space-y-1.5">
          <PhoneNumberField
            id="sender-phone"
            label={
              <span className="flex items-center gap-1.5 text-xs">
                <Phone className="h-3.5 w-3.5" /> Phone
              </span>
            }
            value={senderPhone}
            localPlaceholder="555 000 0000"
            error={errors.senderPhone}
            onChange={onSenderPhoneChange}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="sender-address" className="flex items-center gap-1.5 text-xs">
            <Mail className="h-3.5 w-3.5" /> Sender address
          </Label>
          <Input
            id="sender-address"
            type="text"
            value={senderAddress}
            placeholder={senderPlaceholder(senderAddress)}
            onChange={(event) => onSenderAddressChange(event.target.value)}
          />
          {errors.senderAddress ? (
            <p className="text-xs text-destructive">{errors.senderAddress}</p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
