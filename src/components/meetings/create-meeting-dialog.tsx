import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { TimePicker } from "@/components/ui/time-picker";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  formatDatetimeLocalFromDate,
  isoToDatetimeLocalValue,
  parseDatetimeLocalInput
} from "@/lib/dateFormatting";
import { MEETING_STATUS_FORM_OPTIONS } from "@/lib/meetings/filters";
import { useCampaignStore } from "@/store/campaign/campaignStore";
import { useMeetingsStore } from "@/store/meetings/meetingsStore";
import type { CampaignLeadApiModel } from "@/types/campaign";
import type { Meeting, MeetingApiStatus } from "@/types/meeting";
import {
  buildCreateMeetingPayload,
  buildUpdateMeetingPayload,
  createMeetingSchema,
  sanitizeMeetingTitleInput,
  updateMeetingSchema,
  type CreateMeetingFormValues,
  type UpdateMeetingFormValues
} from "@/validators/meeting";

const EMPTY_CAMPAIGN = "__none__";
const EMPTY_LEAD = "__none__";

function getCampaignLeadOptionName(lead: CampaignLeadApiModel): string {
  return lead.lead_name?.trim() || lead.lead_email?.trim() || "Unnamed lead";
}

function getCampaignLeadOptionCompany(lead: CampaignLeadApiModel): string | null {
  const company = lead.lead_company?.trim();
  return company || null;
}

type CreateMeetingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, dialog runs in edit mode (PATCH / DELETE). */
  meeting?: Meeting | null;
  /** Pre-fill start/end on this calendar day (local time). */
  initialDay?: Date;
  /** Opens the shared cancel confirmation (e.g. from Meetings page). */
  onCancelMeeting?: (meeting: Meeting) => void;
};

type FormState = {
  title: string;
  description: string;
  startLocal: string;
  endLocal: string;
  attendee_email: string;
  status: MeetingApiStatus;
  campaign_id: string;
  campaign_lead_id: string;
  sync_google: boolean;
  add_google_meet: boolean;
};

type FormErrors = Partial<Record<keyof FormState | "form", string>>;

function defaultFormState(initialDay?: Date): FormState {
  const start = new Date();
  if (initialDay) {
    start.setFullYear(initialDay.getFullYear(), initialDay.getMonth(), initialDay.getDate());
    start.setHours(9, 0, 0, 0);
  } else {
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
  }
  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30);

  return {
    title: "",
    description: "",
    startLocal: formatDatetimeLocalFromDate(start),
    endLocal: formatDatetimeLocalFromDate(end),
    attendee_email: "",
    status: "scheduled",
    campaign_id: EMPTY_CAMPAIGN,
    campaign_lead_id: EMPTY_LEAD,
    sync_google: true,
    add_google_meet: true
  };
}

function formStateFromMeeting(meeting: Meeting): FormState {
  const status: MeetingApiStatus =
    meeting.apiStatus === "completed" ? "completed" : "scheduled";

  return {
    title: sanitizeMeetingTitleInput(meeting.leadName),
    description: meeting.description ?? "",
    startLocal: isoToDatetimeLocalValue(meeting.meetingAt),
    endLocal: isoToDatetimeLocalValue(meeting.endAt),
    attendee_email: meeting.company,
    status,
    campaign_id: EMPTY_CAMPAIGN,
    campaign_lead_id: EMPTY_LEAD,
    sync_google: false,
    add_google_meet: false
  };
}

function getTimePart(datetimeLocal: string): string {
  const d = parseDatetimeLocalInput(datetimeLocal);
  if (!d) return "09:00";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function mergeDayAndTime(day: Date, time: string): string {
  const match = /^(\d{1,2}):(\d{2})$/.exec(time.trim());
  let h = 9;
  let m = 0;
  if (match) {
    h = Math.min(23, Math.max(0, Number.parseInt(match[1], 10)));
    m = Math.min(59, Math.max(0, Number.parseInt(match[2], 10)));
  }
  return formatDatetimeLocalFromDate(
    new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m, 0, 0)
  );
}

function toCreateSchemaInput(form: FormState): CreateMeetingFormValues {
  return {
    title: form.title,
    description: form.description || undefined,
    startLocal: form.startLocal,
    endLocal: form.endLocal,
    attendee_email: form.attendee_email,
    campaign_id: form.campaign_id === EMPTY_CAMPAIGN ? undefined : form.campaign_id,
    campaign_lead_id: form.campaign_lead_id === EMPTY_LEAD ? undefined : form.campaign_lead_id,
    sync_google: form.sync_google,
    add_google_meet: form.add_google_meet
  };
}

function toUpdateSchemaInput(form: FormState): UpdateMeetingFormValues {
  return {
    title: form.title,
    description: form.description || undefined,
    startLocal: form.startLocal,
    endLocal: form.endLocal,
    attendee_email: form.attendee_email,
    status: form.status
  };
}

export function CreateMeetingDialog({
  open,
  onOpenChange,
  meeting,
  initialDay,
  onCancelMeeting
}: CreateMeetingDialogProps) {
  const isEditMode = meeting != null;
  const isCalendarDayMode = !isEditMode && initialDay != null;
  const createMeeting = useMeetingsStore((s) => s.createMeeting);
  const updateMeeting = useMeetingsStore((s) => s.updateMeeting);
  const isCreating = useMeetingsStore((s) => s.isCreating);
  const isUpdating = useMeetingsStore((s) => s.isUpdating);
  const isCancelling = useMeetingsStore((s) => s.isCancelling);
  const isSubmitting = isCreating || isUpdating;
  const campaigns = useCampaignStore((s) => s.campaigns);
  const fetchCampaigns = useCampaignStore((s) => s.fetchCampaigns);
  const campaignLeads = useCampaignStore((s) => s.campaignLeads);
  const fetchCampaignLeads = useCampaignStore((s) => s.fetchCampaignLeads);
  const clearCampaignLeads = useCampaignStore((s) => s.clearCampaignLeads);

  const [form, setForm] = useState<FormState>(defaultFormState);
  const [errors, setErrors] = useState<FormErrors>({});

  const selectedCampaignId = form.campaign_id === EMPTY_CAMPAIGN ? "" : form.campaign_id;
  const selectedCampaignLead = useMemo(() => {
    if (form.campaign_lead_id === EMPTY_LEAD) return null;
    return campaignLeads.find((lead) => lead.id === form.campaign_lead_id) ?? null;
  }, [form.campaign_lead_id, campaignLeads]);
  const isAlreadyCancelled = meeting?.apiStatus === "cancelled";

  useEffect(() => {
    if (!open) return;
    setForm(meeting ? formStateFromMeeting(meeting) : defaultFormState(initialDay));
    setErrors({});
    if (!meeting) void fetchCampaigns(1, 100);
  }, [open, fetchCampaigns, initialDay, meeting]);

  useEffect(() => {
    if (!open || isEditMode || !selectedCampaignId) {
      if (!isEditMode) clearCampaignLeads();
      return;
    }
    void fetchCampaignLeads(selectedCampaignId, { page: 1, limit: 100 });
  }, [open, isEditMode, selectedCampaignId, fetchCampaignLeads, clearCampaignLeads]);

  const campaignNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of campaigns) {
      if (c.id) map.set(c.id, c.name);
    }
    return map;
  }, [campaigns]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode && meeting) {
      const parsed = updateMeetingSchema.safeParse(toUpdateSchemaInput(form));
      if (!parsed.success) {
        const fieldErrors = parsed.error.flatten().fieldErrors;
        setErrors({
          title: fieldErrors.title?.[0],
          description: fieldErrors.description?.[0],
          startLocal: fieldErrors.startLocal?.[0],
          endLocal: fieldErrors.endLocal?.[0],
          attendee_email: fieldErrors.attendee_email?.[0],
          status: fieldErrors.status?.[0],
          form: parsed.error.flatten().formErrors[0]
        });
        return;
      }
      setErrors({});
      const payload = buildUpdateMeetingPayload(parsed.data);
      const updated = await updateMeeting(meeting.id, payload, {
        campaignName: meeting.campaign !== "—" ? meeting.campaign : undefined
      });
      if (updated) onOpenChange(false);
      return;
    }

    const parsed = createMeetingSchema.safeParse(toCreateSchemaInput(form));
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      setErrors({
        title: fieldErrors.title?.[0],
        description: fieldErrors.description?.[0],
        startLocal: fieldErrors.startLocal?.[0],
        endLocal: fieldErrors.endLocal?.[0],
        attendee_email: fieldErrors.attendee_email?.[0],
        campaign_id: fieldErrors.campaign_id?.[0],
        campaign_lead_id: fieldErrors.campaign_lead_id?.[0],
        form: parsed.error.flatten().formErrors[0]
      });
      return;
    }
    setErrors({});
    const payload = buildCreateMeetingPayload(parsed.data);
    const created = await createMeeting(payload, {
      campaignName: parsed.data.campaign_id
        ? campaignNameById.get(parsed.data.campaign_id)
        : undefined
    });
    if (created) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto scrollbar-thin">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit meeting" : "Schedule a meeting"}</DialogTitle>
            {isCalendarDayMode && initialDay ? (
              <p className="text-sm text-muted-foreground">{format(initialDay, "EEEE, MMMM d, yyyy")}</p>
            ) : null}
          </DialogHeader>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="meeting-title">Title <span className="text-xs text-red-500">*</span></Label>
              <Input
                id="meeting-title"
                value={form.title}
                onChange={(e) => {
                  const title = sanitizeMeetingTitleInput(e.target.value);
                  setForm((f) => ({ ...f, title }));
                  if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                placeholder="Intro call with Acme"
              />
              {errors.title ? <p className="text-xs text-destructive">{errors.title}</p> : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="meeting-description">Description</Label>
              <Textarea
                id="meeting-description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional agenda or notes"
                rows={3}
              />
              {errors.description ? (
                <p className="text-xs text-destructive">{errors.description}</p>
              ) : null}
            </div>

            {isCalendarDayMode && initialDay ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="meeting-start-time">Start time</Label>
                  <TimePicker
                    id="meeting-start-time"
                    value={getTimePart(form.startLocal)}
                    onChange={(time) =>
                      setForm((f) => ({
                        ...f,
                        startLocal: mergeDayAndTime(initialDay, time || "09:00")
                      }))
                    }
                    minuteStep={5}
                    showClear={false}
                  />
                  {errors.startLocal ? (
                    <p className="text-xs text-destructive">{errors.startLocal}</p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="meeting-end-time">End time</Label>
                  <TimePicker
                    id="meeting-end-time"
                    value={getTimePart(form.endLocal)}
                    onChange={(time) =>
                      setForm((f) => ({
                        ...f,
                        endLocal: mergeDayAndTime(initialDay, time || "09:30")
                      }))
                    }
                    minuteStep={5}
                    showClear={false}
                  />
                  {errors.endLocal ? <p className="text-xs text-destructive">{errors.endLocal}</p> : null}
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="meeting-start">Start</Label>
                  <DateTimePicker
                    id="meeting-start"
                    value={form.startLocal}
                    onChange={(startLocal) => setForm((f) => ({ ...f, startLocal }))}
                  />
                  {errors.startLocal ? (
                    <p className="text-xs text-destructive">{errors.startLocal}</p>
                  ) : null}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="meeting-end">End</Label>
                  <DateTimePicker
                    id="meeting-end"
                    value={form.endLocal}
                    onChange={(endLocal) => setForm((f) => ({ ...f, endLocal }))}
                  />
                  {errors.endLocal ? <p className="text-xs text-destructive">{errors.endLocal}</p> : null}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="meeting-attendee">Attendee email <span className="text-xs text-red-500">*</span></Label>
              <Input
                id="meeting-attendee"
                type="email"
                value={form.attendee_email}
                onChange={(e) => setForm((f) => ({ ...f, attendee_email: e.target.value }))}
                placeholder="lead@company.com"
              />
              {errors.attendee_email ? (
                <p className="text-xs text-destructive">{errors.attendee_email}</p>
              ) : null}
            </div>

            {isEditMode && isAlreadyCancelled ? (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Input value="Cancelled" disabled readOnly />
              </div>
            ) : null}
            {isEditMode && !isAlreadyCancelled ? (
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(status) =>
                    setForm((f) => ({ ...f, status: status as MeetingApiStatus }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEETING_STATUS_FORM_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status ? <p className="text-xs text-destructive">{errors.status}</p> : null}
              </div>
            ) : null}
            {!isEditMode ? (
              <>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label>Campaign (optional)</Label>
                    <Select
                      value={form.campaign_id}
                      onValueChange={(campaign_id) =>
                        setForm((f) => ({
                          ...f,
                          campaign_id,
                          campaign_lead_id: EMPTY_LEAD
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select campaign" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={EMPTY_CAMPAIGN}>None</SelectItem>
                        {campaigns.map((c) => (
                          <SelectItem key={c.id} value={c.id!}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.campaign_id ? (
                      <p className="text-xs text-destructive">{errors.campaign_id}</p>
                    ) : null}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Campaign lead (optional)</Label>
                    <Select
                      value={form.campaign_lead_id}
                      disabled={!selectedCampaignId}
                      onValueChange={(campaign_lead_id) =>
                        setForm((f) => ({ ...f, campaign_lead_id }))
                      }
                    >
                      <SelectTrigger className="h-auto min-h-10 py-2">
                        <SelectValue
                          placeholder={selectedCampaignId ? "Select lead" : "Select campaign first"}
                        >
                          {selectedCampaignLead ? (
                            <span className="flex flex-col items-start gap-0.5 text-left">
                              <span className="truncate font-medium leading-tight">
                                {getCampaignLeadOptionName(selectedCampaignLead)}
                              </span>
                              {getCampaignLeadOptionCompany(selectedCampaignLead) ? (
                                <span className="truncate text-xs font-normal">
                                  {getCampaignLeadOptionCompany(selectedCampaignLead)}
                                </span>
                              ) : null}
                            </span>
                          ) : null}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={EMPTY_LEAD}>None</SelectItem>
                        {campaignLeads.map((lead) => {
                          const company = getCampaignLeadOptionCompany(lead);
                          const name = getCampaignLeadOptionName(lead);
                          return (
                            <SelectItem
                              key={lead.id}
                              value={lead.id}
                              textValue={company ? `${name} ${company}` : name}
                              className="py-2"
                            >
                              <span className="flex flex-col items-start gap-0.5">
                                <span className="font-medium leading-tight">{name}</span>
                                {company ? (
                                  <span className="text-xs truncate text-muted-foreground">{company}</span>
                                ) : null}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    {errors.campaign_lead_id ? (
                      <p className="text-xs text-destructive">{errors.campaign_lead_id}</p>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Sync to Google Calendar</p>
                      <p className="text-xs text-muted-foreground">
                        Creates a calendar event when Google is connected.
                      </p>
                    </div>
                    <Switch
                      checked={form.sync_google}
                      onCheckedChange={(sync_google) => setForm((f) => ({ ...f, sync_google }))}
                    />
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium">Add Google Meet link</p>
                      <p className="text-xs text-muted-foreground">Requires calendar sync.</p>
                    </div>
                    <Switch
                      checked={form.add_google_meet}
                      disabled={!form.sync_google}
                      onCheckedChange={(add_google_meet) =>
                        setForm((f) => ({ ...f, add_google_meet }))
                      }
                    />
                  </div>
                </div>
              </>
            ) : null}

            {errors.form ? <p className="text-sm text-destructive">{errors.form}</p> : null}

            <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
              {isEditMode && !isAlreadyCancelled && onCancelMeeting && meeting ? (
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full sm:mr-auto sm:w-auto"
                  disabled={isCancelling || isSubmitting}
                  onClick={() => onCancelMeeting(meeting)}
                >
                  Cancel meeting
                </Button>
              ) : (
                <span className="hidden sm:block" />
              )}
              <div className="flex w-full flex-wrap justify-end gap-2 sm:w-auto">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Close
                </Button>
                <Button type="submit" disabled={isSubmitting || isCancelling}>
                  {isSubmitting
                    ? isEditMode
                      ? "Saving…"
                      : "Creating…"
                    : isEditMode
                      ? "Save changes"
                      : "Create meeting"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
    </Dialog>
  );
}
