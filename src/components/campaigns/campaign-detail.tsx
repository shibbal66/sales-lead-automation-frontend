import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CampaignLeadsSection } from "@/components/campaigns/campaign-leads-section";
import { CampaignSettingsPanel } from "@/components/campaigns/campaign-settings-panel";
import { useCampaignDetailForm } from "@/hooks/useCampaignDetailForm";
import { useCampaignStore } from "@/store/campaign/campaignStore";
import { showApiSuccessToast } from "@/lib/apiToast";
import type { CampaignDetailViewModel } from "@/lib/campaignPresentation";
import {
  ArrowLeft, GripVertical, Plus, Trash2, Sparkles, X,
} from "lucide-react";

type FollowupStep = { id: string; label: string; day: number };
type TrainingExample = { id: string; subject: string; body: string };

const DEFAULT_FOLLOWUP_STEPS: FollowupStep[] = [
  { id: "s1", label: "Initial outreach", day: 0 },
  { id: "s2", label: "Follow-up 1", day: 3 },
  { id: "s3", label: "Follow-up 2", day: 7 }
];

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
    setTone,
    setTargetLeads,
    setStatus,
    hasChanges,
    buildUpdatePayload,
    statusOptions,
    leadSourceOptions,
    toneOptions
  } = useCampaignDetailForm(campaign);

  const [examples, setExamples] = useState<TrainingExample[]>(
    campaign.exampleTraining
      ? [{ id: "api-training", subject: "Imported Training Style", body: campaign.exampleTraining }]
      : []
  );
  const [addingExample, setAddingExample] = useState(false);
  const [exSubject, setExSubject] = useState("");
  const [exBody, setExBody] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [steps, setSteps] = useState<FollowupStep[]>(DEFAULT_FOLLOWUP_STEPS);

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
            <div className="mt-3 space-y-1.5">
              <Label htmlFor="example-training">Example Training</Label>
              <Textarea
                id="example-training"
                rows={2}
                value={form.exampleTraining}
                onChange={(event) => setExampleTraining(event.target.value)}
                placeholder="Professional, concise, value-focused"
              />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                { l: "Use enriched company data in personalization", c: true },
                { l: "Include company name in subject line", c: false },
                { l: "Reference website content if available", c: true },
                { l: "Auto-pause sequence when lead replies", c: true }
              ].map((item) => (
                <label key={item.l} className="flex items-start gap-2 rounded-lg border border-border p-2.5 text-sm">
                  <Checkbox defaultChecked={item.c} className="mt-0.5" /> <span>{item.l}</span>
                </label>
              ))}
            </div>
          </Card>

          <Card className="p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-bold">Email Templates / Training Emails</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload past emails to train the AI on your writing style.
                </p>
              </div>
              <Button variant="outline" onClick={() => setAddingExample(true)}><Plus className="h-4 w-4" /> Add</Button>
            </div>
            <div className="mt-4 space-y-1.5">
              <Label htmlFor="primary-email-template">Primary Email Template</Label>
              <Textarea
                id="primary-email-template"
                rows={4}
                value={form.mailTemplate}
                onChange={(event) => setMailTemplate(event.target.value)}
                placeholder="Hi {{firstName}}, I wanted to reach out about..."
              />
            </div>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {examples.map((example) => (
                <div key={example.id} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface/40 p-3">
                  <div className="min-w-0">
                    <Input
                      value={example.subject}
                      onChange={(event) =>
                        setExamples((previous) =>
                          previous.map((item) =>
                            item.id === example.id ? { ...item, subject: event.target.value } : item
                          )
                        )
                      }
                      className="h-8 text-sm"
                    />
                    <Textarea
                      rows={3}
                      value={example.body}
                      onChange={(event) =>
                        setExamples((previous) =>
                          previous.map((item) =>
                            item.id === example.id ? { ...item, body: event.target.value } : item
                          )
                        )
                      }
                      className="mt-2 text-xs"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setExamples((previous) => previous.filter((item) => item.id !== example.id))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <Button className="mt-4" variant="secondary" onClick={() => setPreviewOpen(true)}>
              <Sparkles className="h-4 w-4" /> Generate Preview Email
            </Button>
          </Card>

          <Card className="p-5 shadow-card">
            <h3 className="font-display text-base font-bold">Follow-up Sequence</h3>
            <p className="mt-1 text-sm text-muted-foreground">Each step is AI-generated using your instructions and tone above.</p>
            <ol className="mt-4 space-y-2">
              {steps.map((step, index) => (
                <li key={step.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface/40 p-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-xs font-bold text-brand-text">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{step.label}</p>
                    <p className="text-xs text-muted-foreground">Day {step.day}</p>
                  </div>
                  <select
                    defaultValue={step.day}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                  >
                    {[0, 1, 2, 3, 5, 7, 10, 14].map((day) => (
                      <option key={day} value={day}>Wait {day} days</option>
                    ))}
                  </select>
                  <Button variant="ghost" size="sm">Edit email</Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setSteps((previous) => previous.filter((item) => item.id !== step.id))}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
            </ol>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() =>
                setSteps((previous) => [
                  ...previous,
                  {
                    id: `s${Date.now()}`,
                    label: `Follow-up ${previous.length}`,
                    day: (previous.at(-1)?.day ?? 0) + 7
                  }
                ])
              }
            >
              <Plus className="h-4 w-4" /> Add Follow-up Step
            </Button>
          </Card>
        </div>
      </div>

      <CampaignLeadsSection campaignId={campaign.id} mailTemplate={form.mailTemplate} />

      <Dialog open={addingExample} onOpenChange={setAddingExample}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add an email example</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Subject</Label><Input value={exSubject} onChange={(event) => setExSubject(event.target.value)} /></div>
            <div className="space-y-1.5"><Label>Body</Label><Textarea rows={6} value={exBody} onChange={(event) => setExBody(event.target.value)} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddingExample(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!exSubject.trim()) return;
              setExamples((previous) => [...previous, { id: `te${Date.now()}`, subject: exSubject, body: exBody }]);
              setExSubject("");
              setExBody("");
              setAddingExample(false);
              showApiSuccessToast("Example saved. AI will use it in future generations.");
            }}>Save Example</Button>
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
