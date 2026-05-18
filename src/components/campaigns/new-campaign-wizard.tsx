import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Bot, Hand, Check, ArrowLeft, ArrowRight, Plus, Trash2, Users } from "lucide-react";
import { showApiErrorToast, showApiSuccessToast } from "@/lib/apiToast";
import { createCampaignSchema, mailTemplateSampleSchema } from "@/validators";
import { useCampaignStore } from "@/store/campaign/campaignStore";
import { CAMPAIGN_TONES } from "@/lib/campaignPresentation";
import type { CampaignLeadSource, CreateCampaignRequest, MailTemplateSample } from "@/types";
import type { CreateCampaignFormValues } from "@/validators";
import type { ZodError } from "zod";

type CampaignFormErrors = Partial<Record<keyof CreateCampaignFormValues, string>> & {
  sampleDraft?: string;
};

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const stepLabels = ["Basics", "Run Mode", "Sender", "AI Instructions", "Template Samples", "Target Leads"] as const;
const totalSteps = stepLabels.length;
const sampleContentFormats = [
  { id: "body", label: "Plain body" },
  { id: "html", label: "HTML" },
  { id: "text", label: "Plain text" }
] as const;
type SampleContentFormat = (typeof sampleContentFormats)[number]["id"];

export function NewCampaignWizard({ open, onOpenChange }: Props) {
  const createCampaign = useCampaignStore((state) => state.createCampaign);
  const isCreating = useCampaignStore((state) => state.isCreating);

  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("");
  const [targetZone, setTargetZone] = useState("");
  const [targetTone, setTargetTone] = useState<string>(CAMPAIGN_TONES[0]);
  const [cta, setCta] = useState("");
  const [leadSource, setLeadSource] = useState<CampaignLeadSource>("both");
  const [mode, setMode] = useState<"auto" | "manual">("manual");
  const [senderDisplayName, setSenderDisplayName] = useState("");
  const [senderAddress, setSenderAddress] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [mailTrainingInstruction, setMailTrainingInstruction] = useState("");
  const [templateSamples, setTemplateSamples] = useState<MailTemplateSample[]>([]);
  const [sampleSubject, setSampleSubject] = useState("");
  const [sampleContentFormat, setSampleContentFormat] = useState<SampleContentFormat>("body");
  const [sampleBody, setSampleBody] = useState("");
  const [sampleHtml, setSampleHtml] = useState("");
  const [sampleText, setSampleText] = useState("");
  const [leadCount, setLeadCount] = useState<number | "">(100);
  const [errors, setErrors] = useState<CampaignFormErrors>({});

  const getDraftPayload = (): CreateCampaignFormValues => ({
    name,
    goal,
    target_zone: targetZone,
    call_to_action: cta,
    run_mode: mode,
    target_tone: targetTone,
    mail_training_instruction: mailTrainingInstruction,
    mail_template_samples: templateSamples,
    lead_source: leadSource,
    sender_display_name: senderDisplayName,
    sender_address: senderAddress,
    sender_phone: senderPhone,
    target_leads: typeof leadCount === "number" ? leadCount : 0,
    status: "draft"
  });

  const getStepFields = (currentStep: number): Array<keyof CreateCampaignFormValues> => {
    if (currentStep === 1) {
      return ["name", "goal", "target_zone", "target_tone", "call_to_action", "lead_source"];
    }
    if (currentStep === 2) return ["run_mode"];
    if (currentStep === 3) return ["sender_display_name", "sender_address", "sender_phone"];
    if (currentStep === 4) return ["mail_training_instruction"];
    if (currentStep === 5) return ["mail_template_samples"];
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
      target_tone: fieldErrors.target_tone?.[0],
      mail_training_instruction: fieldErrors.mail_training_instruction?.[0],
      mail_template_samples: fieldErrors.mail_template_samples?.[0],
      lead_source: fieldErrors.lead_source?.[0],
      sender_display_name: fieldErrors.sender_display_name?.[0],
      sender_address: fieldErrors.sender_address?.[0],
      sender_phone: fieldErrors.sender_phone?.[0],
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

    setErrors((prev) => ({ ...prev, ...nextErrors, sampleDraft: undefined }));
    return stepFields.every((field) => !nextErrors[field]);
  };

  const setSampleContentValue = (value: string) => {
    if (errors.sampleDraft) setErrors((prev) => ({ ...prev, sampleDraft: undefined }));
    if (sampleContentFormat === "body") {
      setSampleBody(value);
      setSampleHtml("");
      setSampleText("");
      return;
    }
    if (sampleContentFormat === "html") {
      setSampleHtml(value);
      setSampleBody("");
      setSampleText("");
      return;
    }
    setSampleText(value);
    setSampleBody("");
    setSampleHtml("");
  };

  const handleSampleContentFormatChange = (format: SampleContentFormat) => {
    setSampleContentFormat(format);
    setSampleBody("");
    setSampleHtml("");
    setSampleText("");
    if (errors.sampleDraft) setErrors((prev) => ({ ...prev, sampleDraft: undefined }));
  };

  const handleAddTemplateSample = () => {
    const parsed = mailTemplateSampleSchema.safeParse({
      subject: sampleSubject,
      body: sampleContentFormat === "body" ? sampleBody : "",
      html: sampleContentFormat === "html" ? sampleHtml : "",
      text: sampleContentFormat === "text" ? sampleText : ""
    });
    if (!parsed.success) {
      const first = parsed.error.errors[0]?.message ?? "Please complete subject and email content.";
      setErrors((prev) => ({ ...prev, sampleDraft: first }));
      return;
    }
    setTemplateSamples((prev) => [...prev, parsed.data]);
    setSampleSubject("");
    setSampleContentFormat("body");
    setSampleBody("");
    setSampleHtml("");
    setSampleText("");
    setErrors((prev) => ({ ...prev, sampleDraft: undefined, mail_template_samples: undefined }));
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
    setTargetTone(CAMPAIGN_TONES[0]);
    setCta("");
    setMode("manual");
    setLeadSource("both");
    setSenderDisplayName("");
    setSenderAddress("");
    setSenderPhone("");
    setMailTrainingInstruction("");
    setTemplateSamples([]);
    setSampleSubject("");
    setSampleContentFormat("body");
    setSampleBody("");
    setSampleHtml("");
    setSampleText("");
    setLeadCount(100);
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
    const { campaign, message } = await createCampaign(payload);
    showApiSuccessToast(message || `Campaign "${campaign.name}" created successfully.`);
    close();
  };

  const presets = [50, 100, 250, 500];

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="max-w-3xl gap-0 overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border p-5">
          <div>
            <DialogTitle className="font-display text-lg font-bold">Create New Campaign</DialogTitle>
            <p className="text-xs text-muted-foreground">
              Step {step} of {totalSteps} · {stepLabels[step - 1]}
            </p>
          </div>
        </div>

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
                    !done && !active && "bg-muted text-muted-foreground"
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : n}
                </div>
                <span
                  className={cn(
                    "hidden text-xs font-medium md:inline",
                    active ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {label}
                </span>
                {i < stepLabels.length - 1 && <span className="h-px flex-1 bg-border" />}
              </div>
            );
          })}
        </div>

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
                  {CAMPAIGN_TONES.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        setTargetTone(t);
                        if (errors.target_tone) setErrors((prev) => ({ ...prev, target_tone: "" }));
                      }}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
                        targetTone === t
                          ? "border-primary bg-primary/15 text-brand-text"
                          : "border-border text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                {errors.target_tone ? <p className="text-xs text-destructive">{errors.target_tone}</p> : null}
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
                {errors.call_to_action ? (
                  <p className="text-xs text-destructive">{errors.call_to_action}</p>
                ) : null}
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
                {(
                  [
                    {
                      id: "auto",
                      icon: Bot,
                      title: "Automatic Mode",
                      desc: "Emails and follow-ups send automatically on schedule.",
                      color: "primary"
                    },
                    {
                      id: "manual",
                      icon: Hand,
                      title: "Manual Mode",
                      desc: "Every email goes to your drafts for review before sending.",
                      color: "warning"
                    }
                  ] as const
                ).map((c) => {
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
                          : "border-border bg-surface hover:bg-muted/40"
                      )}
                    >
                      {selected && (
                        <span
                          className={cn(
                            "absolute right-3 top-3 grid h-6 w-6 place-items-center rounded-full text-white",
                            c.color === "primary"
                              ? "bg-primary text-primary-foreground"
                              : "bg-warning text-warning-foreground"
                          )}
                        >
                          <Check className="h-3.5 w-3.5" />
                        </span>
                      )}
                      <div
                        className={cn(
                          "grid h-10 w-10 place-items-center rounded-lg",
                          c.color === "primary" ? "bg-primary/15 text-primary" : "bg-warning/15 text-warning"
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-base font-bold">{c.title}</h3>
                      <p className="text-sm text-muted-foreground">{c.desc}</p>
                    </button>
                  );
                })}
              </div>
              {errors.run_mode ? <p className="mt-3 text-xs text-destructive">{errors.run_mode}</p> : null}
            </>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                These details appear as the sender on outbound emails for this campaign.
              </p>
              <div className="space-y-1.5">
                <Label htmlFor="senderDisplayName">Sender display name</Label>
                <Input
                  id="senderDisplayName"
                  value={senderDisplayName}
                  onChange={(e) => {
                    setSenderDisplayName(e.target.value);
                    if (errors.sender_display_name) setErrors((prev) => ({ ...prev, sender_display_name: "" }));
                  }}
                  placeholder="e.g. Alex from Rapid AI"
                />
                {errors.sender_display_name ? (
                  <p className="text-xs text-destructive">{errors.sender_display_name}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="senderAddress">Sender email address</Label>
                <Input
                  id="senderAddress"
                  type="email"
                  value={senderAddress}
                  onChange={(e) => {
                    setSenderAddress(e.target.value);
                    if (errors.sender_address) setErrors((prev) => ({ ...prev, sender_address: "" }));
                  }}
                  placeholder="you@company.com"
                />
                {errors.sender_address ? (
                  <p className="text-xs text-destructive">{errors.sender_address}</p>
                ) : null}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="senderPhone">Sender phone</Label>
                <Input
                  id="senderPhone"
                  type="tel"
                  value={senderPhone}
                  onChange={(e) => {
                    setSenderPhone(e.target.value);
                    if (errors.sender_phone) setErrors((prev) => ({ ...prev, sender_phone: "" }));
                  }}
                  placeholder="+1 555 000 0000"
                />
                {errors.sender_phone ? <p className="text-xs text-destructive">{errors.sender_phone}</p> : null}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="mailTraining">Mail training instructions</Label>
                <Textarea
                  id="mailTraining"
                  rows={10}
                  value={mailTrainingInstruction}
                  onChange={(e) => {
                    setMailTrainingInstruction(e.target.value);
                    if (errors.mail_training_instruction) {
                      setErrors((prev) => ({ ...prev, mail_training_instruction: "" }));
                    }
                  }}
                  placeholder="Tell the AI how to write emails: tone, length, personalization rules, CTA style..."
                />
                <p className="text-right text-[11px] text-muted-foreground">
                  {mailTrainingInstruction.length} / 2000
                </p>
                {errors.mail_training_instruction ? (
                  <p className="text-xs text-destructive">{errors.mail_training_instruction}</p>
                ) : null}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4">
              <div>
                <p className="font-semibold">Mail template samples</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add one or more example emails. For each sample, choose one content format (plain body, HTML, or
                  plain text).
                </p>
              </div>

              <div className="rounded-xl border border-dashed border-border p-4 space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="sampleSubject">Subject</Label>
                  <Input
                    id="sampleSubject"
                    value={sampleSubject}
                    onChange={(e) => setSampleSubject(e.target.value)}
                    placeholder="Subject line"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email content</Label>
                  <Tabs
                    value={sampleContentFormat}
                    onValueChange={(value) => handleSampleContentFormatChange(value as SampleContentFormat)}
                  >
                    <TabsList className="grid h-10 w-full grid-cols-3">
                      {sampleContentFormats.map((format) => (
                        <TabsTrigger key={format.id} value={format.id} className="text-xs sm:text-sm">
                          {format.label}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    <TabsContent value="body" className="mt-3 space-y-0">
                      <Textarea
                        id="sampleBody"
                        rows={4}
                        value={sampleBody}
                        onChange={(e) => setSampleContentValue(e.target.value)}
                        placeholder="Email body content"
                      />
                    </TabsContent>
                    <TabsContent value="html" className="mt-3 space-y-0">
                      <Textarea
                        id="sampleHtml"
                        rows={5}
                        value={sampleHtml}
                        onChange={(e) => setSampleContentValue(e.target.value)}
                        placeholder="<p>HTML version...</p>"
                      />
                    </TabsContent>
                    <TabsContent value="text" className="mt-3 space-y-0">
                      <Textarea
                        id="sampleText"
                        rows={4}
                        value={sampleText}
                        onChange={(e) => setSampleContentValue(e.target.value)}
                        placeholder="Plain-text content"
                      />
                    </TabsContent>
                  </Tabs>
                  <p className="text-xs text-muted-foreground">Enter content in one format only.</p>
                </div>
                {errors.sampleDraft ? <p className="text-xs text-destructive">{errors.sampleDraft}</p> : null}
                <Button type="button" variant="outline" size="sm" onClick={handleAddTemplateSample}>
                  <Plus className="h-3.5 w-3.5" /> Add template sample
                </Button>
              </div>

              <div className="space-y-2">
                {templateSamples.map((sample, i) => (
                  <div
                    key={`${sample.subject}-${i}`}
                    className="flex items-start justify-between gap-3 rounded-lg border border-border p-3"
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
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0"
                      onClick={() => setTemplateSamples((prev) => prev.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
                {templateSamples.length === 0 && (
                  <p className="text-center text-xs text-muted-foreground">
                    No samples yet — optional but recommended.
                  </p>
                )}
                {errors.mail_template_samples ? (
                  <p className="text-xs text-destructive">{errors.mail_template_samples}</p>
                ) : null}
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="space-y-5">
              <div>
                <p className="font-semibold">How many leads do you want to target?</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  We&apos;ll source and enrich leads from your audience pool to match this number.
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
                          : "border-border text-muted-foreground hover:bg-muted"
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

        <div className="flex items-center justify-between border-t border-border p-5">
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            )}
            {step < totalSteps ? (
              <Button onClick={handleNext}>
                Next <ArrowRight className="h-4 w-4" />
              </Button>
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
