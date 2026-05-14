import * as React from "react";
import { format, startOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  formatDateInput,
  formatDatetimeLocalFromDate,
  parseDateInput,
  parseDatetimeLocalInput
} from "@/lib/dateFormatting";

/** Shared trigger look: teal ring, muted surface, matches Rapid AI fields */
export const pickerTriggerClassName = cn(
  "flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-muted/30 px-3 py-2 text-left text-sm text-foreground",
  "ring-offset-background transition-colors",
  "hover:bg-muted/45 hover:border-primary/30",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
  "disabled:pointer-events-none disabled:opacity-50"
);

const HOURS_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

function minuteOptions(step: number): number[] {
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

function parseHHmm(value: string): { h: number; m: number } | null {
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

function formatHHmm(h: number, m: number): string {
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function closestInList(target: number, list: number[]): number {
  if (list.length === 0) return 0;
  return list.reduce((best, cur) => (Math.abs(cur - target) < Math.abs(best - target) ? cur : best), list[0]!);
}

/** Normalize to local midnight so DayPicker always matches a single calendar cell. */
function toCalendarDay(d: Date | undefined): Date | undefined {
  if (!d) return undefined;
  return startOfDay(d);
}

type TwelveHourTimeGridProps = {
  h24: number;
  rawMinute: number;
  minutes: number[];
  disabled?: boolean;
  onCommit: (h24: number, minute: number) => void;
  /** Smaller triggers inside the datetime popover */
  compact?: boolean;
};

function TwelveHourTimeGrid({
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

export type DatePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  fromDate?: Date;
  toDate?: Date;
};

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  disabled,
  className,
  id,
  fromDate,
  toDate
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);
  const selected = parseDateInput(value);
  const selectedDay = toCalendarDay(selected);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" id={id} disabled={disabled} className={cn(pickerTriggerClassName, className)}>
          <span className={cn("min-w-0 flex-1 truncate", !selected && "text-muted-foreground")}>
            {selected ? format(selected, "MMMM d, yyyy") : placeholder}
          </span>
          <CalendarIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0 shadow-elevated" align="start">
        <Calendar
          key={value || "empty"}
          mode="single"
          selected={selectedDay}
          defaultMonth={selected ?? new Date()}
          onSelect={(d) => {
            onChange(d ? formatDateInput(d) : "");
            setOpen(false);
          }}
          fromDate={fromDate}
          toDate={toDate}
          initialFocus
        />
        {selected ? (
          <div className="border-t border-border bg-muted/20 p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-full text-xs text-muted-foreground hover:text-foreground"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Clear date
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
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
};

export function TimePicker({
  value,
  onChange,
  placeholder = "Select time",
  disabled,
  className,
  id,
  minuteStep = 1
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
      {hasValue ? (
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
      ) : (
        <p className="text-xs text-muted-foreground">{placeholder}</p>
      )}
    </div>
  );
}

export type DateTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  fromDate?: Date;
  toDate?: Date;
  minuteStep?: number;
};

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick date & time",
  disabled,
  className,
  id,
  fromDate,
  toDate,
  minuteStep = 1
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);
  const emptyDefaultRef = React.useRef(new Date());
  React.useEffect(() => {
    if (!value.trim()) emptyDefaultRef.current = new Date();
  }, [value]);

  const selected = parseDatetimeLocalInput(value);
  const selectedDay = toCalendarDay(selected);
  const step = Math.min(30, Math.max(1, Math.round(minuteStep)));
  const minutes = React.useMemo(() => minuteOptions(step), [step]);

  const timeSource = selected ?? emptyDefaultRef.current;
  const rawH = timeSource.getHours();
  const rawM = timeSource.getMinutes();
  const m = minutes.includes(rawM) ? rawM : closestInList(rawM, minutes);

  const setTime = (nextH: number, nextM: number) => {
    const now = new Date();
    const merged = selected
      ? new Date(selected.getFullYear(), selected.getMonth(), selected.getDate(), nextH, nextM, 0, 0)
      : new Date(now.getFullYear(), now.getMonth(), now.getDate(), nextH, nextM, 0, 0);
    onChange(formatDatetimeLocalFromDate(merged));
  };

  const onDaySelect = (d: Date | undefined) => {
    if (!d) {
      onChange("");
      return;
    }
    const prev = parseDatetimeLocalInput(value);
    const src = prev ?? new Date();
    const merged = new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate(),
      src.getHours(),
      src.getMinutes(),
      0,
      0
    );
    onChange(formatDatetimeLocalFromDate(merged));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" id={id} disabled={disabled} className={cn(pickerTriggerClassName, className)}>
          <span className={cn("min-w-0 flex-1 truncate", !selected && "text-muted-foreground")}>
            {selected ? format(selected, "MMM d, yyyy · h:mm a") : placeholder}
          </span>
          <CalendarIcon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto overflow-hidden p-0 shadow-elevated" align="start">
        <div className="flex flex-col sm:flex-row">
          <Calendar
            key={value || "empty"}
            mode="single"
            selected={selectedDay}
            defaultMonth={selected ?? new Date()}
            onSelect={onDaySelect}
            fromDate={fromDate}
            toDate={toDate}
            className="rounded-none border-0 sm:rounded-l-md"
          />
          <div className="flex flex-col gap-3 border-t border-border bg-muted/15 p-3 sm:w-[260px] sm:border-l sm:border-t-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Time</p>
            <TwelveHourTimeGrid
              h24={rawH}
              rawMinute={m}
              minutes={minutes}
              disabled={disabled}
              compact
              onCommit={(nh, nm) => setTime(nh, nm)}
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                disabled={disabled}
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
              >
                Clear
              </Button>
              <Button type="button" size="sm" className="flex-1 text-xs" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
