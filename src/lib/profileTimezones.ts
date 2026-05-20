/** Default when API returns null/empty timezone. */
export const DEFAULT_PROFILE_TIMEZONE = "America/Los_Angeles";

export type ProfileTimezoneOption = {
  value: string;
  label: string;
};

/** Curated IANA zones for the profile timezone selector. */
export const PROFILE_TIMEZONE_OPTIONS: ProfileTimezoneOption[] = [
  { value: "America/Los_Angeles", label: "(GMT-08:00) Pacific Time" },
  { value: "America/New_York", label: "(GMT-05:00) Eastern Time" },
  { value: "UTC", label: "(GMT+00:00) UTC" },
  { value: "Europe/Paris", label: "(GMT+01:00) Central European Time" }
];

export function resolveProfileTimezone(value?: string | null): string {
  const trimmed = value?.trim();
  return trimmed || DEFAULT_PROFILE_TIMEZONE;
}

export function profileTimezoneSelectOptions(currentValue: string): ProfileTimezoneOption[] {
  if (PROFILE_TIMEZONE_OPTIONS.some((o) => o.value === currentValue)) {
    return PROFILE_TIMEZONE_OPTIONS;
  }
  return [...PROFILE_TIMEZONE_OPTIONS, { value: currentValue, label: currentValue }];
}
