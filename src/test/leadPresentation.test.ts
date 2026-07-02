import { describe, expect, it } from "vitest";
import {
  formatSnakeCaseLabel,
  mapApiStatusToPresentation,
  mapLeadApiToListRow,
  normalizeLeadText
} from "@/lib/leadPresentation";
import type { LeadApiModel } from "@/types";

describe("normalizeLeadText", () => {
  it("returns empty string for null and undefined", () => {
    expect(normalizeLeadText(null)).toBe("");
    expect(normalizeLeadText(undefined)).toBe("");
  });
});

describe("formatSnakeCaseLabel", () => {
  it("handles null department values without throwing", () => {
    expect(formatSnakeCaseLabel(null)).toBe("");
    expect(formatSnakeCaseLabel("master_operations")).toBe("Master Operations");
  });
});

describe("mapLeadApiToListRow", () => {
  it("maps leads with missing nullable fields", () => {
    const lead = {
      id: 1,
      created_at: "2026-01-01T00:00:00Z",
      fullName: null,
      firstName: null,
      lastName: null,
      title: null,
      email: null,
      emailStatus: null,
      linkedin: null,
      city: null,
      state: null,
      country: null,
      company: null,
      domain: null,
      industry: null,
      employees: null,
      revenue: null,
      companyPhone: null,
      compantyState: null,
      seniority: null,
      department: null,
      dateAdded: null,
      fitTag: null,
      fitScore: null,
      fitReason: null,
      emailSource: null,
      emailSent: null,
      emailSentDate: null,
      emailSubject: null,
      emailBody: null,
      linkedinSent: null,
      linkedSentDate: null,
      linkedinMessage: null,
      replyReceived: null,
      replyDate: null,
      companyCity: null,
      notes: null,
      outreachStatus: null
    } as unknown as LeadApiModel;

    expect(mapLeadApiToListRow(lead)).toMatchObject({
      name: "—",
      company: "—",
      email: "",
      status: "new"
    });
  });
});

describe("mapApiStatusToPresentation", () => {
  it("handles null outreach fields", () => {
    expect(mapApiStatusToPresentation(null, null)).toBe("new");
  });
});
