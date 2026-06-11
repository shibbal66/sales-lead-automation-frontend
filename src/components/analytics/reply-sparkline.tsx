import { useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ReplySparklineTooltip } from "@/components/analytics/reply-sparkline-tooltip";
import {
  buildReplySparklineGeometry,
  findNearestReplySparklinePointIndex,
  formatReplySparklineTooltip
} from "@/lib/analytics";
import { cn } from "@/lib/utils";

type ReplySparklineProps = {
  values: number[];
  className?: string;
};

const SPARKLINE_STROKE = "hsl(var(--brand-deep))";
const SPARKLINE_FILL = "hsl(var(--brand-deep))";

export function ReplySparkline({ values, className }: ReplySparklineProps) {
  const gradientId = useId();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [tooltipAnchor, setTooltipAnchor] = useState<{ x: number; y: number } | null>(null);
  const geometry = useMemo(() => buildReplySparklineGeometry(values), [values]);
  if (!geometry) return null;

  const { width, height, linePath, areaPath, points, baselineY, isSingle, isFlat } = geometry;
  const activePoint = activeIndex !== null ? points[activeIndex] : null;
  const tooltip = formatReplySparklineTooltip(values);

  const updateActiveIndex = (clientX: number, clientY: number, svg: SVGSVGElement) => {
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0) return;
    const pointerX = ((clientX - rect.left) / rect.width) * width;
    setActiveIndex(findNearestReplySparklinePointIndex(points, pointerX));
    setTooltipAnchor({ x: clientX, y: rect.top });
  };

  const clearHover = () => {
    setActiveIndex(null);
    setTooltipAnchor(null);
  };

  const hoverTooltip =
    activeIndex !== null && tooltipAnchor && typeof document !== "undefined"
      ? createPortal(
          <div
            className="pointer-events-none fixed z-[100] -translate-x-1/2 -translate-y-full pb-2"
            style={{ left: tooltipAnchor.x, top: tooltipAnchor.y }}
          >
            <ReplySparklineTooltip values={values} activeIndex={activeIndex} />
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {hoverTooltip}
      <div
      className={cn(
        "relative inline-flex items-center rounded-md border border-brand-deep/30 bg-brand-deep/[0.1] px-1.5 py-1 shadow-sm",
        className
      )}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="shrink-0 cursor-crosshair overflow-visible"
        role="img"
        aria-label={`Reply trend ${tooltip}`}
        onMouseMove={(event) => updateActiveIndex(event.clientX, event.clientY, event.currentTarget)}
        onMouseLeave={clearHover}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={SPARKLINE_FILL} stopOpacity="0.55" />
            <stop offset="100%" stopColor={SPARKLINE_FILL} stopOpacity="0.08" />
          </linearGradient>
        </defs>

        {(isSingle || isFlat) && (
          <line
            x1={3}
            y1={baselineY}
            x2={width - 3}
            y2={baselineY}
            stroke={SPARKLINE_STROKE}
            strokeOpacity={0.35}
            strokeWidth={1.25}
            strokeDasharray="3 3"
          />
        )}

        {areaPath ? <path d={areaPath} fill={`url(#${gradientId})`} pointerEvents="none" /> : null}

        {!isSingle ? (
          <path
            d={linePath}
            fill="none"
            stroke={SPARKLINE_STROKE}
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            pointerEvents="none"
          />
        ) : null}

        {activePoint ? (
          <line
            x1={activePoint.x}
            y1={4}
            x2={activePoint.x}
            y2={height - 4}
            stroke={SPARKLINE_STROKE}
            strokeOpacity={0.35}
            strokeWidth={1}
            strokeDasharray="2 2"
            pointerEvents="none"
          />
        ) : null}

        {points.map((point, index) => {
          const isActive = activeIndex === index;
          const isLast = index === points.length - 1;

          return (
            <g key={`${point.x}-${index}`}>
              <circle
                cx={point.x}
                cy={point.y}
                r={10}
                fill="transparent"
                onMouseEnter={(event) => {
                  setActiveIndex(index);
                  setTooltipAnchor({ x: event.clientX, y: event.currentTarget.getBoundingClientRect().top });
                }}
              />
              <circle
                cx={point.x}
                cy={point.y}
                r={isActive ? (isSingle ? 4.5 : isLast ? 4 : 3) : isSingle ? 4 : isLast ? 3.5 : 2}
                fill={SPARKLINE_FILL}
                fillOpacity={isActive || isSingle || isLast ? 1 : 0.85}
                stroke={isActive || isLast ? "hsl(var(--card))" : undefined}
                strokeWidth={isActive || isLast ? 2 : 0}
                pointerEvents="none"
              />
            </g>
          );
        })}
      </svg>
    </div>
    </>
  );
}
