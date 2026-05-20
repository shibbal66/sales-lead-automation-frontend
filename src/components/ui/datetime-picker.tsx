import * as React from "react";
import { format, startOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  closestInList,
  minuteOptions,
  pickerTriggerClassName,
  TwelveHourTimeGrid
} from "@/components/ui/time-picker";
import {
  formatDateInput,
  formatDatetimeLocalFromDate,
  parseDateInput,
  parseDatetimeLocalInput
} from "@/lib/dateFormatting";

export { pickerTriggerClassName } from "@/components/ui/time-picker";
export { TimePicker, type TimePickerProps } from "@/components/ui/time-picker";

/** Normalize to local midnight so DayPicker always matches a single calendar cell. */
function toCalendarDay(d: Date | undefined): Date | undefined {
  if (!d) return undefined;
  return startOfDay(d);
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
