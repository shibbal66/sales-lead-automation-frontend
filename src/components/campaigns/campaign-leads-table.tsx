import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TablePagination } from "@/components/layout/table-pagination";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  CAMPAIGN_LEAD_STATUSES,
  type CampaignLeadApiModel,
  type CampaignLeadStatus,
  type CampaignLeadsStatusFilter,
} from "@/types";
import { formatDateTime } from "@/lib/dateFormatting";
import { MailTemplatePreview } from "@/components/campaigns/mail-template-preview";
import { CampaignLeadsTableRowsSkeleton } from "@/components/skeletons/campaigns/campaign-leads-table-skeleton";

function formatCampaignLeadStatusLabel(status: CampaignLeadStatus): string {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

type CampaignLeadsTableProps = {
  leads: CampaignLeadApiModel[];
  total: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  statusFilter: CampaignLeadsStatusFilter;
  onStatusFilterChange: (value: CampaignLeadsStatusFilter) => void;
  onPageChange: (page: number) => void;
  onAssignClick: () => void;
  onEditLead: (lead: CampaignLeadApiModel) => void;
  onDeleteLead: (lead: CampaignLeadApiModel) => void;
};

export function CampaignLeadsTable({
  leads,
  total,
  currentPage,
  totalPages,
  isLoading,
  statusFilter,
  onStatusFilterChange,
  onPageChange,
  onAssignClick,
  onEditLead,
  onDeleteLead,
}: CampaignLeadsTableProps) {
  const skeletonRows = leads.length > 0 ? leads.length : 6;

  return (
    <>
      <div className="space-y-3 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-bold">Campaign Leads</h3>
            <p className="text-sm text-muted-foreground">
              {total} {statusFilter === "all" ? "assigned" : "matching"}
            </p>
          </div>
          <div className="flex items-end justify-end gap-2">
            <Button onClick={onAssignClick} size="sm">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onStatusFilterChange("all")}
            className={cn(
              "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
              statusFilter === "all"
                ? "border-primary bg-primary/15 text-brand-text"
                : "border-border text-muted-foreground hover:bg-muted",
            )}
          >
            All
          </button>
          {CAMPAIGN_LEAD_STATUSES.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onStatusFilterChange(option)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                statusFilter === option
                  ? "border-primary bg-primary/15 text-brand-text"
                  : "border-border text-muted-foreground hover:bg-muted",
              )}
            >
              {formatCampaignLeadStatusLabel(option)}
            </button>
          ))}
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Email</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Mail Template</TableHead>
            <TableHead>Sent At</TableHead>
            <TableHead>Error</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <CampaignLeadsTableRowsSkeleton rows={skeletonRows} />
          ) : null}
          {!isLoading && leads.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-8 text-center text-sm text-muted-foreground"
              >
                {statusFilter === "all"
                  ? "No leads assigned to this campaign yet."
                  : `No leads with status "${formatCampaignLeadStatusLabel(statusFilter)}".`}
              </TableCell>
            </TableRow>
          ) : null}
          {!isLoading
            ? leads.map((lead) => (
            <TableRow key={lead.id} className="hover:bg-primary/5">
              <TableCell className="max-w-[240px]">
                <p className="truncate text-sm font-medium">
                  {lead.lead_email?.trim() || "—"}
                </p>
                {lead.lead_name?.trim() ? (
                  <p className="truncate text-xs text-muted-foreground">
                    {lead.lead_name.trim()}
                  </p>
                ) : null}
              </TableCell>
              <TableCell>
                <StatusPill status={lead.status} />
              </TableCell>
              <TableCell className="max-w-[280px] text-sm text-muted-foreground">
                <MailTemplatePreview template={lead.mail_template} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDateTime(lead.sent_at)}
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                {lead.error_message || "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDateTime(lead.created_at)}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Open row actions"
                    >
                      <EllipsisVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEditLead(lead)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Update
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDeleteLead(lead)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
      <TablePagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </>
  );
}
