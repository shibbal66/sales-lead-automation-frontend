import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignLeadsTableSkeleton } from "@/components/skeletons/campaigns/campaign-leads-table-skeleton";
import { FollowUpsSkeleton } from "@/components/skeletons/campaigns/follow-ups-skeleton";

function PillSkeletonRow({ count = 4 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Array.from({ length: count }, (_, index) => (
        <Skeleton key={index} className="h-7 w-[4.5rem] rounded-full" />
      ))}
    </div>
  );
}

function FieldSkeleton({
  labelWidth = "w-24",
  inputHeight = "h-10"
}: {
  labelWidth?: string;
  inputHeight?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Skeleton className={`h-4 ${labelWidth}`} />
      <Skeleton className={`w-full ${inputHeight}`} />
    </div>
  );
}

function CampaignSettingsPanelSkeleton() {
  return (
    <Card className="p-5 shadow-card">
      <Skeleton className="h-7 w-4/5 max-w-[240px]" />
      <div className="mt-4 space-y-4">
        <div className="space-y-2 rounded-lg border border-border p-3">
          <Skeleton className="h-4 w-28" />
          <PillSkeletonRow count={4} />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-3 w-full max-w-[280px]" />
        </div>

        <FieldSkeleton labelWidth="w-28" inputHeight="h-20" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <PillSkeletonRow count={3} />
        </div>

        <FieldSkeleton labelWidth="w-28" />
        <FieldSkeleton labelWidth="w-24" />

        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <PillSkeletonRow count={3} />
        </div>

        <FieldSkeleton labelWidth="w-28" inputHeight="h-12" />
      </div>
    </Card>
  );
}

function CampaignSenderDetailsCardSkeleton() {
  return (
    <Card className="p-5 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
      </div>
      <div className="mt-4 space-y-4">
        <FieldSkeleton labelWidth="w-36" />
        <FieldSkeleton labelWidth="w-28" />
        <FieldSkeleton labelWidth="w-32" />
      </div>
    </Card>
  );
}

function CampaignAiInstructionsCardSkeleton() {
  return (
    <Card className="p-5 shadow-card">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-5 w-36 rounded-full" />
      </div>
      <Skeleton className="mt-3 h-36 w-full" />
      <Skeleton className="mt-1 ml-auto h-3 w-16" />
    </Card>
  );
}

function CampaignEmailTemplatesCardSkeleton() {
  return (
    <Card className="p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-56" />
          <Skeleton className="h-4 w-full max-w-md" />
        </div>
        <Skeleton className="h-9 w-20 shrink-0" />
      </div>
      <div className="mt-4 space-y-2">
        {Array.from({ length: 2 }, (_, index) => (
          <div
            key={index}
            className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface/40 p-3"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-7 w-7 shrink-0 rounded-md" />
          </div>
        ))}
      </div>
    </Card>
  );
}

function CampaignFollowUpsCardSkeleton() {
  return (
    <Card className="p-5 shadow-card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-full max-w-sm" />
        </div>
      </div>
      <FollowUpsSkeleton count={2} />
      <Skeleton className="mt-4 h-9 w-44" />
    </Card>
  );
}

export function CampaignDetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading campaign">
      <div className="flex flex-col flex-wrap gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-9 w-44" />
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:justify-end">
          <Skeleton className="h-9 w-full sm:w-32" />
          <Skeleton className="h-9 w-full sm:w-36" />
          <Skeleton className="h-9 w-full sm:w-32" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px,1fr]">
        <CampaignSettingsPanelSkeleton />

        <div className="space-y-4">
          <CampaignSenderDetailsCardSkeleton />
          <CampaignAiInstructionsCardSkeleton />
          <CampaignEmailTemplatesCardSkeleton />
          <CampaignFollowUpsCardSkeleton />
        </div>
      </div>

      <Card className="overflow-hidden shadow-card">
        <CampaignLeadsTableSkeleton />
      </Card>
    </div>
  );
}
