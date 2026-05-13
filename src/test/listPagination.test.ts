import { describe, expect, it } from "vitest";
import { clampPage, getTotalPages } from "@/lib/listPagination";

describe("listPagination", () => {
  it("calculates total pages from total and limit", () => {
    expect(getTotalPages(0, 20)).toBe(1);
    expect(getTotalPages(20, 20)).toBe(1);
    expect(getTotalPages(21, 20)).toBe(2);
  });

  it("clamps page into the valid range", () => {
    expect(clampPage(0, 3)).toBe(1);
    expect(clampPage(2, 3)).toBe(2);
    expect(clampPage(5, 3)).toBe(3);
  });
});
