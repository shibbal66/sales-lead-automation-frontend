import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KPICard } from "@/components/kpi-card";
import { StatusPill } from "@/components/status-pill";
import { meetings } from "@/lib/mock-data";
import { CalendarCheck, CalendarDays, Percent, Link2, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function Meetings() {
  const [connected, setConnected] = useState(true);
  const [link, setLink] = useState("https://calendly.com/alex-rapidships/intro");

  return (
    <div className="space-y-6">
      {/* Calendly card */}
      {connected ? (
        <Card className="flex flex-wrap items-center gap-4 p-5 shadow-card">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-success/15 text-success">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-base font-bold">Calendly Connected</h3>
              <StatusPill status="Completed" className="!text-success" />
            </div>
            <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
              <Link2 className="h-3.5 w-3.5" /> {link}
              <a href={link} target="_blank" rel="noreferrer" className="text-brand-text hover:underline"><ExternalLink className="h-3 w-3" /></a>
            </p>
          </div>
          <Button variant="outline" onClick={() => setConnected(false)}>Change Link</Button>
        </Card>
      ) : (
        <Card className="p-6 shadow-card">
          <h3 className="font-display text-lg font-bold">Connect your Calendly link</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            We'll automatically detect when leads book using your link and match the booking to their lead record.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <div className="flex-1 space-y-1.5">
              <Label htmlFor="cal">Calendly URL</Label>
              <Input id="cal" placeholder="https://calendly.com/your-name/intro" value={link} onChange={(e) => setLink(e.target.value)} />
            </div>
            <Button className="self-end" onClick={() => { setConnected(true); toast({ title: "Calendly connected" }); }}>
              Save Link
            </Button>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KPICard label="Meetings This Week" value="9" delta={{ value: "3 vs last week", up: true }} icon={CalendarCheck} />
        <KPICard label="Meetings This Month" value="37" delta={{ value: "12% vs last month", up: true }} icon={CalendarDays} />
        <KPICard label="Conversion Rate" value="4.4%" delta={{ value: "0.6% vs last month", up: true }} icon={Percent} />
      </div>

      {/* Table */}
      <Card className="overflow-hidden shadow-card">
        <div className="flex items-center justify-between p-5">
          <h3 className="font-display text-base font-bold">Booked Meetings</h3>
          <Button variant="outline">Export CSV</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Lead</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Meeting Date & Time</TableHead>
              <TableHead>Booked At</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {meetings.map((m) => (
              <TableRow key={m.id} className="cursor-pointer hover:bg-primary/5">
                <TableCell className="font-medium">{m.leadName}</TableCell>
                <TableCell>{m.company}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{m.campaign}</TableCell>
                <TableCell className="text-sm">{m.date}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{m.bookedAt}</TableCell>
                <TableCell><StatusPill status={m.status} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
