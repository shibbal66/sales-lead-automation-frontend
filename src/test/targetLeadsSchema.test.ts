import { describe, expect, it } from "vitest";
import { createCampaignSchemaForPlan, buildBulkLeadAddCountSchema } from "@/validators/campaign";
import { getCampaignLeadCapacity, getLeadCountPresets } from "@/lib/billing";

describe("createCampaignSchemaForPlan", () => {
  it("rejects target leads above the plan limit", () => {
    const schema = createCampaignSchemaForPlan(500);
    const result = schema.safeParse({
      name: "Q2 Outreach",
      goal: "Book meetings with SaaS founders",
      target_zone: "United States",
      call_to_action: "Book a call",
      run_mode: "manual",
      target_tone: "Professional",
      mail_training_instruction: "Keep emails concise and personalized.",
      mail_template_samples: [],
      lead_source: "both",
      sender_display_name: "Alex Morgan",
      sender_address: "123 Main St, Austin, TX",
      sender_phone: "+15551234567",
      target_leads: 501,
      status: "draft"
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.target_leads?.[0]).toContain("500");
    }
  });

  it("accepts target leads at the plan limit", () => {
    const schema = createCampaignSchemaForPlan(500);
    const result = schema.safeParse({
      name: "Q2 Outreach",
      goal: "Book meetings with SaaS founders",
      target_zone: "United States",
      call_to_action: "Book a call",
      run_mode: "manual",
      target_tone: "Professional",
      mail_training_instruction: "Keep emails concise and personalized.",
      mail_template_samples: [],
      lead_source: "both",
      sender_display_name: "Alex Morgan",
      sender_address: "123 Main St, Austin, TX",
      sender_phone: "+15551234567",
      target_leads: 500,
      status: "draft"
    });

    expect(result.success).toBe(true);
  });
});

describe("getLeadCountPresets", () => {
  it("filters presets by plan limit and includes the max when unique", () => {
    expect(getLeadCountPresets(100)).toEqual([50, 100]);
    expect(getLeadCountPresets(500)).toEqual([50, 100, 250, 500]);
    expect(getLeadCountPresets(1000)).toEqual([50, 100, 250, 500, 1000]);
  });
});

describe("getCampaignLeadCapacity", () => {
  it("uses the lower of plan limit and campaign target", () => {
    expect(
      getCampaignLeadCapacity({
        maxLeadsPerCampaign: 500,
        currentLeadCount: 120,
        campaignTargetLeads: 250
      })
    ).toEqual({ maxAllowed: 250, remainingSlots: 130 });
  });
});

describe("buildBulkLeadAddCountSchema", () => {
  it("rejects selections above remaining plan capacity", () => {
    const schema = buildBulkLeadAddCountSchema({
      maxLeadsPerCampaign: 500,
      currentLeadCount: 498,
      campaignTargetLeads: 500
    });
    const result = schema.safeParse(3);

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0]?.message).toContain("2");
    }
  });
});
