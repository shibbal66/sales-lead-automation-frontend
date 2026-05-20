import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type MailTemplatePreviewProps = {
  template?: string | null;
  className?: string;
};

const EMPTY_TEMPLATE_LABEL = "None";

function getTemplateSummary(template: string): string {
  const subjectMatch = template.match(/^Subject:\s*(.+)/m);
  if (subjectMatch?.[1]) return subjectMatch[1].trim();
  const trimmed = template.trim();
  if (!trimmed) return EMPTY_TEMPLATE_LABEL;
  return trimmed.length > 80 ? `${trimmed.slice(0, 80)}...` : trimmed;
}

function getTemplateTitle(template: string): string {
  const subjectMatch = template.match(/^Subject:\s*(.+)/m);
  if (subjectMatch?.[1]) return subjectMatch[1].trim();
  return "Mail template";
}

export function MailTemplatePreview({ template, className }: MailTemplatePreviewProps) {
  const [open, setOpen] = useState(false);
  const trimmedTemplate = template?.trim() ?? "";
  const summary = useMemo(
    () => (trimmedTemplate ? getTemplateSummary(trimmedTemplate) : EMPTY_TEMPLATE_LABEL),
    [trimmedTemplate]
  );
  const title = useMemo(
    () => (trimmedTemplate ? getTemplateTitle(trimmedTemplate) : "Mail template"),
    [trimmedTemplate]
  );

  if (!trimmedTemplate) {
    return <span className={cn("text-sm text-muted-foreground", className)}>{EMPTY_TEMPLATE_LABEL}</span>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "max-w-[280px] truncate text-left text-sm text-brand-text underline-offset-4 hover:underline",
          className
        )}
        title="View full mail template"
      >
        {summary}
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <pre className="max-h-[60vh] overflow-auto scrollbar-thin whitespace-pre-wrap rounded-lg border border-border bg-muted/30 p-4 font-mono text-sm leading-relaxed text-foreground">
            {trimmedTemplate}
          </pre>
        </DialogContent>
      </Dialog>
    </>
  );
}
