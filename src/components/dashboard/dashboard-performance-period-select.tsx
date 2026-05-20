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
  DASHBOARD_PERIOD_OPTIONS,
  getDashboardPeriodLabel,
  isCustomPerformanceRangeValid
} from "@/lib/dashboard";
import type { DashboardPeriod } from "@/types/dashboard";
import { cn } from "@/lib/utils";

type DashboardPerformancePeriodSelectProps = {
  period: DashboardPeriod;
  customFrom: string;
  customTo: string;
  disabled?: boolean;
  onPeriodChange: (period: DashboardPeriod) => void;
  onCustomRangeApply: (from: string, to: string) => void;
};

export function DashboardPerformancePeriodSelect({
  period,
  customFrom,
  customTo,
  disabled,
  onPeriodChange,
  onCustomRangeApply
}: DashboardPerformancePeriodSelectProps) {
  const [customOpen, setCustomOpen] = useState(false);
  const [draftFrom, setDraftFrom] = useState(customFrom);
  const [draftTo, setDraftTo] = useState(customTo);

  const openCustomPicker = () => {
    setDraftFrom(customFrom);
    setDraftTo(customTo);
    setCustomOpen(true);
  };

  const applyCustomRange = () => {
    if (!isCustomPerformanceRangeValid(draftFrom, draftTo)) return;
    onCustomRangeApply(draftFrom, draftTo);
    setCustomOpen(false);
  };

  const triggerLabel =
    period === "custom" && isCustomPerformanceRangeValid(customFrom, customTo)
      ? `${customFrom} – ${customTo}`
      : getDashboardPeriodLabel(period);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={disabled} className="gap-1.5">
            {triggerLabel}
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {DASHBOARD_PERIOD_OPTIONS.map((option) => (
            <DropdownMenuItem
              key={option.value}
              className={cn(period === option.value && "bg-accent")}
              onClick={() => {
                if (option.value === "custom") {
                  openCustomPicker();
                  return;
                }
                onPeriodChange(option.value);
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
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="performance-from">From</Label>
              <DatePicker
                id="performance-from"
                value={draftFrom}
                onChange={setDraftFrom}
                placeholder="YYYY-MM-DD"
                toDate={draftTo ? new Date(`${draftTo}T12:00:00`) : undefined}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="performance-to">To</Label>
              <DatePicker
                id="performance-to"
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
              disabled={!isCustomPerformanceRangeValid(draftFrom, draftTo)}
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
