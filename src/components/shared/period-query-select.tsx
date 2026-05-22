import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/datetime-picker";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  getPeriodQueryLabel,
  isCustomPeriodRangeValid,
  type PeriodQueryOption
} from "@/lib/periodQuery";
import type { DashboardPeriodQuery, PeriodQuery } from "@/lib/periodQuery";
import { cn } from "@/lib/utils";

export type PeriodQuerySelectProps<T extends PeriodQuery | DashboardPeriodQuery> = {
  options: readonly PeriodQueryOption[];
  period: T;
  customFrom: string;
  customTo: string;
  disabled?: boolean;
  idPrefix?: string;
  onPeriodChange: (period: T) => void;
  onCustomRangeApply: (from: string, to: string) => void;
};

export function PeriodQuerySelect<T extends PeriodQuery | DashboardPeriodQuery>({
  options,
  period,
  customFrom,
  customTo,
  disabled,
  idPrefix = "period",
  onPeriodChange,
  onCustomRangeApply
}: PeriodQuerySelectProps<T>) {
  const [customOpen, setCustomOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(customFrom);
  const [draftTo, setDraftTo] = useState(customTo);

  const fromId = `${idPrefix}-from`;
  const toId = `${idPrefix}-to`;

  const openCustomPicker = () => {
    setDraftFrom(customFrom);
    setDraftTo(customTo);
    setCustomOpen(true);
  };

  const applyCustomRange = () => {
    if (!isCustomPeriodRangeValid(draftFrom, draftTo)) return;
    onCustomRangeApply(draftFrom, draftTo);
    setCustomOpen(false);
  };

  const triggerLabel =
    period === "custom" && isCustomPeriodRangeValid(customFrom, customTo)
      ? `${customFrom} – ${customTo}`
      : getPeriodQueryLabel(period);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="default" size="sm" disabled={disabled} className="gap-1.5">
            {triggerLabel}
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className={cn(period === option.value && "bg-accent")}
              onClick={() => {
                if (option.value === "custom") {
                  openCustomPicker();
                  return;
                }
                onPeriodChange(option.value as T);
              }}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={customOpen} onOpenChange={setCustomOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Custom date range</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">Dates use YYYY-MM-DD format.</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={fromId}>From</Label>
              <DatePicker
                id={fromId}
                value={draftFrom}
                onChange={setDraftFrom}
                placeholder="YYYY-MM-DD"
                toDate={draftTo ? new Date(`${draftTo}T12:00:00`) : undefined}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={toId}>To</Label>
              <DatePicker
                id={toId}
                value={draftTo}
                onChange={setDraftTo}
                placeholder="YYYY-MM-DD"
                fromDate={draftFrom ? new Date(`${draftFrom}T12:00:00`) : undefined}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setCustomOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={!isCustomPeriodRangeValid(draftFrom, draftTo)}
              onClick={applyCustomRange}
            >
              Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
