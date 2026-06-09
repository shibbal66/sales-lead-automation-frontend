import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { KPICard } from "@/components/kpi-card";
import { DashboardKpiCardSkeleton } from "@/components/skeletons";
import { CancelMeetingAlert } from "@/components/meetings/cancel-meeting-alert";
import { CreateMeetingDialog } from "@/components/meetings/create-meeting-dialog";
import { MeetingsCalendarView } from "@/components/meetings/meetings-calendar-view";
import {
  MeetingsFiltersBar,
  meetingsFiltersFromStore,
  type MeetingsFilterDraft
} from "@/components/meetings/meetings-filters-bar";
import { MeetingsListView } from "@/components/meetings/meetings-list-view";
import { TablePagination } from "@/components/layout/table-pagination";
import {
  buildMeetingStatsKpis,
  isAllowedMeetingCalendarDay,
  MEETING_STATS_KPI_COUNT,
  type MeetingsViewMode
} from "@/lib/meetings";
import type { Meeting } from "@/types/meeting";
import { useCampaignStore } from "@/store/campaign/campaignStore";
import { useMeetingsStore } from "@/store/meetings/meetingsStore";
import { CalendarDays, Info, LayoutList } from "lucide-react";

export default function Meetings() {
  const [view, setView] = useState<MeetingsViewMode>("calendar");
  const [createOpen, setCreateOpen] = useState(false);
  const [createInitialDay, setCreateInitialDay] = useState<Date | undefined>();
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [meetingToCancel, setMeetingToCancel] = useState<Meeting | null>(null);

  const meetings = useMeetingsStore((state) => state.meetings);
  const calendarMeetings = useMeetingsStore((state) => state.calendarMeetings);
  const page = useMeetingsStore((state) => state.page);
  const totalPages = useMeetingsStore((state) => state.totalPages);
  const storeFilters = useMeetingsStore((state) => state.filters);
  const isFetching = useMeetingsStore((state) => state.isFetching);
  const isFetchingCalendar = useMeetingsStore((state) => state.isFetchingCalendar);
  const fetchMeetings = useMeetingsStore((state) => state.fetchMeetings);
  const fetchCalendarMeetings = useMeetingsStore((state) => state.fetchCalendarMeetings);
  const applyFilters = useMeetingsStore((state) => state.applyFilters);
  const cancelMeeting = useMeetingsStore((state) => state.cancelMeeting);
  const isCancelling = useMeetingsStore((state) => state.isCancelling);
  const invalidateMeetingsCache = useMeetingsStore((state) => state.invalidateCache);
  const meetingStats = useMeetingsStore((state) => state.meetingStats);
  const isFetchingMeetingStats = useMeetingsStore((state) => state.isFetchingMeetingStats);
  const fetchMeetingStats = useMeetingsStore((state) => state.fetchMeetingStats);

  const campaigns = useCampaignStore((state) => state.campaigns);
  const fetchCampaigns = useCampaignStore((state) => state.fetchCampaigns);

  const [filterDraft, setFilterDraft] = useState<MeetingsFilterDraft>(() =>
    meetingsFiltersFromStore({})
  );

  const filterDraftRef = useRef(filterDraft);
  filterDraftRef.current = filterDraft;

  useEffect(() => {
    if (campaigns.length === 0) {
      void fetchCampaigns(1, 100);
    }
  }, [campaigns.length, fetchCampaigns]);

  useEffect(() => {
    setFilterDraft((prev) => {
      const next = meetingsFiltersFromStore(storeFilters);
      if (
        prev.status === next.status &&
        prev.campaignId === next.campaignId &&
        prev.fromDate === next.fromDate &&
        prev.toDate === next.toDate
      ) {
        return prev;
      }
      return next;
    });
  }, [storeFilters]);

  const handleFilterChange = useCallback(
    (patch: Partial<MeetingsFilterDraft>) => {
      const next = { ...filterDraftRef.current, ...patch };
      setFilterDraft(next);
      void applyFilters(next);
    },
    [applyFilters]
  );

  const handleViewChange = useCallback((nextView: MeetingsViewMode) => {
    setView(nextView);
  }, []);

  const meetingStatsKpis = useMemo(
    () => (meetingStats ? buildMeetingStatsKpis(meetingStats) : []),
    [meetingStats]
  );
  const conversionDefinition = meetingStats?.meta.conversion_definition;
  const showStatsSkeleton = isFetchingMeetingStats && !meetingStats;

  // Refetch when opening the page; cache stays warm while switching list ↔ calendar.
  useEffect(() => {
    return () => invalidateMeetingsCache();
  }, [invalidateMeetingsCache]);

  useEffect(() => {
    void fetchMeetingStats();
  }, [fetchMeetingStats]);

  useEffect(() => {
    if (view === "calendar") {
      void fetchCalendarMeetings();
    } else {
      void fetchMeetings();
    }
  }, [view, fetchCalendarMeetings, fetchMeetings]);

  const filtersDisabled = isFetching || isFetchingCalendar;

  const openCreateDialog = (day?: Date) => {
    if (day && !isAllowedMeetingCalendarDay(day)) return;
    setEditingMeeting(null);
    setCreateInitialDay(day);
    setCreateOpen(true);
  };

  const openEditDialog = (meeting: Meeting) => {
    if (meeting.apiStatus === "cancelled") return;
    setEditingMeeting(meeting);
    setCreateInitialDay(undefined);
    setCreateOpen(true);
  };

  const openCancelDialog = (meeting: Meeting) => {
    setMeetingToCancel(meeting);
  };

  const handleConfirmCancel = async () => {
    if (!meetingToCancel) return;
    const cancelledId = meetingToCancel.id;
    const cancelled = await cancelMeeting(cancelledId);
    if (cancelled) {
      setMeetingToCancel(null);
      if (editingMeeting?.id === cancelledId) {
        setCreateOpen(false);
        setEditingMeeting(null);
        setCreateInitialDay(undefined);
      }
    }
  };

  const actionsDisabled = isCancelling;

  const handleCreateFromCalendar = (day: Date) => {
    openCreateDialog(day);
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {showStatsSkeleton
          ? Array.from({ length: MEETING_STATS_KPI_COUNT }, (_, i) => (
              <DashboardKpiCardSkeleton key={`meeting-stats-skeleton-${i}`} />
            ))
          : meetingStatsKpis.map((kpi) => (
              <KPICard
                key={kpi.label}
                label={kpi.label}
                value={kpi.value}
                hint={kpi.hint}
                delta={kpi.delta}
                icon={kpi.icon}
              
              />
            ))}
      </div>

      {/* Booked meetings — list or calendar (one at a time) */}
      <Card className="overflow-hidden shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
          <h3 className="font-display text-base font-bold">Booked Meetings</h3>
          <div className="flex flex-wrap items-center gap-2">
            <Tabs value={view} onValueChange={(v) => handleViewChange(v as MeetingsViewMode)}>
              <TabsList>
                <TabsTrigger value="calendar" className="gap-1.5">
                  <CalendarDays className="h-3.5 w-3.5" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-1.5">
                  <LayoutList className="h-3.5 w-3.5" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {view === "list" ? (
          <MeetingsFiltersBar
            view={view}
            draft={filterDraft}
            campaigns={campaigns}
            disabled={filtersDisabled}
            onDraftChange={handleFilterChange}
            onNewMeeting={() => openCreateDialog()}
          />
        ) : null}

        {view === "list" ? (
          <>
            <MeetingsListView
              meetings={meetings}
              isLoading={isFetching}
              onEditMeeting={openEditDialog}
              onDeleteMeeting={openCancelDialog}
              actionsDisabled={actionsDisabled}
            />
            {totalPages > 1 && !isFetching ? (
              <TablePagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(nextPage) => void fetchMeetings({ page: nextPage })}
              />
            ) : null}
          </>
        ) : (
          <MeetingsCalendarView
            meetings={calendarMeetings}
            isLoading={isFetchingCalendar}
            onCreateMeeting={handleCreateFromCalendar}
            onEditMeeting={openEditDialog}
            onDeleteMeeting={openCancelDialog}
            actionsDisabled={actionsDisabled}
          />
        )}
      </Card>

      <CreateMeetingDialog
        open={createOpen}
        meeting={editingMeeting}
        initialDay={createInitialDay}
        onCancelMeeting={openCancelDialog}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setCreateInitialDay(undefined);
            setEditingMeeting(null);
          }
        }}
      />

      <CancelMeetingAlert
        meeting={meetingToCancel}
        open={meetingToCancel !== null}
        onOpenChange={(open) => {
          if (!open) setMeetingToCancel(null);
        }}
        onConfirm={handleConfirmCancel}
        isLoading={isCancelling}
      />
    </div>
  );
}
