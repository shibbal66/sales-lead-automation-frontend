import { useEffect, useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  clampLocalPhoneDigits,
  DEFAULT_PHONE_COUNTRY_ISO,
  formatPhoneNumber,
  getPhoneDigitLimits,
  isoToDialCode,
  parsePhoneNumber,
  PHONE_COUNTRIES
} from "@/lib/phoneNumber";

type PhoneNumberFieldProps = {
  id?: string;
  label?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  localPlaceholder?: string;
};

export function PhoneNumberField({
  id = "phone",
  label,
  value,
  onChange,
  error,
  disabled,
  className,
  localPlaceholder = "555 000 0000"
}: PhoneNumberFieldProps) {
  const parsed = parsePhoneNumber(value);
  const [countryIso, setCountryIso] = useState(parsed.iso || DEFAULT_PHONE_COUNTRY_ISO);
  const [localNumber, setLocalNumber] = useState(parsed.local);

  useEffect(() => {
    const next = parsePhoneNumber(value);
    setCountryIso(next.iso);
    setLocalNumber(next.local);
  }, [value]);

  const { maxDigits } = getPhoneDigitLimits(countryIso);

  const emitChange = (iso: string, local: string) => {
    const dialCode = isoToDialCode(iso);
    onChange(formatPhoneNumber(dialCode, clampLocalPhoneDigits(iso, local)));
  };

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? <Label htmlFor={id}>{label}</Label> : null}
      <div className="flex gap-1">
        <Select
          value={countryIso}
          disabled={disabled}
          onValueChange={(iso) => {
            setCountryIso(iso);
            const clamped = clampLocalPhoneDigits(iso, localNumber);
            setLocalNumber(clamped);
            emitChange(iso, clamped);
          }}
        >
          <SelectTrigger className="w-[5rem] shrink-0" aria-label="Country code">
            <SelectValue placeholder="Code" />
          </SelectTrigger>
          <SelectContent>
            {PHONE_COUNTRIES.map((country) => (
              <SelectItem key={country.iso} value={country.iso}>
                {country.dialCode} {country.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={localNumber}
          maxLength={maxDigits}
          disabled={disabled}
          placeholder={localPlaceholder}
          aria-invalid={!!error}
          className="min-w-[8rem] flex-1"
          onChange={(event) => {
            const digits = clampLocalPhoneDigits(countryIso, event.target.value);
            setLocalNumber(digits);
            emitChange(countryIso, digits);
          }}
        />
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
