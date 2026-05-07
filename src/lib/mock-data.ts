// Centralized mock data for Rapid AI
export type LeadStatus = "new" | "contacted" | "replied" | "booked" | "unsubscribed";
export type CampaignStatus = "running" | "active" | "paused" | "completed" | "draft";
export type RunMode = "automatic" | "manual";

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  title: string;
  website: string;
  phone: string;
  status: LeadStatus;
  campaign?: string;
  enriched: boolean;
  lastContacted: string;
}

export interface Campaign {
  id: string;
  name: string;
  goal: string;
  status: CampaignStatus;
  runMode: RunMode;
  leadsAssigned: number;
  emailsSent: number;
  totalEmails: number;
  replyRate: number;
  tone: "Friendly" | "Professional" | "Direct" | "Consultative";
  cta: string;
  targetZone?: string;
  leadSource?: "new" | "existing" | "both";
  mailTemplate?: string;
  exampleTraining?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailThread {
  id: string;
  leadName: string;
  company: string;
  email: string;
  campaign: string;
  subject: string;
  preview: string;
  receivedAt: string;
  classification: "Interested" | "Not Interested" | "Out of Office" | "Question" | "Meeting Request";
  unread: boolean;
  messages: { from: "user" | "lead"; body: string; at: string; subject?: string }[];
}

export interface Meeting {
  id: string;
  leadName: string;
  company: string;
  campaign: string;
  date: string;
  bookedAt: string;
  status: "Upcoming" | "Completed" | "Cancelled";
}

export interface ActivityItem {
  id: string;
  text: string;
  at: string;
}

export const leads: Lead[] = [
  { id: "l1", name: "Sarah Mitchell", company: "Vertex Labs", email: "sarah@vertexlabs.io", title: "VP of Sales", website: "vertexlabs.io", phone: "+1 415 555 0142", status: "replied", campaign: "Q2 Outbound — SaaS", enriched: true, lastContacted: "2h ago" },
  { id: "l2", name: "Marcus Chen", company: "Northwind AI", email: "marcus@northwind.ai", title: "Head of Growth", website: "northwind.ai", phone: "+1 212 555 0188", status: "contacted", campaign: "Q2 Outbound — SaaS", enriched: true, lastContacted: "1d ago" },
  { id: "l3", name: "Priya Raman", company: "Helix Bio", email: "priya@helixbio.com", title: "Director of Ops", website: "helixbio.com", phone: "+1 617 555 0117", status: "booked", campaign: "Healthcare Q2", enriched: true, lastContacted: "3h ago" },
  { id: "l4", name: "Daniel O'Connor", company: "Forge Studios", email: "daniel@forgestudios.co", title: "CEO", website: "forgestudios.co", phone: "+1 312 555 0166", status: "new", enriched: false, lastContacted: "—" },
  { id: "l5", name: "Lina Petrova", company: "Brightpath", email: "lina@brightpath.io", title: "CMO", website: "brightpath.io", phone: "+44 20 7946 0991", status: "contacted", campaign: "EMEA SDR Push", enriched: true, lastContacted: "5h ago" },
  { id: "l6", name: "Omar Haddad", company: "Strato Cloud", email: "omar@stratocloud.com", title: "VP Engineering", website: "stratocloud.com", phone: "+1 408 555 0123", status: "replied", campaign: "Q2 Outbound — SaaS", enriched: true, lastContacted: "12h ago" },
  { id: "l7", name: "Emily Tanaka", company: "Loop Robotics", email: "emily@looprobotics.com", title: "Founder", website: "looprobotics.com", phone: "+1 510 555 0190", status: "new", enriched: true, lastContacted: "—" },
  { id: "l8", name: "Jordan Williams", company: "Atlas Freight", email: "jordan@atlasfreight.io", title: "COO", website: "atlasfreight.io", phone: "+1 713 555 0144", status: "unsubscribed", campaign: "Logistics Trial", enriched: true, lastContacted: "5d ago" },
  { id: "l9", name: "Hannah Goldberg", company: "Quill Legal", email: "hannah@quill.legal", title: "Partner", website: "quill.legal", phone: "+1 646 555 0177", status: "contacted", campaign: "Legaltech Cold", enriched: true, lastContacted: "2d ago" },
  { id: "l10", name: "Rafael Mendes", company: "Cumulo", email: "rafael@cumulo.cc", title: "Head of Product", website: "cumulo.cc", phone: "+55 11 95555 0102", status: "booked", campaign: "Q2 Outbound — SaaS", enriched: true, lastContacted: "1d ago" },
  { id: "l11", name: "Ada Nakamura", company: "Kindred Health", email: "ada@kindredhealth.com", title: "Chief of Staff", website: "kindredhealth.com", phone: "+1 415 555 0119", status: "new", enriched: false, lastContacted: "—" },
  { id: "l12", name: "Liam Foster", company: "Pebble Finance", email: "liam@pebblefinance.com", title: "VP Marketing", website: "pebblefinance.com", phone: "+1 646 555 0145", status: "replied", campaign: "Fintech ABM", enriched: true, lastContacted: "4h ago" },
  { id: "l13", name: "Sofia Alvarez", company: "Rivendell Studios", email: "sofia@rivendell.studio", title: "Creative Director", website: "rivendell.studio", phone: "+34 91 555 0177", status: "contacted", campaign: "EMEA SDR Push", enriched: true, lastContacted: "6h ago" },
  { id: "l14", name: "Noah Patel", company: "Tideline", email: "noah@tideline.co", title: "Co-founder", website: "tideline.co", phone: "+1 503 555 0188", status: "new", enriched: true, lastContacted: "—" },
  { id: "l15", name: "Yuki Sato", company: "Mori Analytics", email: "yuki@morianalytics.jp", title: "Head of Data", website: "morianalytics.jp", phone: "+81 3 5555 0102", status: "contacted", campaign: "APAC Pilot", enriched: true, lastContacted: "9h ago" },
];

export const campaigns: Campaign[] = [
  { id: "c1", name: "Q2 Outbound — SaaS", goal: "Book demos with mid-market SaaS heads of sales.", status: "running", runMode: "automatic", leadsAssigned: 240, emailsSent: 612, totalEmails: 960, replyRate: 18.4, tone: "Consultative", cta: "Book a 15-min intro call" },
  { id: "c2", name: "Healthcare Q2", goal: "Generate intro meetings with healthtech ops leaders.", status: "running", runMode: "manual", leadsAssigned: 88, emailsSent: 142, totalEmails: 352, replyRate: 12.1, tone: "Professional", cta: "Reply with a good time this week" },
  { id: "c3", name: "EMEA SDR Push", goal: "Drive pipeline from EMEA mid-market accounts.", status: "running", runMode: "automatic", leadsAssigned: 175, emailsSent: 410, totalEmails: 700, replyRate: 9.8, tone: "Friendly", cta: "Visit our pricing page" },
  { id: "c4", name: "Fintech ABM", goal: "Multi-touch ABM sequence for Tier-1 fintech accounts.", status: "paused", runMode: "manual", leadsAssigned: 42, emailsSent: 88, totalEmails: 168, replyRate: 22.7, tone: "Direct", cta: "Reply for a tailored ROI deck" },
  { id: "c5", name: "Legaltech Cold", goal: "Cold outreach to legal partners and ops directors.", status: "running", runMode: "automatic", leadsAssigned: 130, emailsSent: 260, totalEmails: 520, replyRate: 7.4, tone: "Professional", cta: "Book a 20-min walkthrough" },
  { id: "c6", name: "APAC Pilot", goal: "Pilot outreach to data leaders in JP, SG, AU.", status: "draft", runMode: "manual", leadsAssigned: 0, emailsSent: 0, totalEmails: 0, replyRate: 0, tone: "Consultative", cta: "Reply if interested in a pilot" },
  { id: "c7", name: "Logistics Trial", goal: "Trial conversion outreach for logistics ops.", status: "completed", runMode: "automatic", leadsAssigned: 60, emailsSent: 240, totalEmails: 240, replyRate: 14.2, tone: "Direct", cta: "Start a 14-day trial" },
];

export const threads: EmailThread[] = [
  {
    id: "t1", leadName: "Sarah Mitchell", company: "Vertex Labs", email: "sarah@vertexlabs.io",
    campaign: "Q2 Outbound — SaaS", subject: "Re: Quick idea for Vertex's SDR team",
    preview: "This is interesting — could you send some times next week?",
    receivedAt: "12 min ago", classification: "Interested", unread: true,
    messages: [
      { from: "user", subject: "Quick idea for Vertex's SDR team", body: "Hi Sarah,\n\nNoticed Vertex just expanded the SDR team after the Series B — congrats. We help teams like yours cut research time per lead by 70% with AI enrichment.\n\nWorth a 15-min chat next week?\n\n— Alex", at: "2 days ago" },
      { from: "lead", body: "Hi Alex — this is interesting. Could you send some times next week? Tuesday or Thursday afternoons usually work for me.", at: "12 min ago" },
    ],
  },
  {
    id: "t2", leadName: "Omar Haddad", company: "Strato Cloud", email: "omar@stratocloud.com",
    campaign: "Q2 Outbound — SaaS", subject: "Re: Cutting SDR research time at Strato",
    preview: "Not the right time for us — circle back in Q3.",
    receivedAt: "1 hr ago", classification: "Not Interested", unread: true,
    messages: [
      { from: "user", subject: "Cutting SDR research time at Strato", body: "Hi Omar — saw Strato shipped the new EU region. We help cloud infra teams scale outbound 3x without adding SDR headcount. Worth a quick chat?", at: "1 day ago" },
      { from: "lead", body: "Hi — appreciate the note. Not the right time for us, please circle back in Q3.", at: "1 hr ago" },
    ],
  },
  {
    id: "t3", leadName: "Liam Foster", company: "Pebble Finance", email: "liam@pebblefinance.com",
    campaign: "Fintech ABM", subject: "Re: Pebble + Rapid AI",
    preview: "I'm OOO until the 22nd — please follow up then.",
    receivedAt: "4 hr ago", classification: "Out of Office", unread: false,
    messages: [
      { from: "user", subject: "Pebble + Rapid AI", body: "Hi Liam, we built something specifically for fintech marketing teams running ABM at scale. Open to a 20 min walkthrough?", at: "1 day ago" },
      { from: "lead", body: "Auto-reply: I'm out of office until the 22nd. Please follow up then or reach my chief of staff.", at: "4 hr ago" },
    ],
  },
  {
    id: "t4", leadName: "Priya Raman", company: "Helix Bio", email: "priya@helixbio.com",
    campaign: "Healthcare Q2", subject: "Re: Outreach automation for Helix",
    preview: "Booked — see you Thursday at 10am PT!",
    receivedAt: "Yesterday", classification: "Meeting Request", unread: false,
    messages: [
      { from: "user", subject: "Outreach automation for Helix", body: "Hi Priya — sharing how healthtech teams are using Rapid AI to triple reply rates. Quick demo?", at: "3 days ago" },
      { from: "lead", body: "Just booked via your link — see you Thursday at 10am PT!", at: "Yesterday" },
    ],
  },
  {
    id: "t5", leadName: "Hannah Goldberg", company: "Quill Legal", email: "hannah@quill.legal",
    campaign: "Legaltech Cold", subject: "Re: A question on data handling",
    preview: "How do you handle email data and PII?",
    receivedAt: "Yesterday", classification: "Question", unread: true,
    messages: [
      { from: "user", subject: "Quill Legal — quick intro", body: "Hi Hannah — sharing how legal teams are using Rapid AI for partner outreach without sacrificing tone.", at: "2 days ago" },
      { from: "lead", body: "Curious — how do you handle email data and PII storage? We have strict requirements.", at: "Yesterday" },
    ],
  },
];

export const meetings: Meeting[] = [
  { id: "m1", leadName: "Priya Raman", company: "Helix Bio", campaign: "Healthcare Q2", date: "Thu, Apr 24 · 10:00 AM PT", bookedAt: "Yesterday", status: "Upcoming" },
  { id: "m2", leadName: "Rafael Mendes", company: "Cumulo", campaign: "Q2 Outbound — SaaS", date: "Fri, Apr 25 · 2:30 PM PT", bookedAt: "2 days ago", status: "Upcoming" },
  { id: "m3", leadName: "Sarah Mitchell", company: "Vertex Labs", campaign: "Q2 Outbound — SaaS", date: "Tue, Apr 22 · 11:00 AM PT", bookedAt: "3 days ago", status: "Upcoming" },
  { id: "m4", leadName: "Naomi Bryant", company: "Kestrel CRM", campaign: "Q2 Outbound — SaaS", date: "Mon, Apr 14 · 9:00 AM PT", bookedAt: "Last week", status: "Completed" },
  { id: "m5", leadName: "Tobias Klein", company: "Berlin Mobility", campaign: "EMEA SDR Push", date: "Wed, Apr 9 · 4:00 PM CET", bookedAt: "Last week", status: "Completed" },
  { id: "m6", leadName: "Mira Shah", company: "Rune AI", campaign: "Q2 Outbound — SaaS", date: "Mon, Apr 7 · 1:00 PM PT", bookedAt: "2 weeks ago", status: "Cancelled" },
];

export const activity: ActivityItem[] = [
  { id: "a1", text: "Campaign 'Q2 Outbound — SaaS' sent 45 emails", at: "12 min ago" },
  { id: "a2", text: "Sarah Mitchell replied to 'Quick idea for Vertex's SDR team'", at: "14 min ago" },
  { id: "a3", text: "New meeting booked by Priya Raman (Helix Bio)", at: "1 hr ago" },
  { id: "a4", text: "Lead enrichment completed for 12 leads", at: "2 hr ago" },
  { id: "a5", text: "Campaign 'Fintech ABM' was paused", at: "5 hr ago" },
  { id: "a6", text: "Imported 24 new leads from Google Sheets", at: "Yesterday" },
  { id: "a7", text: "AI generated 3 reply drafts in inbox", at: "Yesterday" },
  { id: "a8", text: "Campaign 'Logistics Trial' marked as completed", at: "2 days ago" },
];

export const performanceSeries = [
  { day: "Apr 1", sent: 120, opens: 64, replies: 12 },
  { day: "Apr 4", sent: 180, opens: 102, replies: 18 },
  { day: "Apr 7", sent: 220, opens: 132, replies: 22 },
  { day: "Apr 10", sent: 260, opens: 162, replies: 28 },
  { day: "Apr 13", sent: 240, opens: 144, replies: 24 },
  { day: "Apr 16", sent: 310, opens: 198, replies: 38 },
  { day: "Apr 19", sent: 360, opens: 232, replies: 47 },
  { day: "Apr 22", sent: 410, opens: 270, replies: 56 },
  { day: "Apr 25", sent: 380, opens: 248, replies: 49 },
  { day: "Apr 28", sent: 430, opens: 290, replies: 62 },
];

export const weeklyBars = [
  { week: "W1", sent: 620, replies: 88 },
  { week: "W2", sent: 740, replies: 112 },
  { week: "W3", sent: 810, replies: 138 },
  { week: "W4", sent: 920, replies: 162 },
];

export const replyBreakdown = [
  { name: "Interested", value: 38 },
  { name: "Not Interested", value: 22 },
  { name: "Out of Office", value: 14 },
  { name: "Question", value: 18 },
  { name: "No Reply", value: 8 },
];

export const followupSteps = [
  { id: "s1", label: "Initial Email", day: 0 },
  { id: "s2", label: "Follow-up 1", day: 3 },
  { id: "s3", label: "Follow-up 2", day: 7 },
  { id: "s4", label: "Final Nudge", day: 14 },
];

export const trainingEmails = [
  { id: "te1", subject: "Loved your launch post — quick thought", body: "Hi {{firstName}}, congrats on the new {{product}} launch. We work with teams like yours to..." },
  { id: "te2", subject: "Saw your team's hiring spree", body: "Hi {{firstName}}, noticed you're scaling the GTM team — wanted to share a quick idea..." },
];

export const teamMembers = [
  { id: "u1", name: "Alex Rivera", email: "alex@rapidships.com", role: "Admin" },
  { id: "u2", name: "Jamie Wong", email: "jamie@rapidships.com", role: "Manager" },
  { id: "u3", name: "Priya Shah", email: "priya@rapidships.com", role: "User" },
];

export const billingHistory = [
  { id: "b1", date: "Apr 1, 2026", amount: "$149.00", invoice: "#INV-2042" },
  { id: "b2", date: "Mar 1, 2026", amount: "$149.00", invoice: "#INV-2031" },
  { id: "b3", date: "Feb 1, 2026", amount: "$149.00", invoice: "#INV-2019" },
];
