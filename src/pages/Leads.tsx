import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusPill } from "@/components/status-pill";
import { motion, AnimatePresence } from "framer-motion";
import { useLeadStore } from "@/store/lead/leadStore";
import { useLeadsPage } from "@/hooks/useLeadsPage";
import { mapLeadApiToListRow } from "@/lib/leadPresentation";
import { LeadDetailSheet } from "@/components/leads/lead-detail-sheet";
import { LeadsFiltersBar } from "@/components/leads/leads-filters-bar";
import { LeadsTableSkeleton } from "@/components/skeletons/leads/leads-table-skeleton";
import { UserProfileAvatar } from "@/components/user-profile-avatar";
import { TablePagination } from "@/components/layout/table-pagination";
import {
  MoreVertical, Eye, Send, Trash2, Pencil, X, Loader2,
} from "lucide-react";


export default function Leads() {
  const apiLeads = useLeadStore((state) => state.leads);
  const selectedLead = useLeadStore((state) => state.selectedLead);
  const isFetchingDetail = useLeadStore((state) => state.isFetchingDetail);
  const fetchLeadById = useLeadStore((state) => state.fetchLeadById);
  const clearSelectedLead = useLeadStore((state) => state.clearSelectedLead);
  const {
    draftFilters,
    updateDraftFilter,
    handleApplyFilters,
    handleResetFilters,
    sortBy,
    sortOrder,
    handleSortByChange,
    handleSortOrderChange,
    hasActiveFilters,
    currentPage,
    totalPages,
    total,
    isFetching,
    handlePageChange,
  } = useLeadsPage();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openingLeadId, setOpeningLeadId] = useState<string | null>(null);
  const leads = useMemo(() => apiLeads.map(mapLeadApiToListRow), [apiLeads]);
  const selectedLeadRow = useMemo(() => {
    if (selectedLead) return mapLeadApiToListRow(selectedLead);
    if (!openingLeadId) return null;
    const fromList = apiLeads.find((lead) => String(lead.id) === openingLeadId);
    return fromList ? mapLeadApiToListRow(fromList) : null;
  }, [selectedLead, openingLeadId, apiLeads]);

  const openLeadDrawer = async (leadId: string) => {
    setOpeningLeadId(leadId);
    clearSelectedLead();
    setIsDrawerOpen(true);
    try {
      await fetchLeadById(leadId);
    } catch {
      setIsDrawerOpen(false);
      // Toast already handled in store.
    } finally {
      setOpeningLeadId(null);
    }
  };

  const allChecked = leads.length > 0 && leads.every((l) => selected.has(l.id));
  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) leads.forEach((l) => next.delete(l.id));
      else leads.forEach((l) => next.add(l.id));
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

  const skeletonRows = leads.length > 0 ? leads.length : 8;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-bold">All Leads</h2>
          <p className="text-sm text-muted-foreground">
            {total} total{hasActiveFilters ? " (filtered)" : ""}
          </p>
        </div>
      </div>

      <Card className="p-4 shadow-card">
        <LeadsFiltersBar
          draftFilters={draftFilters}
          sortBy={sortBy}
          sortOrder={sortOrder}
          isFetching={isFetching}
          hasActiveFilters={hasActiveFilters}
          onDraftFilterChange={updateDraftFilter}
          onSortByChange={handleSortByChange}
          onSortOrderChange={handleSortOrderChange}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      </Card>

      <Card className="overflow-hidden shadow-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              {/* <TableHead className="w-10"><Checkbox checked={allChecked} onCheckedChange={toggleAll} /></TableHead> */}
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              {/* <TableHead>Campaign</TableHead> */}
              <TableHead>Fit Score</TableHead>
              <TableHead>Contacted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? <LeadsTableSkeleton rows={skeletonRows} /> : null}
            {!isFetching && leads.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={9} className="py-10 text-center text-sm text-muted-foreground">
                  {hasActiveFilters
                    ? "No leads match your filters."
                    : "No leads found."}
                </TableCell>
              </TableRow>
            ) : null}
            {!isFetching
              ? leads.map((l) => (
                  <TableRow key={l.id} className="hover:bg-primary/5">
                    {/* <TableCell><Checkbox checked={selected.has(l.id)} onCheckedChange={() => toggleOne(l.id)} /></TableCell> */}
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <UserProfileAvatar name={l.name} size={28} />
                        <div>
                          <p className="max-w-[200px] text-sm font-medium leading-tight">{l.name}</p>
                          <p className="max-w-[200px] truncate text-xs text-muted-foreground">{l.title}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-sm">{l.company}</TableCell>
                    <TableCell className="max-w-[180px] truncate text-sm text-muted-foreground">{l.email}</TableCell>
                    <TableCell><StatusPill status={l.status} /></TableCell>
                    {/* <TableCell className="text-sm">{l.campaignName ?? <span className="text-muted-foreground">—</span>}</TableCell> */}
                    <TableCell>
                      <StatusPill status={l.fitScore} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{l.lastContacted}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="default"
                          size="sm"
                          disabled={openingLeadId === l.id}
                          onClick={() => openLeadDrawer(l.id)}
                        >
                          {openingLeadId === l.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                          ) : (
                            <Eye className="h-3.5 w-3.5" aria-hidden />
                          )}
                          {openingLeadId === l.id ? "Loading…" : "View"}
                        </Button>
                        {/* <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem><Send className="h-3.5 w-3.5 mr-2" />Assign to Campaign</DropdownMenuItem>
                            <DropdownMenuItem><Pencil className="h-3.5 w-3.5 mr-2" />Edit</DropdownMenuItem>
                            <DropdownMenuItem><X className="h-3.5 w-3.5 mr-2" />Mark as Unsubscribed</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive"><Trash2 className="h-3.5 w-3.5 mr-2" />Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu> */}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              : null}
          </TableBody>
        </Table>
        <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      </Card>

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
