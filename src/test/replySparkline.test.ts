import { describe, expect, it } from "vitest";
import {
  buildReplySparklineGeometry,
  findNearestReplySparklinePointIndex,
  formatReplySparklineTooltip,
  getReplySparklinePeriodLabel
} from "@/lib/analytics/campaignComparison";

describe("buildReplySparklineGeometry", () => {
  it("returns null for empty values", () => {
    expect(buildReplySparklineGeometry([])).toBeNull();
    expect(buildReplySparklineGeometry(undefined)).toBeNull();
  });

  it("renders a baseline for a single value", () => {
    const geometry = buildReplySparklineGeometry([4]);
    expect(geometry?.isSingle).toBe(true);
    expect(geometry?.linePath).toContain("M 3");
    expect(geometry?.points).toHaveLength(1);
  });

  it("builds a multi-point line path", () => {
    const geometry = buildReplySparklineGeometry([1, 3, 2, 5]);
    expect(geometry?.isSingle).toBe(false);
    expect(geometry?.linePath.split("L")).toHaveLength(4);
    expect(geometry?.areaPath).toContain("Z");
  });

  it("handles flat series as a horizontal line", () => {
    const geometry = buildReplySparklineGeometry([2, 2, 2]);
    expect(geometry?.isFlat).toBe(true);
    expect(new Set(geometry?.points.map((point) => point.y)).size).toBe(1);
  });
});

describe("formatReplySparklineTooltip", () => {
  it("formats values for hover text", () => {
    expect(formatReplySparklineTooltip([1, 4, 2])).toBe(
      "Period 1: 1 → Period 2: 4 → Period 3: 2"
    );
  });
});

describe("findNearestReplySparklinePointIndex", () => {
  it("returns the closest point to the pointer", () => {
    const geometry = buildReplySparklineGeometry([1, 4, 2, 5]);
    expect(findNearestReplySparklinePointIndex(geometry!.points, geometry!.points[1].x)).toBe(1);
  });
});

describe("getReplySparklinePeriodLabel", () => {
  it("labels a single-value series", () => {
    expect(getReplySparklinePeriodLabel(0, 1)).toBe("Latest period");
  });
});
