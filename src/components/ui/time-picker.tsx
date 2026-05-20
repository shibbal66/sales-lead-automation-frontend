import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

/** Shared trigger look for picker fields (also used by date/datetime pickers). */
export const pickerTriggerClassName = cn(
  "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-muted/30 px-3 py-2 text-left text-sm text-foreground",
  "ring-offset-background transition-colors",
  "hover:bg-muted/45 hover:border-primary/30",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  "disabled:pointer-events-none disabled:opacity-50"
);

const HOURS_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export function minuteOptions(step: number): number[] {
  const out: number[] = [];
  for (let m = 0; m < 60; m += step) out.push(m);
  return out;
}

function to12hParts(h24: number): { h12: number; ampm: "AM" | "PM" } {
  const ampm: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return { h12, ampm };
}

function from12hParts(h12: number, ampm: "AM" | "PM", minute: number): { h: number; m: number } {
  if (ampm === "AM") {
    return { h: h12 === 12 ? 0 : h12, m: minute };
  }
  return { h: h12 === 12 ? 12 : h12 + 12, m: minute };
}

export function parseHHmm(value: string): { h: number; m: number } | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  let h = Number.parseInt(match[1], 10);
  let m = Number.parseInt(match[2], 10);
  if (Number.isNaN(h)) h = 12;
  if (Number.isNaN(m)) m = 0;
  h = Math.min(23, Math.max(0, h));
  m = Math.min(59, Math.max(0, m));
  return { h, m };
}

export function formatHHmm(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function closestInList(target: number, list: number[]): number {
  if (list.length === 0) return 0;
  return list.reduce((best, cur) => (Math.abs(cur - target) < Math.abs(best - target) ? cur : best), list[0]!);
}

export type TwelveHourTimeGridProps = {
  h24: number;
  rawMinute: number;
  minutes: number[];
  disabled?: boolean;
  onCommit: (h24: number, minute: number) => void;
  /** Smaller triggers inside the datetime popover */
  compact?: boolean;
};

export function TwelveHourTimeGrid({
  h24,
  rawMinute,
  minutes,
  disabled,
  onCommit,
  compact
}: TwelveHourTimeGridProps) {
  const safeM = minutes.includes(rawMinute) ? rawMinute : closestInList(rawMinute, minutes);
  const { h12, ampm } = to12hParts(h24);

  const apply = (nextH12: number, nextAmpm: "AM" | "PM", nextM: number) => {
    const { h, m } = from12hParts(nextH12, nextAmpm, nextM);
    onCommit(h, m);
  };

  const triggerClass = compact
    ? cn(
        "flex h-9 w-full items-center justify-between rounded-md border border-input bg-muted/30 px-2 py-1",
        "text-xs font-mono tabular-nums text-foreground ring-offset-background",
        "transition-colors hover:border-primary/35",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      )
    : cn(pickerTriggerClassName, "min-h-10 font-mono tabular-nums");

  return (
    <div className="grid grid-cols-3 gap-2">
      <Select
        value={String(h12)}
        onValueChange={(v) => apply(Number.parseInt(v, 10), ampm, safeM)}
        disabled={disabled}
      >
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder="Hr" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {HOURS_12.map((hour) => (
            <SelectItem key={hour} value={String(hour)} className="font-mono tabular-nums">
              {hour}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={String(safeM)}
        onValueChange={(v) => apply(h12, ampm, Number.parseInt(v, 10))}
        disabled={disabled}
      >
        <SelectTrigger className={triggerClass}>
          <SelectValue placeholder="Min" />
        </SelectTrigger>
        <SelectContent className="max-h-60">
          {minutes.map((min) => (
            <SelectItem key={min} value={String(min)} className="font-mono tabular-nums">
              {String(min).padStart(2, "0")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={ampm} onValueChange={(v) => apply(h12, v as "AM" | "PM", safeM)} disabled={disabled}>
        <SelectTrigger className={triggerClass}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="AM">AM</SelectItem>
          <SelectItem value="PM">PM</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

export type TimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  /** Minute increment (1–30). Default 1. */
  minuteStep?: number;
  /** Show clear control when a time is set. Default true. */
  showClear?: boolean;
};

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  disabled,
  className,
  id,
  minuteStep = 1,
  showClear = true
}: TimePickerProps) {
  const step = Math.min(30, Math.max(1, Math.round(minuteStep)));
  const minutes = React.useMemo(() => minuteOptions(step), [step]);
  const emptyDefaultRef = React.useRef(new Date());
  React.useEffect(() => {
    if (!value.trim()) emptyDefaultRef.current = new Date();
  }, [value]);

  const parsed = parseHHmm(value);
  const hasValue = parsed !== null;
  const source = parsed ?? {
    h: emptyDefaultRef.current.getHours(),
    m: emptyDefaultRef.current.getMinutes()
  };
  const rawM = source.m;
  const m = minutes.includes(rawM) ? rawM : closestInList(rawM, minutes);
  const h = source.h;

  return (
    <div id={id} className={cn("flex flex-col gap-2", className)}>
      <TwelveHourTimeGrid
        h24={h}
        rawMinute={m}
        minutes={minutes}
        disabled={disabled}
        onCommit={(nh, nm) => onChange(formatHHmm(nh, nm))}
      />
      {hasValue && showClear ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 shrink-0 text-xs"
          disabled={disabled}
          onClick={() => onChange("")}
        >
          Clear
        </Button>
      ) : !hasValue ? (
        <p className="text-xs text-muted-foreground">{placeholder}</p>
      ) : null}
    </div>
  );
}
