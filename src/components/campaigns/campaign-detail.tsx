import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CampaignLeadsSection } from "@/components/campaigns/campaign-leads-section";
import { CampaignStatsSummary } from "@/components/campaigns/campaign-stats-summary";
import { CampaignSettingsPanel } from "@/components/campaigns/campaign-settings-panel";
import { CampaignSenderDetailsCard } from "@/components/campaigns/campaign-sender-details-card";
import { FollowUpStepRow } from "@/components/campaigns/follow-up-step-row";
import { FollowUpsSkeleton } from "@/components/skeletons/campaigns/follow-ups-skeleton";
import { useCampaignDetailForm } from "@/hooks/useCampaignDetailForm";
import { useCampaignFollowUps } from "@/hooks/useCampaignFollowUps";
import { useCampaignStore } from "@/store/campaign/campaignStore";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import { runCampaignLeads } from "@/services/campaign/campaignServices";
import { getGoogleLinkStatus } from "@/services/auth/authServices";
import { parseGoogleLinkStatus } from "@/lib/googleLinkStatus";
import { GoogleLinkDialog } from "@/components/auth/google-link-dialog";
import { setPendingGoogleLinkReturn } from "@/utils/googleLinkReturn";
import { createCampaignFollowUpSchema, mailTemplateSampleSchema, MAIL_TRAINING_INSTRUCTION_MAX_LENGTH, MAIL_TEMPLATE_SAMPLE_SUBJECT_MAX_LENGTH, parseCreateCampaignFollowUpPayload } from "@/validators";
import type { CreateCampaignFollowUpFormValues } from "@/validators";
import type { CampaignDetailViewModel } from "@/lib/campaignPresentation";
import type { CreateCampaignFollowUpRequest } from "@/types";
import {
  ArrowLeft, Mail, Plus, Trash2, Sparkles, X,
} from "lucide-react";

const WAIT_DAY_OPTIONS = [1, 2, 3, 5, 7] as const;

function getWaitDayOptions(current: number) {
  const options = new Set<number>([...WAIT_DAY_OPTIONS, current]);
  return [...options].sort((a, b) => a - b);
}

const sampleContentFormats = [
  { id: "body", label: "Plain body" },
  { id: "html", label: "HTML" },
  { id: "text", label: "Plain text" }
] as const;
type SampleContentFormat = (typeof sampleContentFormats)[number]["id"];

export function CampaignDetail({
  campaign,
  onBack
}: {
  campaign: CampaignDetailViewModel;
  onBack: () => void;
}) {
  const updateCampaign = useCampaignStore((state) => state.updateCampaign);
  const fetchCampaignById = useCampaignStore((state) => state.fetchCampaignById);
  const deleteCampaign = useCampaignStore((state) => state.deleteCampaign);
  const isUpdating = useCampaignStore((state) => state.isUpdating);
  const isDeleting = useCampaignStore((state) => state.isDeleting);
  const {
    form,
    errors,
    patchField,
    validateForm,
    hasChanges,
    hasValidationErrors,
    buildUpdatePayload,
    statusOptions,
    leadSourceOptions,
    toneOptions
  } = useCampaignDetailForm(campaign);

  const {
    campaignFollowUps,
    followUpDrafts,
    dirtyFollowUpIds,
    hasFollowUpChanges,
    expandedBodyIds,
    editingIds,
    isFetchingCampaignFollowUps,
    isCreatingCampaignFollowUp,
    isUpdatingCampaignFollowUp,
    isDeletingCampaignFollowUp,
    addFollowUp,
    removeFollowUp,
    updateDraft,
    toggleBodyExpanded,
    startEditing,
    stopEditing,
    discardChanges,
    saveDirtyChanges
  } = useCampaignFollowUps(campaign.id);

  const [addingExample, setAddingExample] = useState(false);
  const [exSubject, setExSubject] = useState("");
  const [exContentFormat, setExContentFormat] = useState<SampleContentFormat>("body");
  const [exContent, setExContent] = useState("");
  const [addExampleError, setAddExampleError] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [addFollowUpOpen, setAddFollowUpOpen] = useState(false);
  const [newFollowUpName, setNewFollowUpName] = useState("");
  const [newFollowUpDays, setNewFollowUpDays] = useState<number>(3);
  const [newFollowUpBodyTemplate, setNewFollowUpBodyTemplate] = useState("");
  const [addFollowUpErrors, setAddFollowUpErrors] = useState<
    Partial<Record<keyof CreateCampaignFollowUpFormValues, string>>
  >({});
  const [googleLinkDialogOpen, setGoogleLinkDialogOpen] = useState(false);
  const [checkingGoogleLink, setCheckingGoogleLink] = useState(false);
  const [isRunningLeads, setIsRunningLeads] = useState(false);

  const isManualRunMode = campaign.runMode === "manual";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("googleLinked") !== "1") return;
    showApiSuccessToast("Google account connected. Set status to Active and click Save Changes.");
    params.delete("googleLinked");
    const next = params.toString();
    const path = `${window.location.pathname}${next ? `?${next}` : ""}`;
    window.history.replaceState(null, "", path);
  }, []);

  const buildAddFollowUpDraft = (
    overrides: Partial<CreateCampaignFollowUpRequest> = {}
  ): CreateCampaignFollowUpRequest => ({
    name: overrides.name ?? (newFollowUpName.trim() || `Follow-up ${campaignFollowUps.length + 1}`),
    waiting_days: overrides.waiting_days ?? newFollowUpDays,
    body_template: overrides.body_template ?? newFollowUpBodyTemplate
  });

  const validateAddFollowUpFields = (
    fields: Array<keyof CreateCampaignFollowUpFormValues>,
    overrides: Partial<CreateCampaignFollowUpFormValues> = {}
  ) => {
    const parsed = createCampaignFollowUpSchema.safeParse(buildAddFollowUpDraft(overrides));
    const fieldErrors = parsed.success
      ? {}
      : parsed.error.flatten().fieldErrors;
    const nextErrors: Partial<Record<keyof CreateCampaignFollowUpFormValues, string>> = {};

    fields.forEach((field) => {
      nextErrors[field] = fieldErrors[field]?.[0] || "";
    });

    setAddFollowUpErrors((prev) => ({ ...prev, ...nextErrors }));
    return fields.every((field) => !nextErrors[field]);
  };

  const handleSaveChanges = async () => {
    if (!validateForm()) {
      showApiErrorToast(new Error("Please fix campaign form errors."));
      return;
    }

    const payload = buildUpdatePayload();
    if (Object.keys(payload).length === 0) {
      showApiSuccessToast("No changes to save.");
      return;
    }

    const isActivatingCampaign = payload.status === "active";

    if (!isActivatingCampaign) {
      try {
        await updateCampaign(campaign.id, payload);
        showApiSuccessToast("Campaign updated successfully.");
      } catch {
        // Error toast is handled in store for update failures.
      }
      return;
    }

    setCheckingGoogleLink(true);
    try {
      const response = await getGoogleLinkStatus();
      const { linked } = parseGoogleLinkStatus(response);
      if (!linked) {
        setGoogleLinkDialogOpen(true);
        return;
      }
      await updateCampaign(campaign.id, payload);
      showApiSuccessToast("Campaign updated successfully.");
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      setCheckingGoogleLink(false);
    }
  };

  const handleBeforeGoogleConnect = () => {
    setPendingGoogleLinkReturn({ returnTo: `/campaigns/${campaign.id}?googleLinked=1` });
  };

  const resetAddExampleDialog = () => {
    setExSubject("");
    setExContentFormat("body");
    setExContent("");
    setAddExampleError("");
  };

  const handleExContentFormatChange = (format: SampleContentFormat) => {
    setExContentFormat(format);
    setExContent("");
    setAddExampleError("");
  };

  const handleAddExampleOpenChange = (open: boolean) => {
    setAddingExample(open);
    if (!open) resetAddExampleDialog();
  };

  const handleSaveExample = () => {
    const parsed = mailTemplateSampleSchema.safeParse({
      subject: exSubject,
      body: exContentFormat === "body" ? exContent : "",
      html: exContentFormat === "html" ? exContent : "",
      text: exContentFormat === "text" ? exContent : ""
    });
    if (!parsed.success) {
      setAddExampleError(parsed.error.errors[0]?.message ?? "Please complete subject and email content.");
      return;
    }
    patchField("mailTemplateSamples", [...form.mailTemplateSamples, parsed.data]);
    resetAddExampleDialog();
    setAddingExample(false);
  };

  const resetAddFollowUpDialog = () => {
    setNewFollowUpName("");
    setNewFollowUpDays(3);
    setNewFollowUpBodyTemplate("");
    setAddFollowUpErrors({});
  };

  const handleAddFollowUpOpenChange = (open: boolean) => {
    setAddFollowUpOpen(open);
    if (open) {
      setNewFollowUpName(`Follow-up ${campaignFollowUps.length + 1}`);
      setNewFollowUpBodyTemplate("");
      setAddFollowUpErrors({});
      return;
    }
    resetAddFollowUpDialog();
  };

  const handleCreateFollowUp = async () => {
    const fields: Array<keyof CreateCampaignFollowUpFormValues> = ["name", "waiting_days", "body_template"];
    const parsed = parseCreateCampaignFollowUpPayload(buildAddFollowUpDraft());
    if (!parsed.success) {
      validateAddFollowUpFields(fields);
      showApiErrorToast(new Error("Please fix follow-up form errors."));
      return;
    }

    const ok = await addFollowUp(parsed.data);
    if (!ok) return;
    resetAddFollowUpDialog();
    setAddFollowUpOpen(false);
  };

  const handleRunManualLeads = async () => {
    setIsRunningLeads(true);
    try {
      const response = await runCampaignLeads(campaign.id);
      if (response.success) {
        showApiSuccessToast(response.message || "Emails processed successfully.");
        void fetchCampaignById(campaign.id);
        return;
      }
      showApiErrorToast(response);
    } catch (error) {
      showApiErrorToast(error);
    } finally {
      setIsRunningLeads(false);
    }
  };

  const handleDeleteCampaign = async () => {
    try {
      const message = await deleteCampaign(campaign.id);
      showApiSuccessToast(message);
      setDeleteOpen(false);
      onBack();
    } catch {
      // Error toast is handled in store.
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col flex-wrap gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" size="sm" onClick={onBack} className="w-fit shrink-0">
          <ArrowLeft className="h-4 w-4" /> Back to campaigns
        </Button>
        <div className="flex flex-wrap gap-2 sm:items-center sm:justify-end">
          {isManualRunMode && campaign.status === "active" ? (
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => void handleRunManualLeads()}
              disabled={isRunningLeads}
            >
              <Mail className="h-4 w-4" />
              {isRunningLeads ? "Sending…" : "Send emails"}
            </Button>
          ) : null}
          <Button
            variant="destructive"
            className="w-full sm:w-auto"
            onClick={() => setDeleteOpen(true)}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete Campaign"}
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={() => void handleSaveChanges()}
            disabled={!hasChanges || isUpdating || checkingGoogleLink || hasValidationErrors}
          >
            {checkingGoogleLink ? "Checking Google…" : isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <CampaignStatsSummary stats={campaign} targetLeads={campaign.targetLeads} />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[320px,1fr]">
        <CampaignSettingsPanel
          campaign={campaign}
          name={form.name}
          goal={form.goal}
          targetZone={form.targetZone}
          callToAction={form.callToAction}
          leadSource={form.leadSource}
          runMode={form.runMode}
          tone={form.tone}
          targetLeads={form.targetLeads}
          status={form.status}
          errors={errors}
          statusOptions={statusOptions}
          leadSourceOptions={leadSourceOptions}
          toneOptions={toneOptions}
          onNameChange={(value) => patchField("name", value)}
          onGoalChange={(value) => patchField("goal", value)}
          onTargetZoneChange={(value) => patchField("targetZone", value)}
          onCallToActionChange={(value) => patchField("callToAction", value)}
          onLeadSourceChange={(value) => patchField("leadSource", value)}
          onRunModeChange={(value) => patchField("runMode", value)}
          onToneChange={(value) => patchField("tone", value)}
          onTargetLeadsChange={(value) => patchField("targetLeads", value)}
          onStatusChange={(value) => patchField("status", value)}
        />

        <div className="space-y-4">
          <CampaignSenderDetailsCard
            senderDisplayName={form.senderDisplayName}
            senderAddress={form.senderAddress}
            senderPhone={form.senderPhone}
            errors={errors}
            onSenderDisplayNameChange={(value) => patchField("senderDisplayName", value)}
            onSenderAddressChange={(value) => patchField("senderAddress", value)}
            onSenderPhoneChange={(value) => patchField("senderPhone", value)}
          />

          <Card className="p-5 shadow-card">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-base font-bold">AI Instructions</h3>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-brand-text">
                <Sparkles className="mr-1 inline h-2.5 w-2.5" /> Powered by Rapid AI
              </span>
            </div>
            <Textarea
              rows={6}
              className="mt-3 font-mono text-sm"
              value={form.mailTemplate}
              maxLength={MAIL_TRAINING_INSTRUCTION_MAX_LENGTH}
              aria-invalid={!!errors.mailTemplate}
              onChange={(event) => patchField("mailTemplate", event.target.value)}
              placeholder="Example: Write in a warm, conversational tone..."
            />
            <p className="mt-1 text-right text-[11px] text-muted-foreground">
              {form.mailTemplate.length} / {MAIL_TRAINING_INSTRUCTION_MAX_LENGTH}
            </p>
            {errors.mailTemplate ? (
              <p className="text-xs text-destructive">{errors.mailTemplate}</p>
            ) : null}
          </Card>

          <Card className="p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-bold">Email Templates / Training Emails</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add example emails with a subject and one content format (plain body, HTML, or plain text).
                </p>
              </div>
              <Button variant="outline" onClick={() => setAddingExample(true)}>
                <Plus className="h-4 w-4" /> Add
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              {form.mailTemplateSamples.map((sample, index) => (
                <div
                  key={`${sample.subject}-${index}`}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface/40 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{sample.subject}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {sample.body || sample.html || sample.text}
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {sample.body ? "Plain body" : sample.html ? "HTML" : "Plain text"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0"
                    onClick={() =>
                      patchField(
                        "mailTemplateSamples",
                        form.mailTemplateSamples.filter((_, itemIndex) => itemIndex !== index)
                      )
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {form.mailTemplateSamples.length === 0 && (
                <p className="text-center text-xs text-muted-foreground">No template samples yet.</p>
              )}
              {errors.mailTemplateSamples ? (
                <p className="text-xs text-destructive">{errors.mailTemplateSamples}</p>
              ) : null}
            </div>
          </Card>

          <Card className="p-5 shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-display text-base font-bold">Follow-up Sequence</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Configure timing and message body for each follow-up step.
                </p>
              </div>
              {hasFollowUpChanges && (
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUpdatingCampaignFollowUp}
                    onClick={discardChanges}
                  >
                    Discard
                  </Button>
                  <Button
                    size="sm"
                    disabled={isUpdatingCampaignFollowUp}
                    onClick={() => void saveDirtyChanges()}
                  >
                    {isUpdatingCampaignFollowUp ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              )}
            </div>
            {isFetchingCampaignFollowUps && campaignFollowUps.length === 0 ? (
              <FollowUpsSkeleton />
            ) : (
              <>
                <ol className="mt-4 space-y-2">
                  {campaignFollowUps.map((step, index) => {
                    const draft = followUpDrafts[step.id];
                    if (!draft) return null;
                    const isDirty = dirtyFollowUpIds.includes(step.id);
                    const isEditing = editingIds.includes(step.id);
                    const isBodyExpanded = expandedBodyIds.includes(step.id);
                    const isRowBusy = isUpdatingCampaignFollowUp || isDeletingCampaignFollowUp;
                    const blockOtherEdits = hasFollowUpChanges && !isDirty && !isEditing;

                    return (
                      <FollowUpStepRow
                        key={step.id}
                        step={step}
                        index={index}
                        draft={draft}
                        isDirty={isDirty}
                        isEditing={isEditing}
                        isBodyExpanded={isBodyExpanded}
                        isRowBusy={isRowBusy}
                        blockOtherEdits={blockOtherEdits}
                        hasFollowUpChanges={hasFollowUpChanges}
                        onDraftChange={(patch) => updateDraft(step.id, patch)}
                        onToggleBody={() => toggleBodyExpanded(step.id)}
                        onStartEdit={() => startEditing(step.id)}
                        onStopEdit={() => stopEditing(step.id)}
                        onDelete={() => void removeFollowUp(step.id)}
                      />
                    );
                  })}
                  {campaignFollowUps.length === 0 && (
                    <p className="py-6 text-center text-sm text-muted-foreground">No follow-up steps yet.</p>
                  )}
                </ol>
                {hasFollowUpChanges && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    You have unsaved changes to {dirtyFollowUpIds.length} step
                    {dirtyFollowUpIds.length === 1 ? "" : "s"}.
                  </p>
                )}
              </>
            )}
            <Button
              variant="outline"
              className="mt-4 w-full sm:w-auto"
              disabled={isCreatingCampaignFollowUp || isFetchingCampaignFollowUps || hasFollowUpChanges}
              onClick={() => handleAddFollowUpOpenChange(true)}
            >
              <Plus className="h-4 w-4" /> Add Follow-up Step
            </Button>
          </Card>
        </div>
      </div>

      <CampaignLeadsSection
        campaignId={campaign.id}
        mailTemplate={form.mailTemplate}
        campaignTargetLeads={form.targetLeads}
      />

      <Dialog open={addingExample} onOpenChange={handleAddExampleOpenChange}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add mail template sample</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="exSubject">Subject</Label>
              <Input
                id="exSubject"
                value={exSubject}
                maxLength={MAIL_TEMPLATE_SAMPLE_SUBJECT_MAX_LENGTH}
                onChange={(event) => {
                  setExSubject(event.target.value);
                  setAddExampleError("");
                }}
                placeholder="Subject line"
              />
            </div>
            <div className="space-y-2">
              <Label>Email content</Label>
              <Tabs
                value={exContentFormat}
                onValueChange={(value) => handleExContentFormatChange(value as SampleContentFormat)}
              >
                <TabsList className="grid h-10 w-full grid-cols-3">
                  {sampleContentFormats.map((format) => (
                    <TabsTrigger key={format.id} value={format.id} className="text-xs sm:text-sm">
                      {format.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              <Textarea
                id="exContent"
                rows={6}
                className="mt-3"
                value={exContent}
                onChange={(event) => {
                  setExContent(event.target.value);
                  setAddExampleError("");
                }}
                placeholder={
                  exContentFormat === "body"
                    ? "Email body content"
                    : exContentFormat === "html"
                      ? "<p>HTML version...</p>"
                      : "Plain-text content"
                }
              />
              <p className="text-xs text-muted-foreground">Enter content in one format only.</p>
            </div>
            {addExampleError ? <p className="text-xs text-destructive">{addExampleError}</p> : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleAddExampleOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSaveExample}>Add sample</Button>
          </div>
        </DialogContent>
      </Dialog>


      <Dialog open={addFollowUpOpen} onOpenChange={handleAddFollowUpOpenChange}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add follow-up step</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="newFollowUpName">Name</Label>
              <Input
                id="newFollowUpName"
                value={newFollowUpName}
                onChange={(event) => {
                  const value = event.target.value;
                  setNewFollowUpName(value);
                  validateAddFollowUpFields(["name"], {
                    name: value.trim() || `Follow-up ${campaignFollowUps.length + 1}`
                  });
                }}
                placeholder="Follow-up 1"
              />
              {addFollowUpErrors.name ? (
                <p className="text-xs text-destructive">{addFollowUpErrors.name}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newFollowUpDays">Wait days</Label>
              <select
                id="newFollowUpDays"
                value={newFollowUpDays}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setNewFollowUpDays(value);
                  validateAddFollowUpFields(["waiting_days"], { waiting_days: value });
                }}
              >
                {WAIT_DAY_OPTIONS.map((day) => (
                  <option key={day} value={day}>Wait {day} days</option>
                ))}
              </select>
              {addFollowUpErrors.waiting_days ? (
                <p className="text-xs text-destructive">{addFollowUpErrors.waiting_days}</p>
              ) : null}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newFollowUpBodyTemplate">Mail template</Label>
              <Textarea
                id="newFollowUpBodyTemplate"
                rows={5}
                value={newFollowUpBodyTemplate}
                onChange={(event) => {
                  const value = event.target.value;
                  setNewFollowUpBodyTemplate(value);
                  validateAddFollowUpFields(["body_template"], { body_template: value });
                }}
                placeholder="Hi, hope you're doing well! Just wanted to gently follow up on my last note — happy to answer any questions when you have a moment."
              />
              {addFollowUpErrors.body_template ? (
                <p className="text-xs text-destructive">{addFollowUpErrors.body_template}</p>
              ) : null}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => handleAddFollowUpOpenChange(false)}>Cancel</Button>
            <Button onClick={() => void handleCreateFollowUp()} disabled={isCreatingCampaignFollowUp}>
              {isCreatingCampaignFollowUp ? "Adding..." : "Add step"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <GoogleLinkDialog
        open={googleLinkDialogOpen}
        onOpenChange={setGoogleLinkDialogOpen}
        onBeforeConnect={handleBeforeGoogleConnect}
        title="Connect Google to activate"
        description="A linked Gmail account is required before a campaign can go active. Connect Google, then return here, set status to Active, and save."
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete campaign?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. This will permanently delete <span className="font-semibold">{form.name}</span>.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={isDeleting}>Cancel</Button>
            <Button variant="destructive" onClick={handleDeleteCampaign} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Yes, delete"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}






