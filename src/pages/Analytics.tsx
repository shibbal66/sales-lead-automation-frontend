import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KPICard } from "@/components/kpi-card";
import { Send, MailOpen, MessageSquare, CalendarCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { campaigns, replyBreakdown, weeklyBars, performanceSeries } from "@/lib/mock-data";
import { StatusPill } from "@/components/status-pill";
import { cn } from "@/lib/utils";

const ranges = ["7d", "30d", "90d", "Custom"] as const;
const pieColors = ["hsl(var(--primary))", "hsl(var(--brand-deep))", "hsl(var(--muted-foreground))", "hsl(var(--info))", "hsl(var(--border))"];

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
  const [range, setRange] = useState<(typeof ranges)[number]>("30d");
  const bounce = 1.4, spam = 0.3, unsub = 0.8;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Analytics</h2>
          <p className="text-sm text-muted-foreground">Performance across all campaigns</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-1">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-semibold transition-colors",
                range === r ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {r === "Custom" ? "Custom" : `Last ${r}`}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KPICard label="Emails Sent" value="8,420" delta={{ value: "8.3%", up: true }} icon={Send} />
        <KPICard label="Open Rate" value="62.8%" delta={{ value: "1.4%", up: true }} icon={MailOpen} />
        <KPICard label="Reply Rate" value="14.6%" delta={{ value: "1.2%", up: true }} icon={MessageSquare} />
        <KPICard label="Meetings Booked" value="37" delta={{ value: "5", up: true }} icon={CalendarCheck} />
      </div>

      {/* Campaign Analytics — per-campaign performance over time */}
      <Card className="p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-base font-bold">Campaign Analytics</h3>
            <p className="text-xs text-muted-foreground">Reply volume by campaign across the selected range</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
            {campaigns.slice(0, 4).map((c, i) => (
              <span key={c.id} className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: pieColors[i % pieColors.length] }}
                />
                {c.name}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4 h-[300px]">
          <ResponsiveContainer>
            <LineChart
              data={performanceSeries.map((p, idx) => ({
                day: p.day,
                ...campaigns.slice(0, 4).reduce((acc, c, i) => {
                  const base = (c.replyRate / 5) + Math.sin(idx / 2 + i) * 2 + i * 1.5;
                  acc[c.name] = Math.max(0, Math.round(base + idx * 0.4));
                  return acc;
                }, {} as Record<string, number>),
              }))}
              margin={{ top: 10, right: 10, bottom: 0, left: -10 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
              />
              {campaigns.slice(0, 4).map((c, i) => (
                <Line
                  key={c.id}
                  type="monotone"
                  dataKey={c.name}
                  stroke={pieColors[i % pieColors.length]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {campaigns.slice(0, 4).map((c, i) => (
            <div key={c.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ background: pieColors[i % pieColors.length] }}
                />
                <p className="truncate text-xs font-medium text-muted-foreground">{c.name}</p>
              </div>
              <p className="mt-1 font-display text-lg font-bold">{c.replyRate}%</p>
              <p className="text-[11px] text-muted-foreground">{c.emailsSent.toLocaleString()} sent · {c.leadsAssigned} leads</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="p-5 shadow-card">
          <h3 className="font-display text-base font-bold">Emails Sent vs Replies</h3>
          <p className="text-xs text-muted-foreground">By week, last 4 weeks</p>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer>
              <BarChart data={weeklyBars}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="week" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="sent" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} name="Sent" />
                <Bar dataKey="replies" fill="hsl(var(--brand-deep))" radius={[6, 6, 0, 0]} name="Replies" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5 shadow-card">
          <h3 className="font-display text-base font-bold">Reply Breakdown</h3>
          <p className="text-xs text-muted-foreground">Distribution of replies by classification</p>
          <div className="mt-4 h-[280px]">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={replyBreakdown} dataKey="value" nameKey="name" innerRadius={60} outerRadius={95} paddingAngle={2}>
                  {replyBreakdown.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
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
            {campaigns.map((c, i) => (
              <TableRow key={c.id} className="hover:bg-primary/5">
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>{c.leadsAssigned}</TableCell>
                <TableCell>{c.emailsSent}</TableCell>
                <TableCell>{(58 + i * 1.4).toFixed(1)}%</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{c.replyRate}%</span>
                    <div className="h-6 w-20">
                      <ResponsiveContainer>
                        <LineChart data={performanceSeries.slice(0, 8)}>
                          <Line type="monotone" dataKey="replies" stroke="hsl(var(--primary))" strokeWidth={1.5} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{Math.round(c.replyRate / 4)}</TableCell>
                <TableCell><StatusPill status={c.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Deliverability */}
      <Card className="p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-base font-bold">Deliverability Health</h3>
          <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2.5 py-0.5 text-xs font-semibold text-success">
            <CheckCircle2 className="h-3 w-3" /> Healthy
          </span>
        </div>
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <HealthBar label="Bounce Rate" value={bounce} threshold={{ warn: 2, bad: 4 }} />
          <HealthBar label="Spam Rate" value={spam} threshold={{ warn: 0.5, bad: 1 }} />
          <HealthBar label="Unsubscribe Rate" value={unsub} threshold={{ warn: 1, bad: 2 }} />
        </div>
        <div className="mt-5 flex items-start gap-3 rounded-lg border border-warning/30 bg-warning/5 p-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
          <div className="text-sm">
            <p className="font-semibold">All metrics within healthy thresholds.</p>
            <p className="mt-0.5 text-muted-foreground">Tip: keep daily sending volume under 200/day per inbox to maintain reputation.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
