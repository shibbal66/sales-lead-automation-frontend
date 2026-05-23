import { z } from "zod";

export type PhoneCountry = {
  iso: string;
  dialCode: string;
  label: string;
  /** National number length (digits only, excluding country code). */
  minDigits: number;
  maxDigits: number;
};

/** Dial codes sorted longest-first for parsing. */
export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso: "US", dialCode: "+1", label: "US", minDigits: 10, maxDigits: 10 },
  { iso: "GB", dialCode: "+44", label: "UK", minDigits: 10, maxDigits: 10 },
  { iso: "PK", dialCode: "+92", label: "PK", minDigits: 10, maxDigits: 10 },
  { iso: "IN", dialCode: "+91", label: "IN", minDigits: 10, maxDigits: 10 },
  { iso: "AE", dialCode: "+971", label: "AE", minDigits: 9, maxDigits: 9 },
  { iso: "AU", dialCode: "+61", label: "AU", minDigits: 9, maxDigits: 9 },
  { iso: "DE", dialCode: "+49", label: "DE", minDigits: 10, maxDigits: 11 },
  { iso: "FR", dialCode: "+33", label: "FR", minDigits: 9, maxDigits: 9 },
  { iso: "SA", dialCode: "+966", label: "SA", minDigits: 9, maxDigits: 9 },
  { iso: "CA", dialCode: "+1", label: "CA", minDigits: 10, maxDigits: 10 }
];

export const DEFAULT_PHONE_COUNTRY_ISO = "US";

const DIAL_CODES_LONGEST_FIRST = [...new Set(PHONE_COUNTRIES.map((c) => c.dialCode))].sort(
  (a, b) => b.length - a.length
);

const FALLBACK_COUNTRY =
  PHONE_COUNTRIES.find((c) => c.iso === DEFAULT_PHONE_COUNTRY_ISO) ?? PHONE_COUNTRIES[0];

export function getPhoneCountryByIso(iso: string): PhoneCountry {
  return PHONE_COUNTRIES.find((c) => c.iso === iso) ?? FALLBACK_COUNTRY;
}

export function getPhoneDigitLimits(iso: string): { minDigits: number; maxDigits: number } {
  const { minDigits, maxDigits } = getPhoneCountryByIso(iso);
  return { minDigits, maxDigits };
}

/** Clamp national digits to the selected country's maximum length. */
export function clampLocalPhoneDigits(iso: string, local: string): string {
  const { maxDigits } = getPhoneDigitLimits(iso);
  return local.replace(/\D/g, "").slice(0, maxDigits);
}

export function phoneLocalNumberSchemaForIso(iso: string) {
  const { minDigits, maxDigits } = getPhoneDigitLimits(iso);
  return z
    .string()
    .trim()
    .regex(/^\d+$/, "Phone must contain only digits")
    .min(minDigits, `Phone must be at least ${minDigits} digits`)
    .max(maxDigits, `Phone must be at most ${maxDigits} digits`);
}

/** @deprecated Prefer {@link phoneLocalNumberSchemaForIso} for country-aware validation. */
export const phoneLocalNumberSchema = z
  .string()
  .trim()
  .regex(/^\d+$/, "Phone must contain only digits")
  .min(7, "Phone must be at least 7 digits")
  .max(15, "Phone must be at most 15 digits");

export function dialCodeToIso(dialCode: string): string {
  const match = PHONE_COUNTRIES.find((c) => c.dialCode === dialCode);
  return match?.iso ?? DEFAULT_PHONE_COUNTRY_ISO;
}

export function isoToDialCode(iso: string): string {
  const match = PHONE_COUNTRIES.find((c) => c.iso === iso);
  return match?.dialCode ?? PHONE_COUNTRIES[0].dialCode;
}

export function formatPhoneNumber(dialCode: string, localNumber: string): string {
  const local = localNumber.replace(/\D/g, "");
  if (!local) return "";
  const codeDigits = dialCode.replace(/\D/g, "");
  return `+${codeDigits}${local}`;
}

export function parsePhoneNumber(full: string): { dialCode: string; local: string; iso: string } {
  const trimmed = full.trim();
  if (!trimmed) {
    return {
      dialCode: isoToDialCode(DEFAULT_PHONE_COUNTRY_ISO),
      local: "",
      iso: DEFAULT_PHONE_COUNTRY_ISO
    };
  }

  const digitsOnly = trimmed.replace(/\D/g, "");
  if (!digitsOnly) {
    return {
      dialCode: isoToDialCode(DEFAULT_PHONE_COUNTRY_ISO),
      local: "",
      iso: DEFAULT_PHONE_COUNTRY_ISO
    };
  }

  for (const dialCode of DIAL_CODES_LONGEST_FIRST) {
    const codeDigits = dialCode.replace(/\D/g, "");
    if (digitsOnly.startsWith(codeDigits) && digitsOnly.length > codeDigits.length) {
      const local = digitsOnly.slice(codeDigits.length);
      const iso = dialCodeToIso(dialCode);
      return { dialCode, local: clampLocalPhoneDigits(iso, local), iso };
    }
  }

  return {
    dialCode: isoToDialCode(DEFAULT_PHONE_COUNTRY_ISO),
    local: clampLocalPhoneDigits(DEFAULT_PHONE_COUNTRY_ISO, digitsOnly),
    iso: DEFAULT_PHONE_COUNTRY_ISO
  };
}

export function isValidPhoneNumber(full: string): boolean {
  const trimmed = full.trim();
  if (!trimmed) return false;
  const { dialCode, local, iso } = parsePhoneNumber(trimmed);
  if (!PHONE_COUNTRIES.some((c) => c.dialCode === dialCode)) return false;
  return phoneLocalNumberSchemaForIso(iso).safeParse(local).success;
}

export function isValidOptionalPhoneNumber(full: string): boolean {
  if (!full.trim()) return true;
  return isValidPhoneNumber(full);
}
