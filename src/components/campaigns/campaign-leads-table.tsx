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
import { EllipsisVertical, Pencil, Plus, Shuffle, Trash2, FileSpreadsheet } from "lucide-react";
import type { CampaignLeadApiModel } from "@/types";
import { formatDateTime } from "@/lib/dateFormatting";
import { MailTemplatePreview } from "@/components/campaigns/mail-template-preview";

type CampaignLeadsTableProps = {
  leads: CampaignLeadApiModel[];
  total: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onAssignClick: () => void;
  onAssignRandomClick: () => void;
  isAssigningRandomLeads?: boolean;
  onEditLead: (lead: CampaignLeadApiModel) => void;
  onDeleteLead: (lead: CampaignLeadApiModel) => void;
};

export function CampaignLeadsTable({
  leads,
  total,
  currentPage,
  totalPages,
  isLoading,
  onPageChange,
  onAssignClick,
  onAssignRandomClick,
  isAssigningRandomLeads = false,
  onEditLead,
  onDeleteLead,
}: CampaignLeadsTableProps) {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <h3 className="font-display text-base font-bold">Campaign Leads</h3>
          <p className="text-sm text-muted-foreground">{total} assigned</p>
        </div>
        <div className="flex items-end justify-end gap-2">
          <Button onClick={onAssignClick} size="sm">
            <Plus className="h-4 w-4" /> Add
          </Button>
          <Button size="sm">
            <FileSpreadsheet className="h-4 w-4" /> Add Bulk
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            disabled={isAssigningRandomLeads}
            onClick={() => void onAssignRandomClick()}
          >
            <Shuffle className="h-4 w-4" />
           Assign Random
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div className="px-5 pb-4 text-sm text-muted-foreground">
          Loading campaign leads...
        </div>
      ) : null}
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40 hover:bg-muted/40">
            <TableHead>Lead ID</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Mail Template</TableHead>
            <TableHead>Sent At</TableHead>
            <TableHead>Error</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isLoading && leads.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="py-8 text-center text-sm text-muted-foreground"
              >
                No leads assigned to this campaign yet.
              </TableCell>
            </TableRow>
          ) : null}
          {leads.map((lead) => (
            <TableRow key={lead.id} className="hover:bg-primary/5">
              <TableCell className="font-medium">{lead.lead_data_id}</TableCell>
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
          ))}
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
