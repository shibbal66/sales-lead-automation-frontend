import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusPill } from "@/components/status-pill";
import { leads, type Lead, campaigns } from "@/lib/mock-data";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Plus, FileSpreadsheet, MoreVertical, Eye, Send, Trash2, Pencil, X, RefreshCw,
} from "lucide-react";

function Avatar({ name, size = 36 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div
      className="grid shrink-0 place-items-center rounded-full bg-gradient-brand text-xs font-semibold text-primary-foreground"
      style={{ width: size, height: size }}
    >
      {initials}
    </div>
  );
}

export default function Leads() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerLead, setDrawerLead] = useState<Lead | null>(null);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.company.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      const matchCampaign = campaignFilter === "all" || l.campaign === campaignFilter;
      return matchSearch && matchStatus && matchCampaign;
    });
  }, [search, statusFilter, campaignFilter]);

  const allChecked = filtered.length > 0 && filtered.every((l) => selected.has(l.id));
  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) filtered.forEach((l) => next.delete(l.id));
      else filtered.forEach((l) => next.add(l.id));
      return next;
    });
  };
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">All Leads</h2>
          <p className="text-sm text-muted-foreground">{leads.length} total · {filtered.length} shown</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline"><FileSpreadsheet className="h-4 w-4" /> Import from Google Sheets</Button>
          <Button><Plus className="h-4 w-4" /> Add Lead Manually</Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[240px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or company" className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={campaignFilter} onValueChange={setCampaignFilter}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Campaign" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All campaigns</SelectItem>
              {campaigns.map((c) => (<SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Table */}
      <Card className="overflow-hidden shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-10"><Checkbox checked={allChecked} onCheckedChange={toggleAll} /></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Campaign</TableHead>
              <TableHead>Enrichment</TableHead>
              <TableHead>Last Contacted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((l) => (
              <TableRow key={l.id} className="hover:bg-primary/5">
                <TableCell><Checkbox checked={selected.has(l.id)} onCheckedChange={() => toggleOne(l.id)} /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <Avatar name={l.name} size={28} />
                    <div>
                      <p className="text-sm font-medium leading-tight">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{l.title}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{l.company}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{l.email}</TableCell>
                <TableCell><StatusPill status={l.status} /></TableCell>
                <TableCell className="text-sm">{l.campaign ?? <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell>
                  <StatusPill status={l.enriched ? "Enriched" : "Pending"} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{l.lastContacted}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => setDrawerLead(l)}>
                      <Eye className="h-3.5 w-3.5" /> View
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem><Send className="h-3.5 w-3.5 mr-2" />Assign to Campaign</DropdownMenuItem>
                        <DropdownMenuItem><Pencil className="h-3.5 w-3.5 mr-2" />Edit</DropdownMenuItem>
                        <DropdownMenuItem><X className="h-3.5 w-3.5 mr-2" />Mark as Unsubscribed</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2" />Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Bulk action bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-border bg-popover px-4 py-3 shadow-elevated"
          >
            <span className="text-sm font-semibold">{selected.size} selected</span>
            <span className="h-5 w-px bg-border" />
            <Button variant="outline" size="sm">Assign to Campaign</Button>
            <Button variant="outline" size="sm">Export</Button>
            <Button variant="outline" size="sm" className="border-destructive/30 text-destructive hover:bg-destructive/10">
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelected(new Set())}>
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lead drawer */}
      <Sheet open={!!drawerLead} onOpenChange={(o) => !o && setDrawerLead(null)}>
        <SheetContent side="right" className="w-full sm:max-w-[480px] p-0">
          {drawerLead && (
            <div className="flex h-full flex-col">
              <div className="flex items-start gap-4 border-b border-border p-6">
                <Avatar name={drawerLead.name} size={56} />
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-xl font-bold">{drawerLead.name}</h3>
                  <p className="text-sm text-muted-foreground">{drawerLead.title} · {drawerLead.company}</p>
                  <p className="mt-1 text-sm text-brand-text">{drawerLead.email}</p>
                </div>
              </div>
              <Tabs defaultValue="overview" className="flex flex-1 flex-col overflow-hidden">
                <TabsList className="mx-6 mt-4 grid w-[calc(100%-3rem)] grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="emails">Emails</TabsTrigger>
                  <TabsTrigger value="enrichment">Enrichment</TabsTrigger>
                  <TabsTrigger value="activity">Activity</TabsTrigger>
                </TabsList>
                <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                  <TabsContent value="overview" className="m-0 space-y-3">
                    {[
                      { l: "Name", v: drawerLead.name },
                      { l: "Company", v: drawerLead.company },
                      { l: "Email", v: drawerLead.email },
                      { l: "Title", v: drawerLead.title },
                      { l: "Website", v: drawerLead.website },
                      { l: "Phone", v: drawerLead.phone },
                    ].map((f) => (
                      <div key={f.l} className="grid grid-cols-3 items-center gap-3 rounded-lg border border-border p-3">
                        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{f.l}</span>
                        <Input defaultValue={f.v} className="col-span-2 h-8" />
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="emails" className="m-0 space-y-3">
                    {[1,2,3].map((i) => (
                      <div key={i} className="rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold">Quick idea for {drawerLead.company}'s team</p>
                          <span className="text-xs text-muted-foreground">{i}d ago</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <StatusPill status="contacted" />
                          <span className="text-xs text-muted-foreground">Opened · No reply</span>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="enrichment" className="m-0 space-y-3">
                    <div className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold">AI-Generated Company Summary</h4>
                        <Button variant="outline" size="sm"><RefreshCw className="h-3.5 w-3.5" /> Re-enrich</Button>
                      </div>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {drawerLead.company} is a Series-B SaaS company (~120 employees) building modern infrastructure for revenue teams. Recent product launches include an AI assistant and a new analytics suite. Hiring signals indicate growth in GTM and engineering.
                      </p>
                      <ul className="mt-3 space-y-1.5 text-sm">
                        <li>• <span className="text-muted-foreground">Key insight:</span> Recently expanded SDR team after Series B</li>
                        <li>• <span className="text-muted-foreground">Tech stack:</span> Salesforce, Outreach, Gong</li>
                        <li>• <span className="text-muted-foreground">Best angle:</span> Time-to-research per lead, AI personalization</li>
                      </ul>
                    </div>
                  </TabsContent>
                  <TabsContent value="activity" className="m-0">
                    <ol className="relative space-y-3 border-l border-border pl-5">
                      {["Enrichment completed","Added to campaign Q2 Outbound — SaaS","Initial email sent","Email opened","Reply received"].map((t, i) => (
                        <li key={i} className="relative">
                          <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                          <p className="text-sm">{t}</p>
                          <p className="text-xs text-muted-foreground">{i + 1}d ago</p>
                        </li>
                      ))}
                    </ol>
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
