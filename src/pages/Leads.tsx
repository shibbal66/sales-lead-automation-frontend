import { useCallback, useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useLeadStore } from "@/store/lead/leadStore";
import { showApiErrorToast } from "@/lib/apiToast";
import type { LeadApiModel } from "@/types";
import { LeadDetailSheet } from "@/components/leads/lead-detail-sheet";
import {
  Search, Plus, FileSpreadsheet, MoreVertical, Eye, Send, Trash2, Pencil, X,
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
  const apiLeads = useLeadStore((state) => state.leads);
  const selectedLead = useLeadStore((state) => state.selectedLead);
  const isFetching = useLeadStore((state) => state.isFetching);
  const isFetchingDetail = useLeadStore((state) => state.isFetchingDetail);
  const fetchLeads = useLeadStore((state) => state.fetchLeads);
  const fetchLeadById = useLeadStore((state) => state.fetchLeadById);
  const clearSelectedLead = useLeadStore((state) => state.clearSelectedLead);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [campaignFilter, setCampaignFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    fetchLeads(1, 20).catch((error) => showApiErrorToast(error));
  }, [fetchLeads]);

  const mapApiStatusToUi = (outreachStatus: string, replyReceived: string): Lead["status"] => {
    const status = outreachStatus.toLowerCase();
    const replied = replyReceived.toLowerCase() === "yes";
    if (replied || status.includes("reply")) return "replied";
    if (status.includes("book")) return "booked";
    if (status.includes("unsub")) return "unsubscribed";
    if (status.includes("sent") || status.includes("contact")) return "contacted";
    return "new";
  };

  const toRelativeDate = (value?: string): string => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    const diffMs = Date.now() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return "just now";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const mapApiLeadToUiLead = useCallback(
    (lead: LeadApiModel): Lead => ({
      id: String(lead.id),
      name: lead.fullName || `${lead.firstName} ${lead.lastName}`.trim(),
      company: lead.company,
      email: lead.email,
      title: lead.title || "—",
      website: lead.domain || "—",
      phone: lead.companyPhone || "—",
      status: mapApiStatusToUi(lead.outreachStatus || "", lead.replyReceived || ""),
      campaign: undefined,
      enriched: lead.fitScore ? Number(lead.fitScore) > 0 : true,
      lastContacted: toRelativeDate(lead.emailSentDate || lead.created_at)
    }),
    []
  );

  const uiLeads: Lead[] = useMemo(() => apiLeads.map(mapApiLeadToUiLead), [apiLeads, mapApiLeadToUiLead]);
  const drawerLead = useMemo(
    () => (selectedLead ? mapApiLeadToUiLead(selectedLead) : null),
    [selectedLead, mapApiLeadToUiLead]
  );

  const openLeadDrawer = async (leadId: string) => {
    try {
      await fetchLeadById(leadId);
      setIsDrawerOpen(true);
    } catch {
      // Toast already handled in store.
    }
  };

  const filtered = useMemo(() => {
    return uiLeads.filter((l) => {
      const matchSearch =
        !search ||
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        l.company.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || l.status === statusFilter;
      const matchCampaign = campaignFilter === "all" || l.campaign === campaignFilter;
      return matchSearch && matchStatus && matchCampaign;
    });
  }, [search, statusFilter, campaignFilter, uiLeads]);

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
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">All Leads</h2>
          <p className="text-sm text-muted-foreground">{uiLeads.length} total · {filtered.length} shown</p>
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
        {isFetching ? (
          <div className="p-4 text-sm text-muted-foreground">Loading leads...</div>
        ) : null}
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
                    <Button variant="ghost" size="sm" onClick={() => openLeadDrawer(l.id)}>
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

      <LeadDetailSheet
        open={isDrawerOpen}
        onOpenChange={(open) => {
          setIsDrawerOpen(open);
          if (!open) clearSelectedLead();
        }}
        isFetchingDetail={isFetchingDetail}
        drawerLead={drawerLead}
        selectedLead={selectedLead}
      />
    </div>
  );
}
