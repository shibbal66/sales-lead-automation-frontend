import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { StatusPill } from "@/components/status-pill";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { followupSteps, leads, trainingEmails, type Campaign } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  ArrowLeft, Bot, Hand, Plus, GripVertical, Trash2, Pencil, Sparkles, Play, Pause, X,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useCampaignStore } from "@/store/campaign/campaignStore";
import { showApiSuccessToast } from "@/lib/apiToast";
import type { UpdateCampaignRequest } from "@/types";

const tones = ["Friendly", "Professional", "Direct", "Consultative"] as const;
const leadSourceOptions = ["new", "existing", "both"] as const;
const statusOptions = ["draft", "active", "paused", "completed"] as const;
type Tone = (typeof tones)[number];
type LeadSource = (typeof leadSourceOptions)[number];
type CampaignStatusOption = (typeof statusOptions)[number];
type CampaignWithApiDetails = Campaign & {
  targetZone?: string;
  leadSource?: "new" | "existing" | "both";
  mailTemplate?: string;
  exampleTraining?: string;
  createdAt?: string;
  updatedAt?: string;
};

export function CampaignDetail({ campaign, onBack }: { campaign: CampaignWithApiDetails; onBack: () => void }) {
  const campaignStatus = String(campaign.status === "running" ? "active" : campaign.status);
  const updateCampaign = useCampaignStore((state) => state.updateCampaign);
  const deleteCampaign = useCampaignStore((state) => state.deleteCampaign);
  const isUpdating = useCampaignStore((state) => state.isUpdating);
  const isDeleting = useCampaignStore((state) => state.isDeleting);
  const [name, setName] = useState(campaign.name);
  const [goal, setGoal] = useState(campaign.goal);
  const [targetZone, setTargetZone] = useState(campaign.targetZone ?? "");
  const [cta, setCta] = useState(campaign.cta);
  const [targetLeads, setTargetLeads] = useState(campaign.leadsAssigned);
  const [leadSource, setLeadSource] = useState<LeadSource>(campaign.leadSource ?? "both");
  const [exampleTraining, setExampleTraining] = useState(campaign.exampleTraining ?? "");
  const [mode, setMode] = useState<"automatic" | "manual">(campaign.runMode);
  const [status, setStatus] = useState<CampaignStatusOption>(
    statusOptions.includes(campaignStatus as CampaignStatusOption)
      ? (campaignStatus as CampaignStatusOption)
      : "draft"
  );
  const [tone, setTone] = useState<Tone>(campaign.tone);
  const [examples, setExamples] = useState(
    campaign.exampleTraining
      ? [{ id: "api-training", subject: "Imported Training Style", body: campaign.exampleTraining }]
      : trainingEmails
  );
  const [addingExample, setAddingExample] = useState(false);
  const [exSubject, setExSubject] = useState("");
  const [exBody, setExBody] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [steps, setSteps] = useState(followupSteps);
  const [instructions, setInstructions] = useState(
    campaign.mailTemplate ||
      "Write in a warm, conversational tone. Mention the company's recent product launches if available from their website. Always reference the specific pain point of scaling sales teams. Keep emails under 120 words. End with a soft CTA asking for a 15-minute call.",
  );
  const initialState = useMemo(
    () => ({
      name: campaign.name,
      goal: campaign.goal,
      targetZone: campaign.targetZone ?? "",
      cta: campaign.cta,
      leadSource: campaign.leadSource ?? "both",
      runMode: campaign.runMode,
      mailTemplate: campaign.mailTemplate ?? "",
      exampleTraining: campaign.exampleTraining ?? "",
      tone: campaign.tone,
      targetLeads: campaign.leadsAssigned,
      status: statusOptions.includes(campaignStatus as CampaignStatusOption)
        ? (campaignStatus as CampaignStatusOption)
        : "draft"
    }),
    [campaign, campaignStatus]
  );

  useEffect(() => {
    setName(campaign.name);
    setGoal(campaign.goal);
    setTargetZone(campaign.targetZone ?? "");
    setCta(campaign.cta);
    setTargetLeads(campaign.leadsAssigned);
    setLeadSource(campaign.leadSource ?? "both");
    setExampleTraining(campaign.exampleTraining ?? "");
    setMode(campaign.runMode);
    setTone(campaign.tone);
    setStatus(
      statusOptions.includes(campaignStatus as CampaignStatusOption)
        ? (campaignStatus as CampaignStatusOption)
        : "draft"
    );
    setInstructions(campaign.mailTemplate ?? "");
  }, [campaign, campaignStatus]);
  const formatDate = (value?: string) => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  };

  const hasChanges =
    name !== initialState.name ||
    goal !== initialState.goal ||
    targetZone !== initialState.targetZone ||
    cta !== initialState.cta ||
    leadSource !== initialState.leadSource ||
    mode !== initialState.runMode ||
    instructions !== initialState.mailTemplate ||
    exampleTraining !== initialState.exampleTraining ||
    tone !== initialState.tone ||
    targetLeads !== initialState.targetLeads ||
    status !== initialState.status;

  const handleSaveChanges = async () => {
    const payload: UpdateCampaignRequest = {};
    if (name !== initialState.name) payload.name = name;
    if (goal !== initialState.goal) payload.goal = goal;
    if (targetZone !== initialState.targetZone) payload.target_zone = targetZone;
    if (cta !== initialState.cta) payload.call_to_action = cta;
    if (leadSource !== initialState.leadSource) payload.lead_source = leadSource;
    if (mode !== initialState.runMode) payload.run_mode = mode === "automatic" ? "auto" : "manual";
    if (instructions !== initialState.mailTemplate) payload.mail_template = instructions;
    if (exampleTraining !== initialState.exampleTraining) payload.example_training = exampleTraining;
    // Persist tone selection via example_training when no explicit text was changed.
    if (tone !== initialState.tone && !payload.example_training) payload.example_training = tone;
    if (targetLeads !== initialState.targetLeads) payload.target_leads = targetLeads;
    if (status !== initialState.status) payload.status = status;

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
        {/* Left settings panel */}
        <div className="space-y-4">
          <Card className="p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-transparent font-display text-lg font-bold focus:outline-none focus:ring-0"
              />
              <Pencil className="h-4 w-4 shrink-0 text-muted-foreground" />
            </div>

            <div className="mt-4 space-y-4">
              {/* Campaign status */}
              <div className="space-y-2 rounded-lg border border-border p-3">
                <Label>Campaign Status</Label>
                <div className="flex flex-wrap gap-1.5">
                  {statusOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setStatus(option)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors",
                        status === option
                          ? "border-primary bg-primary/15 text-brand-text"
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Run mode segmented */}
              <div className="space-y-2">
                <Label>Run Mode</Label>
                <div className="grid grid-cols-2 rounded-lg bg-muted p-1">
                  {([
                    { id: "automatic", label: "Automatic", icon: Bot },
                    { id: "manual", label: "Manual", icon: Hand },
                  ] as const).map((m) => {
                    const Icon = m.icon;
                    const sel = mode === m.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setMode(m.id)}
                        className={cn(
                          "flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-all",
                          sel && (m.id === "automatic" ? "bg-primary text-primary-foreground shadow-sm" : "bg-warning text-warning-foreground shadow-sm"),
                          !sel && "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Icon className="h-3.5 w-3.5" /> {m.label}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  {mode === "automatic"
                    ? "AI sends emails and follow-ups on schedule, no review required."
                    : "Each email queued as draft for your review before sending."}
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="goal">Campaign Goal</Label>
                <Textarea id="goal" rows={3} value={goal} onChange={(e) => setGoal(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Target Tone</Label>
                <div className="flex flex-wrap gap-1.5">
                  {tones.map((t) => (
                    <button key={t} onClick={() => setTone(t)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors",
                        tone === t ? "border-primary bg-primary/15 text-brand-text" : "border-border text-muted-foreground hover:bg-muted",
                      )}>{t}</button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cta">Call to Action</Label>
                <Input id="cta" value={cta} onChange={(e) => setCta(e.target.value)} />
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-semibold text-muted-foreground">API Campaign Details</p>
                <div className="mt-2 space-y-2 text-xs">
                  <div className="space-y-1">
                    <Label htmlFor="target-zone">Target zone</Label>
                    <Input id="target-zone" value={targetZone} onChange={(e) => setTargetZone(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="target-leads">Target leads</Label>
                    <Input
                      id="target-leads"
                      type="number"
                      min={0}
                      value={targetLeads}
                      onChange={(e) => setTargetLeads(Number(e.target.value) || 0)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Lead Source</Label>
                <div className="flex flex-wrap gap-1.5">
                  {leadSourceOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLeadSource(option)}
                      className={cn(
                        "rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize transition-colors",
                        leadSource === option
                          ? "border-primary bg-primary/15 text-brand-text"
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/40 p-3">
                <p className="text-xs text-muted-foreground">Assigned leads</p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="font-display text-2xl font-bold">{targetLeads}</p>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="text-xs font-semibold text-muted-foreground">Timeline</p>
                <div className="mt-2 space-y-1.5 text-xs">
                  <p><span className="text-muted-foreground">Created:</span> {formatDate(campaign.createdAt)}</p>
                  <p><span className="text-muted-foreground">Updated:</span> {formatDate(campaign.updatedAt)}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Right AI settings */}
        <div className="space-y-4">
          {/* AI instructions */}
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
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Example: Write in a warm, conversational tone..."
            />
            <p className="mt-1 text-right text-[11px] text-muted-foreground">{instructions.length} chars</p>

            <div className="mt-3 space-y-1.5">
              <Label htmlFor="example-training">Example Training</Label>
              <Textarea
                id="example-training"
                rows={2}
                value={exampleTraining}
                onChange={(e) => setExampleTraining(e.target.value)}
                placeholder="Professional, concise, value-focused"
              />
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                { l: "Use enriched company data in personalization", c: true },
                { l: "Include company name in subject line", c: false },
                { l: "Reference website content if available", c: true },
                { l: "Auto-pause sequence when lead replies", c: true },
              ].map((b) => (
                <label key={b.l} className="flex items-start gap-2 rounded-lg border border-border p-2.5 text-sm">
                  <Checkbox defaultChecked={b.c} className="mt-0.5" /> <span>{b.l}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Training emails */}
          <Card className="p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-bold">Email Templates / Training Emails</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload past emails to train the AI on your writing style. The AI will learn your tone, phrasing, and structure from these examples and match it in generated emails.
                </p>
              </div>
              <Button variant="outline" onClick={() => setAddingExample(true)}><Plus className="h-4 w-4" /> Add</Button>
            </div>

            <div className="mt-4 space-y-1.5">
              <Label htmlFor="primary-email-template">Primary Email Template</Label>
              <Textarea
                id="primary-email-template"
                rows={4}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Hi {{firstName}}, I wanted to reach out about..."
              />
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {examples.map((ex) => (
                <div key={ex.id} className="flex items-start justify-between gap-3 rounded-lg border border-border bg-surface/40 p-3">
                  <div className="min-w-0">
                    <Input
                      value={ex.subject}
                      onChange={(e) =>
                        setExamples((prev) =>
                          prev.map((item) =>
                            item.id === ex.id ? { ...item, subject: e.target.value } : item
                          )
                        )
                      }
                      className="h-8 text-sm"
                    />
                    <Textarea
                      rows={3}
                      value={ex.body}
                      onChange={(e) =>
                        setExamples((prev) =>
                          prev.map((item) =>
                            item.id === ex.id ? { ...item, body: e.target.value } : item
                          )
                        )
                      }
                      className="mt-2 text-xs"
                    />
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExamples((p) => p.filter((e) => e.id !== ex.id))}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <Button className="mt-4" variant="secondary" onClick={() => setPreviewOpen(true)}>
              <Sparkles className="h-4 w-4" /> Generate Preview Email
            </Button>
          </Card>

          {/* Follow-up sequence */}
          <Card className="p-5 shadow-card">
            <h3 className="font-display text-base font-bold">Follow-up Sequence</h3>
            <p className="mt-1 text-sm text-muted-foreground">Each step is AI-generated using your instructions and tone above.</p>

            <ol className="mt-4 space-y-2">
              {steps.map((s, i) => (
                <li key={s.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface/40 p-3">
                  <GripVertical className="h-4 w-4 text-muted-foreground" />
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/15 text-xs font-bold text-brand-text">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold">{s.label}</p>
                    <p className="text-xs text-muted-foreground">Day {s.day}</p>
                  </div>
                  <select
                    defaultValue={s.day}
                    className="rounded-md border border-border bg-background px-2 py-1 text-xs"
                  >
                    {[0, 1, 2, 3, 5, 7, 10, 14].map((d) => <option key={d} value={d}>Wait {d} days</option>)}
                  </select>
                  <Button variant="ghost" size="sm">Edit email</Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSteps((p) => p.filter((x) => x.id !== s.id))}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </li>
              ))}
            </ol>

            <Button variant="outline" className="mt-3" onClick={() =>
              setSteps((p) => [...p, { id: `s${Date.now()}`, label: `Follow-up ${p.length}`, day: (p.at(-1)?.day ?? 0) + 7 }])
            }>
              <Plus className="h-4 w-4" /> Add Follow-up Step
            </Button>
          </Card>
        </div>
      </div>

      {/* Campaign leads table */}
      <Card className="overflow-hidden shadow-card">
        <div className="flex items-center justify-between p-5">
          <h3 className="font-display text-base font-bold">Campaign Leads</h3>
          <Button><Plus className="h-4 w-4" /> Assign More Leads</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead>Name</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Email Status</TableHead>
              <TableHead>Step</TableHead>
              <TableHead>Last Contacted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.slice(0, 8).map((l, i) => (
              <TableRow key={l.id} className="hover:bg-primary/5">
                <TableCell className="font-medium">{l.name}</TableCell>
                <TableCell>{l.company}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{l.email}</TableCell>
                <TableCell><StatusPill status={l.status} /></TableCell>
                <TableCell className="text-sm">Step {(i % 4) + 1}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{l.lastContacted}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">View</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Add example modal */}
      <Dialog open={addingExample} onOpenChange={setAddingExample}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add an email example</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label>Subject</Label><Input value={exSubject} onChange={(e) => setExSubject(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Body</Label><Textarea rows={6} value={exBody} onChange={(e) => setExBody(e.target.value)} /></div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAddingExample(false)}>Cancel</Button>
            <Button onClick={() => {
              if (!exSubject.trim()) return;
              setExamples((p) => [...p, { id: `te${Date.now()}`, subject: exSubject, body: exBody }]);
              setExSubject(""); setExBody(""); setAddingExample(false);
              showApiSuccessToast("Example saved. AI will use it in future generations.");
            }}>Save Example</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>AI Preview Email</DialogTitle></DialogHeader>
          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
            <div>
              <p className="text-[11px] font-semibold uppercase text-muted-foreground">Subject</p>
              <p className="font-semibold">Quick idea for Vertex's SDR team</p>
            </div>
            <div className="prose prose-sm max-w-none text-sm leading-relaxed">
              <p>Hi Sarah,</p>
              <p>Noticed Vertex just expanded the SDR team after the Series B — congrats. Most teams scaling outbound past 5 SDRs hit the same wall: research time per lead balloons and quality drops.</p>
              <p>We built Rapid AI to solve exactly that — our customers cut research time by ~70% while tripling reply rates with personalized outreach.</p>
              <p>Worth a 15-min chat next week?</p>
              <p>— Alex</p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setPreviewOpen(false)}><X className="h-4 w-4" /> Close</Button>
            <Button><Sparkles className="h-4 w-4" /> Regenerate</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Delete campaign?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">
            This action cannot be undone. This will permanently delete <span className="font-semibold">{name}</span>.
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
