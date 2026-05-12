import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/status-pill";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TablePagination } from "@/components/layout/table-pagination";
import { Plus } from "lucide-react";
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
};

export function CampaignLeadsTable({
  leads,
  total,
  currentPage,
  totalPages,
  isLoading,
  onPageChange,
  onAssignClick
}: CampaignLeadsTableProps) {
  return (
  <>
      <div className="flex items-center justify-between p-5">
        <div>
          <h3 className="font-display text-base font-bold">Campaign Leads</h3>
          <p className="text-sm text-muted-foreground">{total} assigned</p>
        </div>
        <Button onClick={onAssignClick}>
          <Plus className="h-4 w-4" /> Assign More Leads
        </Button>
      </div>
      {isLoading ? (
        <div className="px-5 pb-4 text-sm text-muted-foreground">Loading campaign leads...</div>
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
          </TableRow>
        </TableHeader>
        <TableBody>
          {!isLoading && leads.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                No leads assigned to this campaign yet.
              </TableCell>
            </TableRow>
          ) : null}
          {leads.map((lead) => (
            <TableRow key={lead.id} className="hover:bg-primary/5">
              <TableCell className="font-medium">{lead.lead_data_id}</TableCell>
              <TableCell><StatusPill status={lead.status} /></TableCell>
              <TableCell className="max-w-[280px] text-sm text-muted-foreground">
                <MailTemplatePreview template={lead.mail_template} />
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDateTime(lead.sent_at)}</TableCell>
              <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                {lead.error_message || "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">{formatDateTime(lead.created_at)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
  </>
  );
}
