import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type NotificationsSectionProps = {
  enabled: boolean;
  disabled: boolean;
  onToggle: (checked: boolean) => void;
};

export function NotificationsSection({ enabled, disabled, onToggle }: NotificationsSectionProps) {
  return (
    <Card className="p-6 shadow-card">
      <h3 className="font-display text-lg font-bold">Notification preferences</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Control whether you receive in-app and email notifications for replies, meetings, campaigns, and
        system updates.
      </p>
      <div className="mt-6 flex items-center justify-between gap-4 rounded-lg border border-border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="notifications-enabled" className="text-base font-semibold">
            Enable notifications
          </Label>
          <p className="text-sm text-muted-foreground">
            When off, you will not receive new notification alerts until you turn this back on.
          </p>
        </div>
        <Switch
          id="notifications-enabled"
          checked={enabled}
          disabled={disabled}
          onCheckedChange={onToggle}
        />
      </div>
    </Card>
  );
}
