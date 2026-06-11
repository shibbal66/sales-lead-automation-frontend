import { useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { KPICard } from "@/components/kpi-card";
import { CampaignChartTooltip } from "@/components/analytics/campaign-chart-tooltip";
import { PeriodQuerySelect } from "@/components/shared/period-query-select";
import { ReplyBreakdownTooltip } from "@/components/analytics/reply-breakdown-tooltip";
import { ReplySparkline } from "@/components/analytics/reply-sparkline";
import { SentVsRepliesTooltip } from "@/components/analytics/sent-vs-replies-tooltip";
import { TablePagination } from "@/components/layout/table-pagination";
import {
  AnalyticsCampaignChartSkeleton,
  AnalyticsReplyBreakdownChartSkeleton,
  AnalyticsSentVsRepliesChartSkeleton,
  DashboardKpiCardSkeleton
} from "@/components/skeletons";
import { TableRowsSkeleton } from "@/components/skeletons/shared/table-rows-skeleton";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  ANALYTICS_CAMPAIGN_CHART_EMPTY_MESSAGE,
  ANALYTICS_CAMPAIGN_COMPARISON_EMPTY_MESSAGE,
  ANALYTICS_OVERVIEW_KPI_COUNT,
  ANALYTICS_REPLY_BREAKDOWN_EMPTY_MESSAGE,
  ANALYTICS_SENT_VS_REPLIES_EMPTY_MESSAGE,
  buildAnalyticsOverviewKpis,
  campaignChartToLineChartData,
  formatAnalyticsRatePercent,
  formatCampaignChartAxisDate,
  getSentVsRepliesSubtitle,
  hasCampaignChartActivity,
  replyBreakdownSegmentsToChartData,
  sentVsRepliesSeriesToChartData
} from "@/lib/analytics";
import { StatusPill } from "@/components/status-pill";
import { cn } from "@/lib/utils";
import { PERIOD_QUERY_OPTIONS } from "@/lib/periodQuery";
import { useAnalyticsStore } from "@/store/analytics/analyticsStore";

function HealthBar({ label, value, threshold }: { label: string; value: number; threshold: { warn: number; bad: number } }) {
  const color = value >= threshold.bad ? "bg-destructive" : value >= threshold.warn ? "bg-warning" : "bg-success";
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono text-xs text-muted-foreground">{value.toFixed(2)}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${Math.min(value * 8, 100)}%` }} />
      </div>
    </div>
  );
}

export default function Analytics() {

  const analyticsPeriod = useAnalyticsStore((state) => state.analyticsPeriod);
  const analyticsCustomFrom = useAnalyticsStore((state) => state.analyticsCustomFrom);
  const analyticsCustomTo = useAnalyticsStore((state) => state.analyticsCustomTo);
  const setAnalyticsPeriod = useAnalyticsStore((state) => state.setAnalyticsPeriod);
  const setAnalyticsCustomRange = useAnalyticsStore((state) => state.setAnalyticsCustomRange);

  const overview = useAnalyticsStore((state) => state.overview);
  const isFetchingOverview = useAnalyticsStore((state) => state.isFetchingOverview);
  const fetchOverview = useAnalyticsStore((state) => state.fetchOverview);
  const invalidateOverview = useAnalyticsStore((state) => state.invalidateOverview);

  const sentVsReplies = useAnalyticsStore((state) => state.sentVsReplies);
  const isFetchingSentVsReplies = useAnalyticsStore((state) => state.isFetchingSentVsReplies);
  const fetchSentVsReplies = useAnalyticsStore((state) => state.fetchSentVsReplies);
  const invalidateSentVsReplies = useAnalyticsStore((state) => state.invalidateSentVsReplies);

  const replyBreakdown = useAnalyticsStore((state) => state.replyBreakdown);
  const isFetchingReplyBreakdown = useAnalyticsStore((state) => state.isFetchingReplyBreakdown);
  const fetchReplyBreakdown = useAnalyticsStore((state) => state.fetchReplyBreakdown);
  const invalidateReplyBreakdown = useAnalyticsStore((state) => state.invalidateReplyBreakdown);

  const campaignComparison = useAnalyticsStore((state) => state.campaignComparison);
  const campaignComparisonPage = useAnalyticsStore((state) => state.campaignComparisonPage);
  const campaignComparisonTotalPages = useAnalyticsStore((state) => state.campaignComparisonTotalPages);
  const isFetchingCampaignComparison = useAnalyticsStore((state) => state.isFetchingCampaignComparison);
  const fetchCampaignComparison = useAnalyticsStore((state) => state.fetchCampaignComparison);
  const invalidateCampaignComparison = useAnalyticsStore((state) => state.invalidateCampaignComparison);

  const campaignChart = useAnalyticsStore((state) => state.campaignChart);
  const isFetchingCampaignChart = useAnalyticsStore((state) => state.isFetchingCampaignChart);
  const fetchCampaignChart = useAnalyticsStore((state) => state.fetchCampaignChart);
  const invalidateCampaignChart = useAnalyticsStore((state) => state.invalidateCampaignChart);

  const isFetchingPeriodScoped =
    isFetchingOverview ||
    isFetchingSentVsReplies ||
    isFetchingReplyBreakdown ||
    isFetchingCampaignChart;

  useEffect(() => {
    void fetchOverview();
    void fetchSentVsReplies();
    void fetchReplyBreakdown();
    void fetchCampaignComparison();
    void fetchCampaignChart();
    return () => {
      invalidateOverview();
      invalidateSentVsReplies();
      invalidateReplyBreakdown();
      invalidateCampaignComparison();
      invalidateCampaignChart();
    };
  }, [
    fetchOverview,
    fetchSentVsReplies,
    fetchReplyBreakdown,
    fetchCampaignComparison,
    fetchCampaignChart,
    invalidateOverview,
    invalidateSentVsReplies,
    invalidateReplyBreakdown,
    invalidateCampaignComparison,
    invalidateCampaignChart
  ]);

  const overviewKpis = useMemo(
    () => (overview ? buildAnalyticsOverviewKpis(overview) : []),
    [overview]
  );
  const showOverviewSkeleton = isFetchingOverview && !overview;

  const sentVsRepliesChartData = useMemo(
    () => sentVsRepliesSeriesToChartData(sentVsReplies?.series),
    [sentVsReplies]
  );
  const sentVsRepliesSubtitle = getSentVsRepliesSubtitle(sentVsReplies, isFetchingSentVsReplies);
  const showSentVsRepliesSkeleton = isFetchingSentVsReplies && !sentVsReplies;

  const replyBreakdownChartData = useMemo(
    () => replyBreakdownSegmentsToChartData(replyBreakdown?.segments),
    [replyBreakdown]
  );
  const showReplyBreakdownSkeleton = isFetchingReplyBreakdown && !replyBreakdown;
  const showReplyBreakdownEmpty =
    replyBreakdownChartData.length === 0 || (replyBreakdown?.total ?? 0) === 0;

  const showCampaignComparisonSkeleton =
    isFetchingCampaignComparison && campaignComparison.length === 0;

  const { points: campaignChartPoints, campaigns: campaignChartMeta } = useMemo(
    () => campaignChartToLineChartData(campaignChart),
    [campaignChart]
  );
  const showCampaignChartSkeleton = isFetchingCampaignChart && !campaignChart;
  const showCampaignChartEmpty =
    campaignChartPoints.length === 0 ||
    campaignChartMeta.length === 0 ||
    !hasCampaignChartActivity(campaignChart);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Analytics</h2>
          <p className="text-sm text-muted-foreground">Performance across all campaigns</p>
        </div>
        <PeriodQuerySelect
          period={analyticsPeriod}
          customFrom={analyticsCustomFrom}
          customTo={analyticsCustomTo}
          options={PERIOD_QUERY_OPTIONS}
          disabled={isFetchingPeriodScoped}
          idPrefix="analytics"
          onPeriodChange={setAnalyticsPeriod}
          onCustomRangeApply={setAnalyticsCustomRange}
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {showOverviewSkeleton
          ? Array.from({ length: ANALYTICS_OVERVIEW_KPI_COUNT }, (_, i) => (
              <DashboardKpiCardSkeleton key={`analytics-overview-skeleton-${i}`} />
            ))
          : overviewKpis.map((kpi) => (
              <KPICard
                key={kpi.label}
                label={kpi.label}
                value={kpi.value}
                hint={kpi.hint}
                delta={kpi.delta}
                icon={kpi.icon}
                className={cn(isFetchingOverview && overview && "opacity-60")}
              />
            ))}
      </div>

      {/* Campaign Analytics — per-campaign performance over time */}
      <Card className="p-5 shadow-card">
        {showCampaignChartSkeleton ? (
          <AnalyticsCampaignChartSkeleton />
        ) : (
          <>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-bold">Campaign Analytics</h3>
                <p className="text-xs text-muted-foreground">Reply volume by campaign</p>
              </div>
              {campaignChartMeta.length > 0 ? (
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
                  {campaignChartMeta.map((c) => (
                    <span key={c.id} className="inline-flex items-center gap-1.5">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: c.color }}
                      />
                      {c.name}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <div
              className={cn(
                "mt-4 h-[300px]",
                isFetchingCampaignChart && campaignChart && "opacity-60"
              )}
            >
              {showCampaignChartEmpty ? (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  {ANALYTICS_CAMPAIGN_CHART_EMPTY_MESSAGE}
                </div>
              ) : (
                <ResponsiveContainer>
                  <LineChart data={campaignChartPoints} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      minTickGap={48}
                      tickFormatter={formatCampaignChartAxisDate}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CampaignChartTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    {campaignChartMeta.map((c) => (
                      <Line
                        key={c.id}
                        type="monotone"
                        dataKey={c.name}
                        stroke={c.color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
            {campaignChartMeta.length > 0 ? (
              <div
                className={cn(
                  "mt-5 grid gap-3",
                  campaignChartMeta.length === 1
                    ? "grid-cols-1"
                    : campaignChartMeta.length === 2
                      ? "grid-cols-2"
                      : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                )}
              >
                {campaignChartMeta.map((c) => (
                  <div key={c.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block h-2 w-2 shrink-0 rounded-full"
                        style={{ background: c.color }}
                      />
                      <p className="truncate text-xs font-medium text-muted-foreground">{c.name}</p>
                    </div>
                    <p className="mt-1 font-display text-lg font-bold">
                      {c.totalReplies.toLocaleString()}
                    </p>
                    <p className="text-[11px] text-muted-foreground">replies in period</p>
                  </div>
                ))}
              </div>
            ) : null}
          </>
        )}
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5 shadow-card">
          {showSentVsRepliesSkeleton ? (
            <AnalyticsSentVsRepliesChartSkeleton />
          ) : (
            <>
              <h3 className="font-display text-base font-bold">Emails Sent vs Replies</h3>
              <p className="text-xs text-muted-foreground">{sentVsRepliesSubtitle}</p>
              <div
                className={cn(
                  "mt-4 h-[280px]",
                  isFetchingSentVsReplies && sentVsReplies && "opacity-60"
                )}
              >
                {sentVsRepliesChartData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    {ANALYTICS_SENT_VS_REPLIES_EMPTY_MESSAGE}
                  </div>
                ) : (
                  <ResponsiveContainer>
                    <BarChart data={sentVsRepliesChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="week"
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="hsl(var(--muted-foreground))"
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip content={<SentVsRepliesTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="sent" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Sent" />
                      <Bar
                        dataKey="replies"
                        fill="hsl(var(--brand-deep))"
                        radius={[6, 6, 0, 0]}
                        name="Replies"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </>
          )}
        </Card>

        <Card className="p-5 shadow-card">
          {showReplyBreakdownSkeleton ? (
            <AnalyticsReplyBreakdownChartSkeleton />
          ) : (
            <>
              <div>
                <h3 className="font-display text-base font-bold">Reply Breakdown</h3>
                <p className="text-xs text-muted-foreground">Outreach status distribution</p>
              </div>
              <div
                className={cn(
                  "mt-4 h-[280px]",
                  isFetchingReplyBreakdown && replyBreakdown && "opacity-60"
                )}
              >
                {showReplyBreakdownEmpty ? (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    {ANALYTICS_REPLY_BREAKDOWN_EMPTY_MESSAGE}
                  </div>
                ) : (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={replyBreakdownChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={2}
                      >
                        {replyBreakdownChartData.map((segment) => (
                          <Cell key={segment.key} fill={segment.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<ReplyBreakdownTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </>
          )}
        </Card>
      </div>

      {/* Campaign comparison */}
      <Card className="overflow-hidden shadow-card">
        <div className="p-5">
          <h3 className="font-display text-base font-bold">Campaign Comparison</h3>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Campaign</TableHead>
              <TableHead>Leads</TableHead>
              <TableHead>Emails Sent</TableHead>
              <TableHead>Open Rate</TableHead>
              <TableHead>Reply Rate</TableHead>
              <TableHead>Meetings</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {showCampaignComparisonSkeleton ? (
              <TableRowsSkeleton
                rows={8}
                cells={[
                  { width: "w-40" },
                  { width: "w-10" },
                  { width: "w-12" },
                  { width: "w-12" },
                  { width: "w-28" },
                  { width: "w-10" },
                  { width: "w-16" }
                ]}
              />
            ) : null}
            {!showCampaignComparisonSkeleton && campaignComparison.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                  {ANALYTICS_CAMPAIGN_COMPARISON_EMPTY_MESSAGE}
                </TableCell>
              </TableRow>
            ) : null}
            {!showCampaignComparisonSkeleton
              ? campaignComparison.map((row) => (
                  <TableRow key={row.campaign_id} className="hover:bg-primary/5">
                    <TableCell className="font-medium">{row.campaign_name}</TableCell>
                    <TableCell>{row.leads.toLocaleString()}</TableCell>
                    <TableCell>{row.emails_sent.toLocaleString()}</TableCell>
                    <TableCell>{formatAnalyticsRatePercent(row.open_rate_percent)}</TableCell>
                    <TableCell>
                      <div className="flex min-w-[8.5rem] items-center gap-2.5">
                        <span className="font-mono text-xs tabular-nums">
                          {formatAnalyticsRatePercent(row.reply_rate_percent)}
                        </span>
                        <ReplySparkline values={row.reply_sparkline} />
                      </div>
                    </TableCell>
                    <TableCell>{row.meetings.toLocaleString()}</TableCell>
                    <TableCell>
                      <StatusPill status={row.status} />
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
        {campaignComparisonTotalPages > 1 && !showCampaignComparisonSkeleton ? (
          <TablePagination
            currentPage={campaignComparisonPage}
            totalPages={campaignComparisonTotalPages}
            onPageChange={(nextPage) => void fetchCampaignComparison({ page: nextPage })}
          />
        ) : null}
      </Card>

    </div>
  );
}
