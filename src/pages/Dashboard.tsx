import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { KPICard } from "@/components/kpi-card";
import { StatusPill } from "@/components/status-pill";
import { Users, Send, MessageSquare, CalendarCheck } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { activity, campaigns, performanceSeries } from "@/lib/mock-data";

export default function Dashboard() {
  const kpis = [
    { label: "Total Leads", value: "2,148", delta: { value: "12% this week", up: true }, icon: Users },
    { label: "Emails Sent", value: "8,420", delta: { value: "8.3% vs last week", up: true }, icon: Send },
    { label: "Reply Rate", value: "14.6%", delta: { value: "1.2% vs last week", up: true }, icon: MessageSquare },
    { label: "Meetings Booked", value: "37", delta: { value: "5 this week", up: true }, icon: CalendarCheck },
  ];

  const activeCampaigns = campaigns.filter((c) => c.status === "running").slice(0, 5);

  return (
    <div className="space-y-6">
      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k, i) => (
          <motion.div key={k.label}
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
        <Card className="lg:col-span-3 p-5 shadow-card">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="font-display text-base font-bold">Campaign Performance</h3>
              <p className="text-xs text-muted-foreground">Last 30 days · all campaigns</p>
            </div>
            <Button variant="outline" size="sm">Last 30 days</Button>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer>
              <LineChart data={performanceSeries} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
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
                <Line type="monotone" dataKey="sent" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={false} name="Sent" />
                <Line type="monotone" dataKey="opens" stroke="hsl(var(--brand-deep))" strokeWidth={2} dot={false} name="Opens" />
                <Line type="monotone" dataKey="replies" stroke="hsl(var(--warning))" strokeWidth={2} dot={false} name="Replies" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-2 p-5 shadow-card">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="font-display text-base font-bold">Active Campaigns</h3>
              <p className="text-xs text-muted-foreground">{activeCampaigns.length} running</p>
            </div>
          </div>
          <div className="space-y-3">
            {activeCampaigns.map((c) => {
              const pct = Math.round((c.emailsSent / Math.max(c.totalEmails, 1)) * 100);
              return (
                <div key={c.id} className="rounded-xl border border-border bg-surface/40 p-3">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold">{c.name}</p>
                    <StatusPill status={c.status} />
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <Progress value={pct} className="h-1.5" />
                    <span className="shrink-0 text-[11px] font-medium text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{c.emailsSent.toLocaleString()} / {c.totalEmails.toLocaleString()} emails</span>
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]">View</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="p-5 shadow-card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-base font-bold">Recent Activity</h3>
          <Button variant="ghost" size="sm">View all</Button>
        </div>
        <ol className="relative space-y-4 border-l border-border pl-6">
          {activity.map((a) => (
            <li key={a.id} className="relative">
              <span className="absolute -left-[27px] top-1.5 grid h-3 w-3 place-items-center rounded-full bg-primary ring-4 ring-background" />
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm">{a.text}</p>
                <span className="shrink-0 text-xs text-muted-foreground">{a.at}</span>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
