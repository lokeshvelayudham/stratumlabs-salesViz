export const CRM_STATUS_OPTIONS = [
  "NEW",
  "REVIEW",
  "APPROVED",
  "CONTACTED",
  "REPLIED",
  "INTERESTED",
  "CLOSED",
  "REJECTED",
] as const;

export const CRM_STATUS_ORDER = [
  "NEW",
  "REVIEW",
  "APPROVED",
  "CONTACTED",
  "REPLIED",
  "INTERESTED",
  "CLOSED",
] as const;

export const LEAD_TIER_OPTIONS = ["TIER1", "TIER2", "TIER3", "UNRANKED"] as const;

export const CRM_STAGE_CONFIG = {
  NEW: {
    label: "New",
    description: "Fresh leads that still need qualification.",
  },
  REVIEW: {
    label: "Review",
    description: "Qualified enough to inspect and prioritize.",
  },
  APPROVED: {
    label: "Approved",
    description: "Ready for a human or AI-crafted outreach step.",
  },
  CONTACTED: {
    label: "Contacted",
    description: "An outbound touch has already been sent.",
  },
  REPLIED: {
    label: "Replied",
    description: "The account has responded and needs follow-up.",
  },
  INTERESTED: {
    label: "Interested",
    description: "Positive signal received. Move toward a demo or close.",
  },
  CLOSED: {
    label: "Closed",
    description: "Finished deals and completed motions.",
  },
  REJECTED: {
    label: "Rejected",
    description: "Disqualified or intentionally removed from the pipeline.",
  },
} as const;

type DraftTemplateLead = {
  fullName: string;
  firstName?: string | null;
  researchArea?: string | null;
  institution?: string | null;
  role?: string | null;
  whyRelevant?: string | null;
};

export function getLeadFirstName(fullName: string, fallback?: string | null) {
  if (fallback?.trim()) {
    return fallback.trim();
  }

  const [firstName] = fullName.trim().split(/\s+/);
  return firstName || "there";
}

export function splitLeadName(fullName: string) {
  const trimmedName = fullName.trim();
  const nameParts = trimmedName.split(/\s+/);
  const firstName = nameParts[0] ?? "";
  const lastName = nameParts.slice(1).join(" ");

  return {
    firstName: firstName || null,
    lastName: lastName || null,
  };
}

export function buildLeadDraftTemplate(lead: DraftTemplateLead) {
  const firstName = getLeadFirstName(lead.fullName, lead.firstName);
  const researchFocus = lead.researchArea?.split(",")[0]?.trim() || "your current research priorities";
  const institution = lead.institution?.trim() || "your team";
  const role = lead.role?.trim() || "your role";
  const relevanceLine = lead.whyRelevant?.trim()
    ? `We flagged your work because ${lead.whyRelevant.trim()}`
    : "We flagged your work because it looks like a strong fit for automated outbound and qualification workflows.";

  return {
    subject: `Exploring ${researchFocus} at ${institution}`,
    body: `Hi ${firstName},\n\nI have been reviewing ${researchFocus} programs and your work at ${institution} stood out. ${relevanceLine}\n\nStratum helps lean teams run prospecting, enrichment, and follow-up without adding manual ops overhead. I thought it might be useful to compare notes on how your team currently handles that motion for ${role}.\n\nWould you be open to a short conversation next week?\n\nBest,\nStratum Labs`,
  };
}