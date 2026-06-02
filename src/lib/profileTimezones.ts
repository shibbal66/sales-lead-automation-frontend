/** Fallback when local timezone can't be resolved or is unsupported. */
export const DEFAULT_PROFILE_TIMEZONE = "UTC";

export type ProfileTimezoneOption = {
  value: string;
  label: string;
};

/** Curated IANA zones for the profile timezone selector. */
export const PROFILE_TIMEZONE_OPTIONS: ProfileTimezoneOption[] = [
  { value: "Pacific/Honolulu", label: "(GMT-10:00) Hawaii Time" },
  { value: "America/Anchorage", label: "(GMT-09:00) Alaska Time" },
  { value: "America/Los_Angeles", label: "(GMT-08:00) Pacific Time (US & Canada)" },
  { value: "America/Denver", label: "(GMT-07:00) Mountain Time (US & Canada)" },
  { value: "America/Chicago", label: "(GMT-06:00) Central Time (US & Canada)" },
  { value: "America/New_York", label: "(GMT-05:00) Eastern Time (US & Canada)" },
  { value: "America/Toronto", label: "(GMT-05:00) Toronto" },
  { value: "America/Sao_Paulo", label: "(GMT-03:00) Sao Paulo" },
  { value: "UTC", label: "(GMT+00:00) UTC" },
  { value: "Europe/London", label: "(GMT+00:00) London" },
  { value: "Europe/Paris", label: "(GMT+01:00) Central European Time" },
  { value: "Europe/Berlin", label: "(GMT+01:00) Berlin" },
  { value: "Europe/Athens", label: "(GMT+02:00) Athens" },
  { value: "Africa/Johannesburg", label: "(GMT+02:00) Johannesburg" },
  { value: "Asia/Dubai", label: "(GMT+04:00) Dubai" },
  { value: "Asia/Karachi", label: "(GMT+05:00) Karachi" },
  { value: "Asia/Kolkata", label: "(GMT+05:30) India Standard Time" },
  { value: "Asia/Dhaka", label: "(GMT+06:00) Dhaka" },
  { value: "Asia/Bangkok", label: "(GMT+07:00) Bangkok" },
  { value: "Asia/Singapore", label: "(GMT+08:00) Singapore" },
  { value: "Asia/Hong_Kong", label: "(GMT+08:00) Hong Kong" },
  { value: "Asia/Shanghai", label: "(GMT+08:00) Beijing/Shanghai" },
  { value: "Asia/Tokyo", label: "(GMT+09:00) Tokyo" },
  { value: "Asia/Seoul", label: "(GMT+09:00) Seoul" },
  { value: "Australia/Perth", label: "(GMT+08:00) Perth" },
  { value: "Australia/Adelaide", label: "(GMT+09:30) Adelaide" },
  { value: "Australia/Sydney", label: "(GMT+10:00) Sydney" },
  { value: "Pacific/Auckland", label: "(GMT+12:00) Auckland" }
];

function getLocalProfileTimezone(): string {
  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone?.trim();
    if (!timeZone) return DEFAULT_PROFILE_TIMEZONE;
    const isSupported = PROFILE_TIMEZONE_OPTIONS.some((option) => option.value === timeZone);
    return isSupported ? timeZone : DEFAULT_PROFILE_TIMEZONE;
  } catch {
    return DEFAULT_PROFILE_TIMEZONE;
  }
}

export function resolveProfileTimezone(value?: string | null): string {
  const trimmed = value?.trim();
  return trimmed || getLocalProfileTimezone();
}

export function profileTimezoneSelectOptions(currentValue: string): ProfileTimezoneOption[] {
  if (PROFILE_TIMEZONE_OPTIONS.some((o) => o.value === currentValue)) {
    return PROFILE_TIMEZONE_OPTIONS;
  }
  return [...PROFILE_TIMEZONE_OPTIONS, { value: currentValue, label: currentValue }];
}
