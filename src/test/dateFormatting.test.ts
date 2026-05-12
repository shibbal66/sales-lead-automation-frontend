import { describe, expect, it } from "vitest";
import { EMPTY_DATE_LABEL, formatDateTime, formatRelativeDate, hasPresentableDate } from "@/lib/dateFormatting";

describe("dateFormatting", () => {
  it("formats missing dates as a dash", () => {
    expect(formatDateTime(null)).toBe(EMPTY_DATE_LABEL);
    expect(formatRelativeDate(null)).toBe(EMPTY_DATE_LABEL);
    expect(hasPresentableDate(null)).toBe(false);
  });

  it("formats valid timestamps for display", () => {
    const formatted = formatDateTime("2026-05-12T10:00:00.000Z");
    expect(formatted).not.toBe(EMPTY_DATE_LABEL);
    expect(hasPresentableDate("2026-05-12T10:00:00.000Z")).toBe(true);
  });
});
