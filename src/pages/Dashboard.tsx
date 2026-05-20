import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { KPICard } from "@/components/kpi-card";
import { DashboardPerformancePeriodSelect } from "@/components/dashboard/dashboard-performance-period-select";
import {
  DashboardActiveCampaignsPanelSkeleton,
  DashboardKpiCardSkeleton,
  DashboardPerformanceChartSkeleton,
  DashboardRecentActivityPanelSkeleton
} from "@/components/skeletons";
import { StatusPill } from "@/components/status-pill";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { cn } from "@/lib/utils";
import {
  buildDashboardKpis,
  clampCampaignProgress,
  DASHBOARD_ACTIVE_CAMPAIGNS_EMPTY_MESSAGE,
  DASHBOARD_KPI_COUNT,
  DASHBOARD_PERFORMANCE_CHART_TITLE,
  DASHBOARD_PERFORMANCE_EMPTY_MESSAGE,
  DASHBOARD_PERFORMANCE_SERIES_LABELS,
  DASHBOARD_RECENT_ACTIVITY_EMPTY_MESSAGE,
  formatActiveCampaignLeadsLine,
  formatActiveCampaignStatusForPill,
  formatRecentActivityText,
  formatRecentActivityTime,
  getPerformanceSubtitle,
  performanceSeriesToChartData,
  runningCampaignsSubtitle
} from "@/lib/dashboard";
import { useDashboardStore } from "@/store/dashboard/dashboardStore";

export default function Dashboard() {
  const navigate = useNavigate();
  const summary = useDashboardStore((state) => state.summary);
  const isFetchingSummary = useDashboardStore((state) => state.isFetchingSummary);
  const fetchSummary = useDashboardStore((state) => state.fetchSummary);

  const performance = useDashboardStore((state) => state.performance);
  const performancePeriod = useDashboardStore((state) => state.performancePeriod);
  const performanceCustomFrom = useDashboardStore((state) => state.performanceCustomFrom);
  const performanceCustomTo = useDashboardStore((state) => state.performanceCustomTo);
  const isFetchingPerformance = useDashboardStore((state) => state.isFetchingPerformance);
  const fetchPerformance = useDashboardStore((state) => state.fetchPerformance);
  const setPerformancePeriod = useDashboardStore((state) => state.setPerformancePeriod);
  const setPerformanceCustomRange = useDashboardStore((state) => state.setPerformanceCustomRange);

  const activeCampaigns = useDashboardStore((state) => state.activeCampaigns);
  const totalRunning = useDashboardStore((state) => state.totalRunning);
  const activeCampaignsPage = useDashboardStore((state) => state.activeCampaignsPage);
  const activeCampaignsTotalPages = useDashboardStore((state) => state.activeCampaignsTotalPages);
  const isFetchingActiveCampaigns = useDashboardStore((state) => state.isFetchingActiveCampaigns);
  const fetchActiveCampaigns = useDashboardStore((state) => state.fetchActiveCampaigns);

  const recentActivity = useDashboardStore((state) => state.recentActivity);
  const isFetchingRecentActivity = useDashboardStore((state) => state.isFetchingRecentActivity);
  const fetchRecentActivity = useDashboardStore((state) => state.fetchRecentActivity);

  useEffect(() => {
    void fetchSummary();
    void fetchPerformance();
    void fetchActiveCampaigns();
    void fetchRecentActivity();
  }, [fetchSummary, fetchPerformance, fetchActiveCampaigns, fetchRecentActivity]);

  const kpis = useMemo(() => (summary ? buildDashboardKpis(summary) : []), [summary]);
  const showKpiSkeleton = isFetchingSummary && !summary;

  const chartData = useMemo(
    () => performanceSeriesToChartData(performance?.series),
    [performance]
  );
  const showPerformanceSkeleton = isFetchingPerformance && !performance;
  const performanceSubtitle = getPerformanceSubtitle(
    performance,
    performancePeriod,
    isFetchingPerformance
  );

  const showActiveCampaignsSkeleton = isFetchingActiveCampaigns && activeCampaigns.length === 0;
  const hasMoreActiveCampaigns = activeCampaignsPage < activeCampaignsTotalPages;
  const showRecentActivitySkeleton = isFetchingRecentActivity && recentActivity.length === 0;

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {showKpiSkeleton
          ? Array.from({ length: DASHBOARD_KPI_COUNT }, (_, i) => (
              <motion.div
                key={`kpi-skeleton-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <DashboardKpiCardSkeleton />
              </motion.div>
            ))
          : kpis.map((k, i) => (
              <motion.div
                key={k.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <KPICard {...k} />
              </motion.div>
            ))}
      </div>

      {/* Chart + Active campaigns */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        {showPerformanceSkeleton ? (
          <DashboardPerformanceChartSkeleton className="lg:col-span-3" />
        ) : (
          <Card className="lg:col-span-3 p-5 shadow-card">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-bold">{DASHBOARD_PERFORMANCE_CHART_TITLE}</h3>
                <p className="text-xs text-muted-foreground">{performanceSubtitle}</p>
              </div>
              <DashboardPerformancePeriodSelect
                period={performancePeriod}
                customFrom={performanceCustomFrom}
                customTo={performanceCustomTo}
                disabled={isFetchingPerformance}
                onPeriodChange={setPerformancePeriod}
                onCustomRangeApply={setPerformanceCustomRange}
              />
            </div>
            <div className={cn("h-[280px] w-full", isFetchingPerformance && performance && "opacity-60")}>
              {chartData.length === 0 ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {DASHBOARD_PERFORMANCE_EMPTY_MESSAGE}
                </div>
              ) : (
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="label"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: 12,
                        fontSize: 12,
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    <Line
                      type="monotone"
                      dataKey="sent"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2.5}
                      dot={false}
                      name={DASHBOARD_PERFORMANCE_SERIES_LABELS.sent}
                    />
                    <Line
                      type="monotone"
                      dataKey="replies"
                      stroke="hsl(var(--warning))"
                      strokeWidth={2}
                      dot={false}
                      name={DASHBOARD_PERFORMANCE_SERIES_LABELS.replies}
                    />
                    <Line
                      type="monotone"
                      dataKey="bookings"
                      stroke="hsl(var(--brand-deep))"
                      strokeWidth={2}
                      dot={false}
                      name={DASHBOARD_PERFORMANCE_SERIES_LABELS.bookings}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>
        )}

        {showActiveCampaignsSkeleton ? (
          <DashboardActiveCampaignsPanelSkeleton className="lg:col-span-2" />
        ) : (
          <Card
            className={cn(
              "h-auto max-h-[400px] overflow-y-auto scrollbar-thin lg:col-span-2 p-5 shadow-card",
              isFetchingActiveCampaigns && activeCampaigns.length > 0 && "opacity-80"
            )}
          >
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h3 className="font-display text-base font-bold">Active Campaigns</h3>
                <p className="text-xs text-muted-foreground">{runningCampaignsSubtitle(totalRunning)}</p>
              </div>
            </div>
            {activeCampaigns.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                {DASHBOARD_ACTIVE_CAMPAIGNS_EMPTY_MESSAGE}
              </p>
            ) : (
              <div className="space-y-3">
                {activeCampaigns.map((c) => {
                  const pct = clampCampaignProgress(c.progress);
                  return (
                    <div key={c.id} className="rounded-xl border border-border bg-surface/40 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold">{c.name}</p>
                        <StatusPill status={formatActiveCampaignStatusForPill(c.status)} />
                      </div>
                      <div className="mt-2 flex items-center gap-3">
                        <Progress value={pct} className="h-1.5" />
                        <span className="shrink-0 text-[11px] font-medium text-muted-foreground">{pct}%</span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                        <span>
                          {formatActiveCampaignLeadsLine(c.sent_count, c.total_leads)}
                          {c.reply_count > 0 ? ` · ${c.reply_count.toLocaleString()} replies` : ""}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-2 text-[11px]"
                          onClick={() => navigate(`/campaigns/${c.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {hasMoreActiveCampaigns ? (
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isFetchingActiveCampaigns}
                  onClick={() =>
                    void fetchActiveCampaigns({ page: activeCampaignsPage + 1, append: true })
                  }
                >
                  {isFetchingActiveCampaigns ? "Loading…" : "Load more"}
                </Button>
              </div>
            ) : null}
          </Card>
        )}
      </div>

      {/* Recent activity */}
      {showRecentActivitySkeleton ? (
        <DashboardRecentActivityPanelSkeleton />
      ) : (
        <Card
          className={cn(
            "p-5 shadow-card",
            isFetchingRecentActivity && recentActivity.length > 0 && "opacity-80"
          )}
        >
          <div className="mb-4">
            <h3 className="font-display text-base font-bold">Recent Activity</h3>
          </div>
          {recentActivity.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              {DASHBOARD_RECENT_ACTIVITY_EMPTY_MESSAGE}
            </p>
          ) : (
            <ol className="relative space-y-4 border-l border-border pl-6">
              {recentActivity.map((a) => (
                <li key={a.id} className="relative">
                  <span className="absolute -left-[27px] top-1.5 grid h-3 w-3 place-items-center rounded-full bg-primary ring-4 ring-background" />
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm">{formatRecentActivityText(a)}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRecentActivityTime(a.occurred_at)}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Card>
      )}
    </div>
  );
}
