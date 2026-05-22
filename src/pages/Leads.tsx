import { useMemo, useState } from "react";
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
import { motion, AnimatePresence } from "framer-motion";
import { useLeadStore } from "@/store/lead/leadStore";
import { useLeadsPage } from "@/hooks/useLeadsPage";
import { mapLeadApiToListRow } from "@/lib/leadPresentation";
import type { LeadPresentationStatus } from "@/types";
import { LeadDetailSheet } from "@/components/leads/lead-detail-sheet";
import { LeadsTableSkeleton } from "@/components/skeletons/leads/leads-table-skeleton";
import { UserProfileAvatar } from "@/components/user-profile-avatar";
import { TablePagination } from "@/components/layout/table-pagination";
import {
  Search, Plus, FileSpreadsheet, MoreVertical, Eye, Send, Trash2, Pencil, X,
} from "lucide-react";


export default function Leads() {
  const apiLeads = useLeadStore((state) => state.leads);
  const selectedLead = useLeadStore((state) => state.selectedLead);
  const isFetchingDetail = useLeadStore((state) => state.isFetchingDetail);
  const fetchLeadById = useLeadStore((state) => state.fetchLeadById);
  const clearSelectedLead = useLeadStore((state) => state.clearSelectedLead);
  const {
    search,
    setSearch,
    countryFilter,
    industryFilter,
    handleCountryFilterChange,
    handleIndustryFilterChange,
    currentPage,
    totalPages,
    total,
    isFetching,
    handlePageChange
  } = useLeadsPage();
  const [statusFilter, setStatusFilter] = useState<"all" | LeadPresentationStatus>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const leads = useMemo(() => apiLeads.map(mapLeadApiToListRow), [apiLeads]);
  const selectedLeadRow = useMemo(
    () => (selectedLead ? mapLeadApiToListRow(selectedLead) : null),
    [selectedLead]
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
    if (statusFilter === "all") return leads;
    return leads.filter((lead) => lead.status === statusFilter);
  }, [statusFilter, leads]);

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
          <p className="text-sm text-muted-foreground">
            {total} total
            {statusFilter === "all" ? "" : ` · ${filtered.length} on this page after status filter`}
          </p>
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
          <Select value={countryFilter} onValueChange={handleCountryFilterChange}>
            <SelectTrigger className="w-[180px]"><SelectValue placeholder="Country" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All countries</SelectItem>
              <SelectItem value="United States">United States</SelectItem>
              <SelectItem value="Canada">Canada</SelectItem>
              <SelectItem value="United Kingdom">United Kingdom</SelectItem>
              <SelectItem value="India">India</SelectItem>
              <SelectItem value="Australia">Australia</SelectItem>
            </SelectContent>
          </Select>
          <Select value={industryFilter} onValueChange={handleIndustryFilterChange}>
            <SelectTrigger className="w-[220px]"><SelectValue placeholder="Industry" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All industries</SelectItem>
              <SelectItem value="SaaS">SaaS</SelectItem>
              <SelectItem value="software">Software</SelectItem>
              <SelectItem value="information technology & services">Information technology & services</SelectItem>
              <SelectItem value="transportation/trucking/railroad">Transportation / trucking / railroad</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
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
              <TableHead>Fit Score</TableHead>
              <TableHead>Last Contacted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching && leads.length === 0 ? <LeadsTableSkeleton /> : null}
            {filtered.map((l) => (
              <TableRow key={l.id} className="hover:bg-primary/5">
                <TableCell><Checkbox checked={selected.has(l.id)} onCheckedChange={() => toggleOne(l.id)} /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    <UserProfileAvatar name={l.name} size={28} />
                    <div>
                      <p className="text-sm font-medium leading-tight">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{l.title}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-sm">{l.company}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{l.email}</TableCell>
                <TableCell><StatusPill status={l.status} /></TableCell>
                <TableCell className="text-sm">{l.campaignName ?? <span className="text-muted-foreground">—</span>}</TableCell>
                <TableCell>
                  <StatusPill status={l.fitScore} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{l.lastContacted}</TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="default" size="sm" onClick={() => openLeadDrawer(l.id)}>
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
        <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
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
        selectedLead={selectedLead}
        selectedLeadRow={selectedLeadRow}
      />
    </div>
  );
}
