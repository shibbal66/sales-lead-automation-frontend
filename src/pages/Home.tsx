import { Link } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Check,
  Mail,
  MessageSquare,
  Sparkles,
  Target,
  Users,
  Zap
} from "lucide-react";
import { MarketingLayout } from "@/components/marketing/marketing-layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuthStore } from "@/store/auth/authStore";
import { cn } from "@/lib/utils";

const STATS = [
  { value: "3.2x", label: "Higher reply rates" },
  { value: "70%", label: "Less manual research" },
  { value: "12k+", label: "Meetings booked" }
] as const;

const FEATURES = [
  {
    icon: Users,
    title: "Lead management",
    description:
      "Import and enrich prospects, track fit scores and status, and keep every contact ready for outreach."
  },
  {
    icon: Mail,
    title: "AI-powered campaigns",
    description:
      "Launch outbound sequences with tailored tone, training instructions, and templates that match your ICP."
  },
  {
    icon: MessageSquare,
    title: "Smart follow-ups",
    description:
      "Automated multi-step follow-ups keep conversations alive until leads reply or book time."
  },
  {
    icon: CalendarDays,
    title: "Meeting scheduling",
    description:
      "Book and manage sales meetings from a calendar view—sync with Google and tie meetings to campaigns."
  },
  {
    icon: BarChart3,
    title: "Pipeline analytics",
    description:
      "See sent vs. replies, campaign performance, and conversion trends so you know what to scale."
  },
  {
    icon: Zap,
    title: "Gmail & Google Meet",
    description:
      "Connect your inbox, send from your domain, and optionally add Meet links when prospects are ready."
  }
] as const;

const STEPS = [
  {
    step: "01",
    title: "Import your leads",
    description: "Upload or sync prospects and enrich them with company context for personalization."
  },
  {
    step: "02",
    title: "Build a campaign",
    description: "Set goals, target zones, tone, and mail training—Rapid AI drafts emails per lead."
  },
  {
    step: "03",
    title: "Run outbound on autopilot",
    description: "Auto or manual run modes, follow-up sequences, and real-time send status per lead."
  },
  {
    step: "04",
    title: "Book more meetings",
    description: "Track replies, schedule calls, and measure what converts from outreach to calendar."
  }
] as const;

const BENEFITS = [
  "Personalized cold email at scale",
  "Campaign-level control of tone and CTA",
  "Follow-up timing you configure",
  "Billing plans that grow with your team",
  "Secure auth with email verification"
] as const;

function HeroPreview() {
  return (
    <Card className="relative overflow-hidden border-border/80 shadow-elevated">
      <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
      <div className="relative border-b border-border bg-card/90 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/80" />
          <span className="ml-2 text-xs font-medium text-muted-foreground">Rapid AI · Dashboard</span>
        </div>
      </div>
      <div className="relative grid gap-3 p-4 sm:grid-cols-3">
        {[
          { label: "Emails sent", value: "2,840", delta: "+18%" },
          { label: "Reply rate", value: "24%", delta: "+3.2x" },
          { label: "Meetings booked", value: "47", delta: "This month" }
        ].map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-lg border border-border bg-surface/80 p-3 shadow-card backdrop-blur-sm"
          >
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              {kpi.label}
            </p>
            <p className="font-display text-xl font-bold">{kpi.value}</p>
            <p className="mt-1 text-xs font-semibold text-brand-text">{kpi.delta}</p>
          </div>
        ))}
      </div>
      <div className="relative space-y-2 border-t border-border bg-muted/20 px-4 py-3">
        {[
          { name: "Sarah M.", company: "Vertex Labs", status: "Replied" },
          { name: "Marcus C.", company: "Northwind AI", status: "Meeting booked" },
          { name: "Priya R.", company: "Helix Bio", status: "Contacted" }
        ].map((row) => (
          <div
            key={row.name}
            className="flex items-center justify-between rounded-md border border-border/60 bg-card px-3 py-2 text-sm"
          >
            <div>
              <span className="font-medium">{row.name}</span>
              <span className="text-muted-foreground"> · {row.company}</span>
            </div>
            <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-brand-text">
              {row.status}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <MarketingLayout isAuthenticated={isAuthenticated}>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="absolute inset-0 bg-dot-pattern opacity-15" />
        <div className="container relative py-16 md:py-24 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-brand-text">
                <Sparkles className="h-3.5 w-3.5" />
                Sales lead automation for B2B teams
              </p>
              <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
                Outbound that books meetings{" "}
                <span className="text-brand-text">while you sleep</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                Rapid AI writes, sends, and follows up on personalized outreach—so your team spends
                less time in spreadsheets and more time on qualified conversations.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" asChild className="gap-2 shadow-elevated">
                  <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                    {isAuthenticated ? "Go to dashboard" : "Start free — create account"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <a href="#how-it-works">See how it works</a>
                </Button>
              </div>
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                {BENEFITS.slice(0, 3).map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <HeroPreview />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border bg-surface/50">
        <div className="container grid grid-cols-1 gap-6 py-12 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center sm:text-left">
              <p className="font-display text-3xl font-bold text-brand-text md:text-4xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container scroll-mt-20 py-16 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Everything you need to run outbound
          </h2>
          <p className="mt-4 text-muted-foreground">
            From lead lists to booked calls—one workspace for campaigns, follow-ups, meetings, and
            analytics.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <Card
              key={title}
              className="group border-border/80 p-6 shadow-card transition-shadow hover:shadow-elevated"
            >
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-primary/12 text-primary transition-colors group-hover:bg-primary/20">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="scroll-mt-20 border-t border-border bg-muted/25 py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
            <p className="mt-4 text-muted-foreground">
              Launch your first campaign in minutes—connect Gmail, import leads, and let Rapid AI handle
              the rest.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((item, index) => (
              <div key={item.step} className="relative">
                {index < STEPS.length - 1 ? (
                  <div
                    className="absolute left-1/2 top-8 hidden h-px w-full bg-border lg:block"
                    aria-hidden
                  />
                ) : null}
                <Card className="relative h-full border-border/80 bg-card p-6 shadow-card">
                  <span className="font-mono text-xs font-semibold text-brand-text">{item.step}</span>
                  <h3 className="mt-3 font-display text-lg font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Rapid AI */}
      <section id="why-rapid-ai" className="container scroll-mt-20 py-16 md:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-brand text-primary-foreground shadow-elevated">
              <Target className="h-6 w-6" />
            </div>
            <h2 className="mt-6 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Built for revenue teams who need pipeline, not busywork
            </h2>
            <p className="mt-4 text-muted-foreground">
              Rapid AI is a sales lead automation platform: manage prospects, run AI-assisted email
              campaigns, automate follow-ups, schedule meetings, and track performance—all with your
              brand voice and compliance in mind.
            </p>
            <ul className="mt-8 space-y-3">
              {BENEFITS.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                    <Check className="h-3 w-3" />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <Card className="border-primary/20 bg-primary/5 p-8 shadow-elevated">
            <p className="font-display text-xl font-bold leading-snug">
              &ldquo;We cut research time and doubled meaningful replies in the first month.&rdquo;
            </p>
            <p className="mt-4 text-sm text-muted-foreground">
              — Revenue teams using Rapid AI for outbound SaaS, services, and ABM motions
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link to="/signup">Get started free</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border">
        <div className="container py-16 md:py-20">
          <Card
            className={cn(
              "relative overflow-hidden border-0 px-8 py-12 text-center shadow-elevated md:px-16 md:py-16",
              "bg-gradient-brand text-primary-foreground"
            )}
          >
            <div className="absolute inset-0 bg-dot-pattern opacity-20" />
            <div className="relative">
              <h2 className="font-display text-3xl font-bold sm:text-4xl">
                Ready to automate your outbound?
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-primary-foreground/90">
                Join teams using Rapid AI to turn leads into conversations and conversations into
                booked meetings.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Button
                  size="lg"
                  variant="secondary"
                  className="bg-surface text-foreground hover:bg-surface/90"
                  asChild
                >
                  <Link to={isAuthenticated ? "/dashboard" : "/signup"}>
                    {isAuthenticated ? "Open dashboard" : "Create your account"}
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
                  asChild
                >
                  <Link to="/login">Sign in</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </MarketingLayout>
  );
}
