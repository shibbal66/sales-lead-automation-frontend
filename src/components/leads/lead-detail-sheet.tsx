import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusPill } from "@/components/status-pill";
import { UserProfileAvatar } from "@/components/user-profile-avatar";
import { LeadDetailSheetSkeleton } from "@/components/skeletons/leads/lead-detail-sheet-skeleton";
import type { LeadApiModel } from "@/types";
import { formatSnakeCaseLabel, type LeadListRowViewModel } from "@/lib/leadPresentation";
import { ExternalLink, RefreshCw } from "lucide-react";
import { formatDateTime, formatRelativeDate, hasPresentableDate } from "@/lib/dateFormatting";
import { cn } from "@/lib/utils";

function isLeadValueEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  return String(value).trim() === "";
}

function formatLeadDateValue(value: string): string {
  return hasPresentableDate(value) ? formatDateTime(value) : String(value).trim();
}

function DetailRow({
  label,
  value,
  multiline,
  href,
  alwaysShow,
  className
}: {
  label: string;
  value: string;
  multiline?: boolean;
  href?: boolean;
  /** When true, row is shown even if value is empty (e.g. numeric id). */
  alwaysShow?: boolean;
  className?: string;
}) {
  if (!alwaysShow && isLeadValueEmpty(value)) return null;
  const display = alwaysShow && isLeadValueEmpty(value) ? "—" : String(value).trim();
  const isLink = Boolean(href && display && display !== "—" && /^https?:\/\//i.test(display));
  const useCapitalize = Boolean(className?.includes("capitalize"));
  const displayText =
    useCapitalize && display !== "—" && !isLink ? display.toLowerCase() : display;

  return (
    <div className="min-w-0 rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {multiline ? (
        <p
          className={cn(
            "mt-1.5 break-words whitespace-pre-wrap font-mono text-xs leading-relaxed text-foreground",
            className
          )}
        >
          {displayText}
        </p>
      ) : isLink ? (
        <a
          href={display}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mt-1.5 inline-flex max-w-full flex-wrap items-center gap-1 break-all text-sm font-medium text-brand-text hover:underline",
            className
          )}
        >
          {display}
          <ExternalLink className="h-3 w-3 shrink-0 opacity-70" aria-hidden />
        </a>
      ) : (
        <p className={cn("mt-1.5 break-words text-sm text-foreground", className)}>{displayText}</p>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h4 className="font-display text-sm font-bold text-brand-text border-b border-border/80 pb-2">{children}</h4>
  );
}

interface LeadDetailSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isFetchingDetail: boolean;
  selectedLead: LeadApiModel | null;
  selectedLeadRow: LeadListRowViewModel | null;
}

export function LeadDetailSheet({
  open,
  onOpenChange,
  isFetchingDetail,
  selectedLead,
  selectedLeadRow
}: LeadDetailSheetProps) {
  const sl = selectedLead;

  const showPersonCard = Boolean(
    sl &&
      [
        sl.fullName,
        sl.firstName,
        sl.lastName,
        sl.email,
        sl.emailStatus,
        sl.title,
        sl.seniority,
        sl.department
      ].some((v) => !isLeadValueEmpty(v))
  );

  const showCompanyCard = Boolean(
    sl &&
      [
        sl.company,
        sl.domain,
        sl.companyCity,
        sl.compantyState,
        sl.industry,
        sl.employees,
        sl.revenue,
        sl.companyPhone
      ].some((v) => !isLeadValueEmpty(v))
  );

  const showProfileCard =
    !!sl &&
    (!isLeadValueEmpty(sl.linkedin) || !isLeadValueEmpty(sl.notes));

  const showEmailOutreachCard = Boolean(
    sl &&
      [
        sl.emailSource,
        sl.emailSent,
        sl.emailSentDate,
        sl.replyReceived,
        sl.replyDate,
        sl.outreachStatus,
        sl.emailSubject,
        sl.emailBody
      ].some((v) => !isLeadValueEmpty(v))
  );

  const showLinkedInCard = Boolean(
    sl &&
      [
        sl.linkedinSent,
        sl.linkedSentDate,
        sl.linkedinMessage,
        sl.linkedin
      ].some((v) => !isLeadValueEmpty(v))
  );

  const showFitScoringCard = Boolean(
    sl &&
      (!isLeadValueEmpty(sl.fitTag) ||
        !isLeadValueEmpty(sl.fitScore) ||
        !isLeadValueEmpty(sl.fitReason))
  );

  const timelineItems = sl
    ? [
        { label: "Lead added", value: sl.dateAdded },
        { label: "Email sent date", value: sl.emailSentDate },
        { label: "Reply date", value: sl.replyDate },
        { label: "LinkedIn sent date", value: sl.linkedSentDate }
      ].filter((item) => !isLeadValueEmpty(item.value))
    : [];

  const sheetTitleLabel =
    isFetchingDetail && !selectedLead
      ? "Loading lead details"
      : selectedLeadRow
        ? `Lead details: ${selectedLeadRow.name}`
        : "Lead details";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0">
        <SheetTitle className="sr-only">{sheetTitleLabel}</SheetTitle>
        {isFetchingDetail && !selectedLead ? <LeadDetailSheetSkeleton /> : null}
        {selectedLeadRow && selectedLead ? (
          <div className="flex h-full flex-col bg-background">
            <div className="flex items-start gap-4 border-b border-border bg-muted/25 p-6">
              <UserProfileAvatar name={selectedLeadRow.name} size={56} />
              <div className="min-w-0 flex-1">
                <h3 className="font-display text-xl font-bold text-foreground">{selectedLeadRow.name}</h3>
                {[selectedLead.title, selectedLead.company].some((p) => !isLeadValueEmpty(p)) ? (
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {[selectedLead.title, selectedLead.company].filter((p) => !isLeadValueEmpty(p)).join(" · ")}
                  </p>
                ) : null}
                {!isLeadValueEmpty(selectedLead.email) ? (
                  <p className="mt-2 truncate text-sm font-medium text-brand-text">{selectedLead.email.trim()}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusPill status={selectedLeadRow.status} />
                  {!isLeadValueEmpty(selectedLead.outreachStatus) ? (
                    <span className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-brand-text">
                      Outreach: {selectedLead.outreachStatus.trim()}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col">
              <TabsList className="mx-4 mt-3 grid h-auto w-[calc(100%-2rem)] grid-cols-2 gap-1 rounded-lg bg-muted p-1 sm:mx-6 sm:w-[calc(100%-3rem)] sm:grid-cols-4">
                <TabsTrigger value="overview" className="text-xs">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="email" className="text-xs">
                  Email
                </TabsTrigger>
                <TabsTrigger value="linkedin" className="text-xs">
                  LinkedIn
                </TabsTrigger>
                <TabsTrigger value="fit" className="text-xs">
                  Fit / sources
                </TabsTrigger>
              </TabsList>
              <div className="flex-1 overflow-y-auto p-4 scrollbar-thin sm:p-6">
                <TabsContent value="overview" className="m-0 mt-4 space-y-4">
                  <Card className="space-y-3 border-border bg-card p-4 shadow-card">
                    <SectionTitle>Record</SectionTitle>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {/* <DetailRow label="ID" value={String(selectedLead.id)} alwaysShow /> */}
                      <DetailRow label="Date added" value={formatLeadDateValue(selectedLead.dateAdded)} />
                    </div>
                  </Card>

                  {showPersonCard ? (
                    <Card className="space-y-3 border-border bg-card p-4 shadow-card">
                      <SectionTitle>Person</SectionTitle>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <DetailRow label="Full name" value={selectedLead.fullName} />
                        {/* <DetailRow label="First name" value={selectedLead.firstName} /> */}
                        {/* <DetailRow label="Last name" value={selectedLead.lastName} /> */}
                        <DetailRow label="Email" value={selectedLead.email} />
                        <DetailRow label="Email status" value={selectedLead.emailStatus} className="capitalize" />
                        <DetailRow label="Title" value={selectedLead.title} />
                        <DetailRow label="Seniority" value={selectedLead.seniority} className="capitalize" />
                        <DetailRow
                          label="Department"
                          value={formatSnakeCaseLabel(selectedLead.department)}
                        />
                      </div>
                    </Card>
                  ) : null}

                  {!isLeadValueEmpty(selectedLead.city) ||
                  !isLeadValueEmpty(selectedLead.state) ||
                  !isLeadValueEmpty(selectedLead.country) ? (
                    <Card className="space-y-3 border-border bg-card p-4 shadow-card">
                      <SectionTitle>Location</SectionTitle>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <DetailRow label="City" value={selectedLead.city} />
                        <DetailRow label="State" value={selectedLead.state} />
                        <DetailRow label="Country" value={selectedLead.country} />
                      </div>
                    </Card>
                  ) : null}

                  {showCompanyCard ? (
                    <Card className="space-y-3 border-border bg-card p-4 shadow-card">
                      <SectionTitle>Company</SectionTitle>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <DetailRow label="Company" value={selectedLead.company} />
                        <DetailRow label="Domain" value={selectedLead.domain} />
                        <DetailRow label="Company city" value={selectedLead.companyCity} />
                        <DetailRow label="Company state (API)" value={selectedLead.compantyState} />
                        <DetailRow label="Industry" value={selectedLead.industry} className="capitalize" />
                        <DetailRow label="Employees" value={selectedLead.employees} />
                        <DetailRow label="Revenue" value={selectedLead.revenue} />
                        <DetailRow label="Company phone" value={selectedLead.companyPhone} />
                      </div>
                    </Card>
                  ) : null}

                  {showProfileCard ? (
                    <Card className="space-y-3 border-border bg-card p-4 shadow-card">
                      <SectionTitle>Profile & notes</SectionTitle>
                      <div className="grid gap-2">
                        <DetailRow label="Notes" value={selectedLead.notes} multiline />
                      </div>
                    </Card>
                  ) : null}
                </TabsContent>

                <TabsContent value="email" className="m-0 mt-4 space-y-4">
                  {showEmailOutreachCard ? (
                    <Card className="space-y-3 border-border bg-card p-4 shadow-card">
                      <SectionTitle>Email outreach</SectionTitle>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <DetailRow label="Email source" value={selectedLead.emailSource} />
                        <DetailRow label="Email sent" value={selectedLead.emailSent} />
                        <DetailRow
                          label="Email sent date"
                          value={formatLeadDateValue(selectedLead.emailSentDate)}
                        />
                        <DetailRow label="Reply received" value={selectedLead.replyReceived} />
                        <DetailRow label="Reply date" value={formatLeadDateValue(selectedLead.replyDate)} />
                        <DetailRow label="Outreach status" value={selectedLead.outreachStatus} className="capitalize" />
                      </div>
                      <DetailRow label="Email subject" value={selectedLead.emailSubject} />
                      {!isLeadValueEmpty(selectedLead.emailBody) ? (
                        <div className="rounded-lg border border-border bg-muted/20 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Email body
                          </p>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                            {String(selectedLead.emailBody ?? "").trim()}
                          </p>
                        </div>
                      ) : null}
                      {!isLeadValueEmpty(selectedLead.emailSentDate) &&
                      hasPresentableDate(selectedLead.emailSentDate) ? (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>Relative sent:</span>
                          <span className="font-medium text-brand-text">
                            {formatRelativeDate(selectedLead.emailSentDate)}
                          </span>
                        </div>
                      ) : null}
                    </Card>
                  ) : null}
                </TabsContent>

                <TabsContent value="linkedin" className="m-0 mt-4 space-y-4">
                  {showLinkedInCard ? (
                    <Card className="space-y-3 border-border bg-card p-4 shadow-card">
                      <SectionTitle>LinkedIn outreach</SectionTitle>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <DetailRow label="LinkedIn sent" value={selectedLead.linkedinSent} />
                        <DetailRow
                          label="LinkedIn sent date"
                          value={formatLeadDateValue(selectedLead.linkedSentDate)}
                        />
                      </div>
                      {!isLeadValueEmpty(selectedLead.linkedinMessage) ? (
                        <div className="rounded-lg border border-border bg-muted/20 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            LinkedIn message
                          </p>
                          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                            {String(selectedLead.linkedinMessage ?? "").trim()}
                          </p>
                        </div>
                      ) : null}
                      <DetailRow label="Profile URL" value={selectedLead.linkedin} href />
                    </Card>
                  ) : null}
                </TabsContent>

                <TabsContent value="fit" className="m-0 mt-4 space-y-4">
                  {showFitScoringCard ? (
                    <Card className="space-y-3 border-border bg-card p-4 shadow-card">
                      <div className="flex items-start">
                        <SectionTitle>Fit scoring</SectionTitle>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <DetailRow label="Fit tag" value={selectedLead.fitTag} />
                        <DetailRow label="Fit score" value={selectedLead.fitScore} />
                      </div>
                      {!isLeadValueEmpty(selectedLead.fitReason) ? (
                        <div className="rounded-lg border border-border bg-muted/20 p-3">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                            Fit reason
                          </p>
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {String(selectedLead.fitReason ?? "").trim()}
                          </p>
                        </div>
                      ) : null}
                    </Card>
                  ) : null}

                  {timelineItems.length ? (
                    <Card className="space-y-3 border-border bg-card p-4 shadow-card">
                      <SectionTitle>Activity timeline</SectionTitle>
                      <ol className="relative space-y-3 border-l border-primary/25 pl-5">
                        {timelineItems.map((item, i) => (
                          <li key={`${item.label}-${i}`} className="relative">
                            <span className="absolute -left-[22px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                            <p className="text-sm font-medium text-foreground">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{formatLeadDateValue(String(item.value))}</p>
                            {item.value?.trim() && hasPresentableDate(item.value) ? (
                              <p className="mt-0.5 text-[10px] text-brand-text/80">
                                {formatRelativeDate(item.value)}
                              </p>
                            ) : null}
                          </li>
                        ))}
                      </ol>
                    </Card>
                  ) : null}
                </TabsContent>
              </div>
            </Tabs>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}
