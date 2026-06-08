import { describe, expect, it } from "vitest";
import { mapCampaignApiToDuplicateRequest } from "@/lib/campaignPresentation";
import { parseCreateCampaignPayload } from "@/validators/campaign";
import type { CampaignApiModel } from "@/types";

describe("mapCampaignApiToDuplicateRequest", () => {
  it("sanitizes duplicate campaign payload fields so validation passes", () => {
    const sourceCampaign: CampaignApiModel = {
      id: "campaign-1",
      user_id: "user-1",
      name: "Q2 Launch!",
      goal: "Generate new outbound leads for Q2.",
      target_zone: "North America!",
      call_to_action: "Let's talk now!",
      run_mode: "auto",
      lead_source: "both",
      target_tone: "Friendly",
      mail_training_instruction: "Write in a warm tone.",
      mail_template_samples: [],
      sender_display_name: "Alex",
      sender_address: "123 Main St, Anytown",
      sender_phone: "+14151234567",
      target_leads: 100,
      status: "active",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-02T00:00:00Z"
    };

    const payload = mapCampaignApiToDuplicateRequest(sourceCampaign);
    const parsed = parseCreateCampaignPayload(payload);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.name).toBe("Q2 Launch Copy");
      expect(parsed.data.target_zone).toBe("North America");
      expect(parsed.data.call_to_action).toBe("Lets talk now");
      expect(parsed.data.status).toBe("draft");
    }
  });

  it("falls back to the default mail training instruction when the source is null", () => {
    const sourceCampaign: CampaignApiModel = {
      id: "campaign-3",
      user_id: "user-1",
      name: "Autumn Campaign",
      goal: "Convert prospects.",
      target_zone: "APAC",
      call_to_action: "Schedule a call",
      run_mode: "auto",
      lead_source: "old",
      target_tone: "Consultative",
      mail_training_instruction: null,
      mail_template_samples: [],
      sender_display_name: "Jordan",
      sender_address: "789 Market Rd",
      sender_phone: "+17185551234",
      target_leads: 75,
      status: "draft",
      created_at: "2026-01-10T00:00:00Z",
      updated_at: "2026-01-11T00:00:00Z"
    };

    const payload = mapCampaignApiToDuplicateRequest(sourceCampaign);
    const parsed = parseCreateCampaignPayload(payload);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.mail_training_instruction).toBe("Write in a warm, conversational tone.");
      expect(parsed.data.status).toBe("draft");
    }
  });

  it("uses the provided duplicate name when options.name is set and sanitizes it", () => {
    const sourceCampaign: CampaignApiModel = {
      id: "campaign-2",
      user_id: "user-1",
      name: "Summer Campaign",
      goal: "Reach new leads.",
      target_zone: "EMEA",
      call_to_action: "Book a demo",
      run_mode: "manual",
      lead_source: "new",
      target_tone: "Professional",
      mail_training_instruction: "Use a professional tone.",
      mail_template_samples: [],
      sender_display_name: "Alicia",
      sender_address: "456 Broad Ave",
      sender_phone: "+16175551234",
      target_leads: 50,
      status: "paused",
      created_at: "2026-01-05T00:00:00Z",
      updated_at: "2026-01-06T00:00:00Z"
    };

    const payload = mapCampaignApiToDuplicateRequest(sourceCampaign, {
      name: "Summer Campaign 2026!!!"
    });
    const parsed = parseCreateCampaignPayload(payload);

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.name).toBe("Summer Campaign 2026");
      expect(parsed.data.status).toBe("draft");
    }
  });
});
