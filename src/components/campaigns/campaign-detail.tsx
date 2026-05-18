import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CampaignLeadsSection } from "@/components/campaigns/campaign-leads-section";
import { CampaignSettingsPanel } from "@/components/campaigns/campaign-settings-panel";
import { FollowUpStepRow } from "@/components/campaigns/follow-up-step-row";
import { useCampaignDetailForm } from "@/hooks/useCampaignDetailForm";
import { useCampaignFollowUps } from "@/hooks/useCampaignFollowUps";
import { useCampaignStore } from "@/store/campaign/campaignStore";
import { showApiSuccessToast } from "@/lib/apiToast";
import { cn } from "@/lib/utils";
import { mailTemplateSampleSchema } from "@/validators";
import type { CampaignDetailViewModel } from "@/lib/campaignPresentation";
import {
  ArrowLeft, ChevronDown, Plus, Trash2, Sparkles, X,
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
  const deleteCampaign = useCampaignStore((state) => state.deleteCampaign);
  const isUpdating = useCampaignStore((state) => state.isUpdating);
  const isDeleting = useCampaignStore((state) => state.isDeleting);
  const {
    form,
    setName,
    setGoal,
    setTargetZone,
    setCallToAction,
    setLeadSource,
    setRunMode,
    setMailTemplate,
    setExampleTraining,
    setMailTemplateSamples,
    setTone,
    setTargetLeads,
    setStatus,
    hasChanges,
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
  const [addFollowUpBodyExpanded, setAddFollowUpBodyExpanded] = useState(false);

  const handleSaveChanges = async () => {
    const payload = buildUpdatePayload();
    if (Object.keys(payload).length === 0) {
      showApiSuccessToast("No changes to save.");
      return;
    }

    try {
      await updateCampaign(campaign.id, payload);
      showApiSuccessToast("Campaign updated successfully.");
    } catch {
      // Error toast is handled in store for update failures.
    }
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
    setMailTemplateSamples([...form.mailTemplateSamples, parsed.data]);
    resetAddExampleDialog();
    setAddingExample(false);
  };

  const resetAddFollowUpDialog = () => {
    setNewFollowUpName("");
    setNewFollowUpDays(3);
    setNewFollowUpBodyTemplate("");
    setAddFollowUpBodyExpanded(false);
  };

  const handleAddFollowUpOpenChange = (open: boolean) => {
    setAddFollowUpOpen(open);
    if (open) {
      setNewFollowUpName(`Follow-up ${campaignFollowUps.length + 1}`);
      setNewFollowUpBodyTemplate("");
      setAddFollowUpBodyExpanded(false);
      return;
    }
    resetAddFollowUpDialog();
  };

  const handleCreateFollowUp = async () => {
    const name = newFollowUpName.trim() || `Follow-up ${campaignFollowUps.length + 1}`;
    const ok = await addFollowUp({
      name,
      waiting_days: newFollowUpDays,
      body_template: newFollowUpBodyTemplate
    });
    if (!ok) return;
    resetAddFollowUpDialog();
    setAddFollowUpOpen(false);
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
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back to campaigns</Button>
        <div className="flex items-center gap-2">
          <Button variant="destructive" onClick={() => setDeleteOpen(true)} disabled={isDeleting}>
            {isDeleting ? "Deleting..." : "Delete Campaign"}
          </Button>
          <Button onClick={handleSaveChanges} disabled={!hasChanges || isUpdating}>
            {isUpdating ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

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
          statusOptions={statusOptions}
          leadSourceOptions={leadSourceOptions}
          toneOptions={toneOptions}
          onNameChange={setName}
          onGoalChange={setGoal}
          onTargetZoneChange={setTargetZone}
          onCallToActionChange={setCallToAction}
          onLeadSourceChange={setLeadSource}
          onRunModeChange={setRunMode}
          onToneChange={setTone}
          onTargetLeadsChange={setTargetLeads}
          onStatusChange={setStatus}
        />

        <div className="space-y-4">
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
              onChange={(event) => setMailTemplate(event.target.value)}
              placeholder="Example: Write in a warm, conversational tone..."
            />
            <p className="mt-1 text-right text-[11px] text-muted-foreground">{form.mailTemplate.length} chars</p>
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
                      setMailTemplateSamples(form.mailTemplateSamples.filter((_, itemIndex) => itemIndex !== index))
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
              {form.mailTemplateSamples.length === 0 && (
                <p className="text-center text-xs text-muted-foreground">No template samples yet.</p>
              )}
            </div>
            <Button className="mt-4" variant="secondary" onClick={() => setPreviewOpen(true)}>
              <Sparkles className="h-4 w-4" /> Generate Preview Email
            </Button>
          </Card>

          <Card className="p-5 shadow-card">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-display text-base font-bold">Follow-up Sequence</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Configure timing and message body for each follow-up step. Use placeholders like{" "}
                  <code className="rounded bg-muted px-1 py-0.5 text-xs">{"{{firstName}}"}</code>.
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
            {isFetchingCampaignFollowUps ? (
              <p className="mt-4 text-sm text-muted-foreground">Loading follow-ups...</p>
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

      <CampaignLeadsSection campaignId={campaign.id} mailTemplate={form.mailTemplate} />

      <Dialog open={addingExample} onOpenChange={handleAddExampleOpenChange}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add mail template sample</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="exSubject">Subject</Label>
              <Input
                id="exSubject"
                value={exSubject}
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
                onChange={(event) => setNewFollowUpName(event.target.value)}
                placeholder="Follow-up 1"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newFollowUpDays">Wait days</Label>
              <select
                id="newFollowUpDays"
                value={newFollowUpDays}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                onChange={(event) => setNewFollowUpDays(Number(event.target.value))}
              >
                {WAIT_DAY_OPTIONS.map((day) => (
                  <option key={day} value={day}>Wait {day} days</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="newFollowUpBodyTemplate">Mail template</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  title={addFollowUpBodyExpanded ? "Hide mail template" : "Show mail template"}
                  aria-expanded={addFollowUpBodyExpanded}
                  onClick={() => setAddFollowUpBodyExpanded((previous) => !previous)}
                >
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      !addFollowUpBodyExpanded && "-rotate-90"
                    )}
                  />
                </Button>
              </div>
              {addFollowUpBodyExpanded ? (
                <Textarea
                  id="newFollowUpBodyTemplate"
                  rows={5}
                  value={newFollowUpBodyTemplate}
                  onChange={(event) => setNewFollowUpBodyTemplate(event.target.value)}
                  placeholder="Hi {{firstName}}, ..."
                />
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

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>AI Preview Email</DialogTitle></DialogHeader>
          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
            <div>
              <p className="text-[11px] font-semibold uppercase text-muted-foreground">Subject</p>
              <p className="font-semibold">Quick idea for Vertex&apos;s SDR team</p>
            </div>
            <div className="prose prose-sm max-w-none text-sm leading-relaxed">
              <p>Hi Sarah,</p>
              <p>Noticed Vertex just expanded the SDR team after the Series B — congrats.</p>
              <p>Worth a 15-min chat next week?</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}><X className="h-4 w-4" /> Close</Button>
            <Button><Sparkles className="h-4 w-4" /> Regenerate</Button>
          </div>
        </DialogContent>
      </Dialog>

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
