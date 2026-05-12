import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Bot, Hand, Check, ArrowLeft, ArrowRight, X, Plus, Trash2, Users } from "lucide-react";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import { createCampaignSchema } from "@/validators";
import { useCampaignStore } from "@/store/campaign/campaignStore";
import type { CampaignLeadSource, CreateCampaignRequest } from "@/types";
import type { CreateCampaignFormValues } from "@/validators";
import type { ZodError } from "zod";

const tones = ["Friendly", "Professional", "Direct", "Consultative"] as const;
type Tone = (typeof tones)[number];
type CampaignFormErrors = Partial<Record<keyof CreateCampaignFormValues, string>>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewCampaignWizard({ open, onOpenChange }: Props) {
  const createCampaign = useCampaignStore((state) => state.createCampaign);
  const isCreating = useCampaignStore((state) => state.isCreating);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [targetZone, setTargetZone] = useState("");
  const [tone, setTone] = useState<Tone>("Consultative");
  const [cta, setCta] = useState("");
  const [mode, setMode] = useState<"auto" | "manual">("auto");
  const [leadSource, setLeadSource] = useState<CampaignLeadSource>("both");
  const [instructions, setInstructions] = useState("");
  const [leadCount, setLeadCount] = useState<number | "">(100);
  const [examples, setExamples] = useState<{ subject: string; body: string }[]>([]);
  const [exSubject, setExSubject] = useState("");
  const [exBody, setExBody] = useState("");
  const [errors, setErrors] = useState<CampaignFormErrors>({});

  const totalSteps = 5;

  const getExampleTraining = () =>
    [
      `Preferred tone: ${tone}`,
      ...examples.map((ex) => `Subject: ${ex.subject}\nBody: ${ex.body}`)
    ].join("\n\n");

  const getDraftPayload = (): CreateCampaignFormValues => ({
    name,
    goal,
    target_zone: targetZone,
    call_to_action: cta,
    run_mode: mode,
    lead_source: leadSource,
    mail_template: instructions,
    example_training: getExampleTraining(),
    target_leads: typeof leadCount === "number" ? leadCount : 0,
    status: "draft" as const
  });

  const getStepFields = (currentStep: number): Array<keyof CreateCampaignFormValues> => {
    if (currentStep === 1) return ["name", "goal", "target_zone", "call_to_action", "lead_source"];
    if (currentStep === 2) return ["run_mode"];
    if (currentStep === 3) return ["mail_template"];
    if (currentStep === 4) return ["example_training"];
    return ["target_leads"];
  };

  const mapZodErrors = (error: ZodError<CreateCampaignFormValues>): CampaignFormErrors => {
    const fieldErrors = error.flatten().fieldErrors;
    return {
      name: fieldErrors.name?.[0],
      goal: fieldErrors.goal?.[0],
      target_zone: fieldErrors.target_zone?.[0],
      call_to_action: fieldErrors.call_to_action?.[0],
      run_mode: fieldErrors.run_mode?.[0],
      lead_source: fieldErrors.lead_source?.[0],
      mail_template: fieldErrors.mail_template?.[0],
      example_training: fieldErrors.example_training?.[0],
      target_leads: fieldErrors.target_leads?.[0],
      status: fieldErrors.status?.[0]
    };
  };

  const validateCurrentStep = (currentStep: number) => {
    const parsed = createCampaignSchema.safeParse(getDraftPayload());
    const stepFields = getStepFields(currentStep);
    const nextErrors: CampaignFormErrors = {};
    const allErrors = !parsed.success ? mapZodErrors(parsed.error) : {};

    stepFields.forEach((field) => {
      nextErrors[field] = allErrors[field] || "";
    });

    setErrors((prev) => ({ ...prev, ...nextErrors }));
    return stepFields.every((field) => !nextErrors[field]);
  };

  const handleNext = () => {
    if (!validateCurrentStep(step)) return;
    setStep((s) => s + 1);
  };

  const reset = () => {
    setStep(1);
    setName("");
    setGoal("");
    setTargetZone("");
    setTone("Consultative");
    setCta("");
    setMode("auto");
    setLeadSource("both");
    setInstructions("");
    setLeadCount(100);
    setExamples([]);
    setExSubject("");
    setExBody("");
    setErrors({});
  };

  const close = () => {
    onOpenChange(false);
    setTimeout(reset, 200);
  };

  const create = async () => {
    const parsed = createCampaignSchema.safeParse(getDraftPayload());

    if (!parsed.success) {
      setErrors(mapZodErrors(parsed.error));
      showApiErrorToast(new Error("Please fix campaign form errors."));
      return;
    }

    const payload = parsed.data as CreateCampaignRequest;
    const response = await createCampaign(payload);
    showApiSuccessToast(`Campaign "${response.name}" created successfully.`);
    close();
  };

  const stepLabels = ["Basics", "Run Mode", "AI Instructions", "Training", "Target Leads"];

  const presets = [50, 100, 250, 500];

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-3xl gap-0 p-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <DialogTitle className="font-display text-lg font-bold">Create New Campaign</DialogTitle>
            <p className="text-xs text-muted-foreground">Step {step} of {totalSteps} · {stepLabels[step - 1]}</p>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 px-5 pt-4">
          {stepLabels.map((label, i) => {
            const n = i + 1;
            const done = step > n;
            const active = step === n;
            return (
              <div key={label} className="flex flex-1 items-center gap-2">
                <div
                  className={cn(
                    "grid h-7 w-7 place-items-center rounded-full text-xs font-semibold transition-colors",
                    done && "bg-primary text-primary-foreground",
                    active && "bg-primary/20 text-brand-text ring-2 ring-primary",
                    !done && !active && "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : n}
                </div>
                <span className={cn("hidden text-xs font-medium md:inline", active ? "text-foreground" : "text-muted-foreground")}>
                  {label}
                </span>
                {i < stepLabels.length - 1 && <span className="h-px flex-1 bg-border" />}
              </div>
            );
          })}
        </div>

        {/* Step body */}
        <div className="max-h-[60vh] overflow-y-auto p-6 scrollbar-thin">
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">Campaign name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  placeholder="e.g. Q2 Outbound — SaaS"
                />
                {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="goal">Campaign goal / description</Label>
                <Textarea
                  id="goal"
                  rows={3}
                  value={goal}
                  onChange={(e) => {
                    setGoal(e.target.value);
                    if (errors.goal) setErrors((prev) => ({ ...prev, goal: "" }));
                  }}
                  placeholder="What is the objective of this campaign?"
                />
                {errors.goal ? <p className="text-xs text-destructive">{errors.goal}</p> : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="targetZone">Target zone</Label>
                <Input
                  id="targetZone"
                  value={targetZone}
                  onChange={(e) => {
                    setTargetZone(e.target.value);
                    if (errors.target_zone) setErrors((prev) => ({ ...prev, target_zone: "" }));
                  }}
                  placeholder="e.g. North America - SaaS Companies"
                />
                {errors.target_zone ? <p className="text-xs text-destructive">{errors.target_zone}</p> : null}
              </div>
              <div className="space-y-2">
                <Label>Target tone</Label>
                <div className="flex flex-wrap gap-2">
                  {tones.map((t) => (
                    <button key={t} type="button" onClick={() => setTone(t)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                        tone === t ? "border-primary bg-primary/15 text-brand-text" : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cta">Call to action</Label>
                <Input
                  id="cta"
                  value={cta}
                  onChange={(e) => {
                    setCta(e.target.value);
                    if (errors.call_to_action) setErrors((prev) => ({ ...prev, call_to_action: "" }));
                  }}
                  placeholder="What action do you want leads to take?"
                />
                {errors.call_to_action ? <p className="text-xs text-destructive">{errors.call_to_action}</p> : null}
              </div>
              <div className="space-y-2">
                <Label>Lead source</Label>
                <div className="flex flex-wrap gap-2">
                  {(["new", "existing", "both"] as const).map((source) => (
                    <button
                      key={source}
                      type="button"
                      onClick={() => {
                        setLeadSource(source);
                        if (errors.lead_source) setErrors((prev) => ({ ...prev, lead_source: "" }));
                      }}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                        leadSource === source
                          ? "border-primary bg-primary/15 text-brand-text"
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {source}
                    </button>
                  ))}
                </div>
                {errors.lead_source ? <p className="text-xs text-destructive">{errors.lead_source}</p> : null}
              </div>
            </div>
          )}

          {step === 2 && (
            <>
            <div className="grid gap-4 sm:grid-cols-2">
                {([
                { id: "auto", icon: Bot, title: "Automatic Mode", desc: "Emails and follow-ups send automatically on schedule. AI handles replies when enabled. Best for high-volume campaigns.", color: "primary" },
                { id: "manual", icon: Hand, title: "Manual Mode", desc: "Every email goes to your drafts for review before sending. You stay in control of every message sent.", color: "warning" },
              ] as const).map((c) => {
                const selected = mode === c.id;
                const Icon = c.icon;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setMode(c.id);
                      if (errors.run_mode) setErrors((prev) => ({ ...prev, run_mode: "" }));
                    }}
                    className={cn(
                      "relative flex flex-col items-start gap-3 rounded-xl border-2 p-5 text-left transition-all",
                      selected
                        ? c.color === "primary"
                          ? "border-primary bg-primary/10"
                          : "border-warning bg-warning/10"
                        : "border-border bg-surface hover:bg-muted/40",
                    )}
                  >
                    {selected && (
                      <span className={cn("absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full text-white",
                        c.color === "primary" ? "bg-primary text-primary-foreground" : "bg-warning text-warning-foreground")}>
                        <Check className="h-3.5 w-3.5" />
                      </span>
                    )}
                    <div className={cn("grid h-10 w-10 place-items-center rounded-lg",
                      c.color === "primary" ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning")}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-base font-bold">{c.title}</h3>
                    <p className="text-sm text-muted-foreground">{c.desc}</p>
                  </button>
                );
              })}
            </div>
            {errors.run_mode ? <p className="text-xs text-destructive">{errors.run_mode}</p> : null}
            </>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="ai">Tell the AI how to write emails for this campaign</Label>
                <Textarea
                  id="ai" rows={10}
                  value={instructions}
                  onChange={(e) => {
                    setInstructions(e.target.value);
                    if (errors.mail_template) setErrors((prev) => ({ ...prev, mail_template: "" }));
                  }}
                  placeholder="Example: Write in a warm, conversational tone. Mention the company's recent product launches if available from their website. Always reference the specific pain point of scaling sales teams. Keep emails under 120 words. End with a soft CTA asking for a 15-minute call."
                />
                <p className="text-right text-[11px] text-muted-foreground">{instructions.length} / 2000</p>
                {errors.mail_template ? <p className="text-xs text-destructive">{errors.mail_template}</p> : null}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <p className="font-semibold">Add past emails to train the AI on your writing style</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  The AI will learn your tone, phrasing, and structure from these examples and match it in generated emails.
                </p>
              </div>

              <div className="rounded-xl border border-dashed border-border p-4">
                <div className="space-y-2">
                  <Input value={exSubject} onChange={(e) => setExSubject(e.target.value)} placeholder="Subject line" />
                  <Textarea value={exBody} onChange={(e) => setExBody(e.target.value)} rows={4} placeholder="Paste the email body here..." />
                  <Button
                    type="button" variant="outline" size="sm"
                    onClick={() => {
                      if (!exSubject.trim()) return;
                      setExamples((prev) => [...prev, { subject: exSubject, body: exBody }]);
                      setExSubject(""); setExBody("");
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" /> Save example
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {examples.map((ex, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold">{ex.subject}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">{ex.body.slice(0, 80)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setExamples((p) => p.filter((_, idx) => idx !== i))}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                {examples.length === 0 && <p className="text-center text-xs text-muted-foreground">No examples yet — optional but recommended.</p>}
                {errors.example_training ? <p className="text-xs text-destructive">{errors.example_training}</p> : null}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <div>
                <p className="font-semibold">How many leads do you want to target?</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  We'll source and enrich the right leads from your audience pool to match this number.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-surface p-5">
                <Label htmlFor="leadCount" className="text-xs uppercase tracking-wide text-muted-foreground">
                  Number of leads
                </Label>
                <div className="mt-2 flex items-center gap-3">
                  <div className="relative flex-1">
                    <Users className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="leadCount"
                      type="number"
                      min={1}
                      max={100000}
                      value={leadCount}
                      onChange={(e) => {
                        const v = e.target.value;
                        setLeadCount(v === "" ? "" : Math.max(0, parseInt(v, 10) || 0));
                        if (errors.target_leads) setErrors((prev) => ({ ...prev, target_leads: "" }));
                      }}
                      placeholder="e.g. 250"
                      className="h-12 pl-9 font-display text-lg font-bold"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground">leads</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {presets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setLeadCount(p)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                        leadCount === p
                          ? "border-primary bg-primary/15 text-brand-text"
                          : "border-border text-muted-foreground hover:bg-muted",
                      )}
                    >
                      {p.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {typeof leadCount === "number" && leadCount > 0 && (
                <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm font-medium text-brand-text">
                  Targeting <span className="font-bold">{leadCount.toLocaleString()}</span> leads in this campaign
                </div>
              )}
              {errors.target_leads ? <p className="text-xs text-destructive">{errors.target_leads}</p> : null}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border p-5">
          <Button variant="ghost" onClick={close}>Cancel</Button>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}><ArrowLeft className="h-4 w-4" /> Back</Button>
            )}
            {step < totalSteps ? (
              <Button onClick={handleNext}>Next <ArrowRight className="h-4 w-4" /></Button>
            ) : (
              <Button onClick={create} disabled={isCreating}>
                {isCreating ? "Creating..." : "Create Campaign"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
