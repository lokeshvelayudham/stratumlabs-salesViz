"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { generateOutreachEmail } from "@/lib/ai/aiClient";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { CRM_STATUS_OPTIONS, LEAD_TIER_OPTIONS, buildLeadDraftTemplate, splitLeadName } from "@/lib/crm";
import { prisma } from "@/lib/db";
import { syncLeadIntelligence } from "@/lib/lead-intelligence-server";

type LeadStatus = (typeof CRM_STATUS_OPTIONS)[number];

const leadProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().email().or(z.literal("")).transform((value) => value || null),
  institution: z.string().trim().max(140).or(z.literal("")).transform((value) => value || null),
  role: z.string().trim().max(120).or(z.literal("")).transform((value) => value || null),
  researchArea: z.string().trim().max(160).or(z.literal("")).transform((value) => value || null),
  status: z.enum(CRM_STATUS_OPTIONS),
  tier: z.enum(LEAD_TIER_OPTIONS),
});

const noteSchema = z.object({
  notes: z.string().trim().max(4000).or(z.literal("")).transform((value) => value || null),
});

const signalSchema = z.object({
  signalType: z.string().trim().min(3).max(24),
  label: z.string().trim().min(3).max(120),
  source: z.string().trim().max(120).or(z.literal("")).transform((value) => value || null),
  score: z.coerce.number().int().min(0).max(100),
});

const attributionSchema = z.object({
  agentId: z.string().trim().optional().or(z.literal("")),
  amount: z.coerce.number().int().min(1).max(100_000_000),
  campaignName: z.string().trim().max(120).or(z.literal("")).transform((value) => value || null),
  strategyLabel: z.string().trim().max(120).or(z.literal("")).transform((value) => value || null),
  note: z.string().trim().max(4000).or(z.literal("")).transform((value) => value || null),
});

const feedbackSchema = z.object({
  agentId: z.string().trim().optional().or(z.literal("")),
  draftId: z.string().trim().optional().or(z.literal("")),
  feedbackType: z.string().trim().min(4).max(24),
  sentiment: z.string().trim().min(4).max(12),
  score: z.coerce.number().int().min(0).max(100).optional(),
  note: z.string().trim().min(4).max(4000),
});

function revalidateCrmPaths(leadId?: string) {
  revalidatePath("/dashboard");
  revalidatePath("/leads");
  revalidatePath("/outreach");
  revalidatePath("/activity");

  if (leadId) {
    revalidatePath(`/leads/${leadId}`);
  }
}

async function logLeadActivity(leadId: string, type: string, message: string) {
  await prisma.activityLog.create({
    data: {
      leadId,
      type,
      message,
    },
  });
}

export async function updateLeadProfile(leadId: string, redirectPath: string, formData: FormData) {
  await requireCurrentUser();

  const existingLead = await prisma.lead.findUnique({ where: { id: leadId } });

  if (!existingLead) {
    throw new Error("Lead not found.");
  }

  const parsed = leadProfileSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    institution: formData.get("institution"),
    role: formData.get("role"),
    researchArea: formData.get("researchArea"),
    status: formData.get("status"),
    tier: formData.get("tier"),
  });

  if (!parsed.success) {
    throw new Error("Invalid CRM record payload.");
  }

  const { firstName, lastName } = splitLeadName(parsed.data.fullName);

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      fullName: parsed.data.fullName,
      firstName,
      lastName,
      email: parsed.data.email,
      institution: parsed.data.institution,
      role: parsed.data.role,
      researchArea: parsed.data.researchArea,
      status: parsed.data.status,
      tier: parsed.data.tier,
    },
  });

  const changedFields = [
    existingLead.fullName !== parsed.data.fullName ? "name" : null,
    existingLead.email !== parsed.data.email ? "email" : null,
    existingLead.institution !== parsed.data.institution ? "institution" : null,
    existingLead.role !== parsed.data.role ? "role" : null,
    existingLead.researchArea !== parsed.data.researchArea ? "research area" : null,
    existingLead.status !== parsed.data.status ? `status -> ${parsed.data.status}` : null,
    existingLead.tier !== parsed.data.tier ? `tier -> ${parsed.data.tier}` : null,
  ].filter(Boolean);

  await logLeadActivity(
    leadId,
    "LEAD_UPDATED",
    changedFields.length > 0
      ? `CRM record updated: ${changedFields.join(", ")}.`
      : "CRM record saved with no visible field changes."
  );

  await syncLeadIntelligence(leadId);
  revalidateCrmPaths(leadId);
  redirect(redirectPath);
}

export async function saveLeadNote(leadId: string, redirectPath: string, formData: FormData) {
  await requireCurrentUser();

  const parsed = noteSchema.safeParse({
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    throw new Error("Invalid note payload.");
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: { notes: parsed.data.notes },
  });

  await logLeadActivity(leadId, "NOTE_SAVED", parsed.data.notes ? "Lead notes updated." : "Lead notes cleared.");

  revalidateCrmPaths(leadId);
  redirect(redirectPath);
}

export async function setLeadStatus(leadId: string, nextStatus: LeadStatus, redirectPath: string, formData?: FormData) {
  void formData;
  await requireCurrentUser();

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });

  if (!lead) {
    throw new Error("Lead not found.");
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: { status: nextStatus },
  });

  await logLeadActivity(
    leadId,
    "LEAD_STATUS_UPDATED",
    lead.status === nextStatus
      ? `Lead status confirmed as ${nextStatus}.`
      : `Lead moved from ${lead.status} to ${nextStatus}.`
  );

  revalidateCrmPaths(leadId);
  redirect(redirectPath);
}

export async function addLeadSignal(leadId: string, redirectPath: string, formData: FormData) {
  await requireCurrentUser();

  const parsed = signalSchema.safeParse({
    signalType: formData.get("signalType"),
    label: formData.get("label"),
    source: formData.get("source"),
    score: formData.get("score"),
  });

  if (!parsed.success) {
    throw new Error("Invalid lead signal.");
  }

  await prisma.leadSignal.create({
    data: {
      leadId,
      signalType: parsed.data.signalType,
      label: parsed.data.label,
      source: parsed.data.source,
      score: parsed.data.score,
      metadata: JSON.stringify({ source: parsed.data.source }),
    },
  });

  await syncLeadIntelligence(leadId);
  await logLeadActivity(leadId, "SIGNAL_ADDED", `Signal added: ${parsed.data.label} (${parsed.data.signalType}).`);

  revalidateCrmPaths(leadId);
  redirect(redirectPath);
}

export async function recordLeadAttribution(leadId: string, redirectPath: string, formData: FormData) {
  await requireCurrentUser();

  const parsed = attributionSchema.safeParse({
    agentId: formData.get("agentId"),
    amount: formData.get("amount"),
    campaignName: formData.get("campaignName"),
    strategyLabel: formData.get("strategyLabel"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    throw new Error("Invalid attribution payload.");
  }

  const agentId = parsed.data.agentId || null;

  await prisma.revenueAttribution.create({
    data: {
      leadId,
      agentId,
      amount: parsed.data.amount,
      campaignName: parsed.data.campaignName,
      strategyLabel: parsed.data.strategyLabel,
      note: parsed.data.note,
    },
  });

  if (agentId) {
    const agent = await prisma.swarmAgent.findUnique({ where: { id: agentId } });

    if (agent) {
      await prisma.swarmAgent.update({
        where: { id: agentId },
        data: {
          revenue: agent.revenue + parsed.data.amount,
        },
      });
    }
  }

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: "CLOSED",
      assignedAgentId: agentId,
    },
  });

  await logLeadActivity(leadId, "REVENUE_ATTRIBUTED", `Revenue attributed: $${parsed.data.amount}.`);
  revalidateCrmPaths(leadId);
  revalidatePath("/swarm");
  revalidatePath("/dashboard");
  redirect(redirectPath);
}

export async function recordLeadFeedback(leadId: string, redirectPath: string, formData: FormData) {
  const currentUser = await requireCurrentUser();

  const parsed = feedbackSchema.safeParse({
    agentId: formData.get("agentId"),
    draftId: formData.get("draftId"),
    feedbackType: formData.get("feedbackType"),
    sentiment: formData.get("sentiment"),
    score: formData.get("score") || undefined,
    note: formData.get("note"),
  });

  if (!parsed.success) {
    throw new Error("Invalid feedback payload.");
  }

  const agentId = parsed.data.agentId || null;
  const draftId = parsed.data.draftId || null;

  await prisma.feedbackEntry.create({
    data: {
      leadId,
      agentId,
      draftId,
      createdById: currentUser.id,
      feedbackType: parsed.data.feedbackType,
      sentiment: parsed.data.sentiment,
      score: parsed.data.score,
      note: parsed.data.note,
    },
  });

  if (agentId) {
    await prisma.swarmAgent.update({
      where: { id: agentId },
      data: {
        lastImprovementNote: parsed.data.note.slice(0, 160),
      },
    });

    await prisma.agentMemoryEntry.create({
      data: {
        agentId,
        memoryType: "CONTEXT",
        title: `Feedback: ${parsed.data.feedbackType}`,
        content: parsed.data.note,
        impactScore: parsed.data.score ?? 50,
      },
    });
  }

  await logLeadActivity(leadId, "FEEDBACK_CAPTURED", `${parsed.data.feedbackType} feedback captured.`);

  revalidateCrmPaths(leadId);
  revalidatePath("/swarm");
  redirect(redirectPath);
}

export async function createOutreachDraft(leadId: string, redirectPath: string, formData?: FormData) {
  void formData;
  await requireCurrentUser();

  const lead = await prisma.lead.findUnique({ where: { id: leadId } });

  if (!lead) {
    throw new Error("Lead not found.");
  }

  let body: string;
  let subject: string;
  let modelName = "CRM Template";

  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.OPENAI_API_KEY) {
      throw new Error("No LLM provider configured.");
    }

    const generated = await generateOutreachEmail({
      firstName: lead.firstName || splitLeadName(lead.fullName).firstName || "there",
      lastName: lead.lastName || splitLeadName(lead.fullName).lastName || "",
      role: lead.role || "buyer",
      researchArea: lead.researchArea || "your current priorities",
      whyRelevant: lead.whyRelevant || "your profile is a strong fit for our outbound workflows",
    });
    const fallbackDraft = buildLeadDraftTemplate(lead);

    subject = fallbackDraft.subject;
    body = generated.email;
    modelName = generated.modelName;
  } catch {
    const fallbackDraft = buildLeadDraftTemplate(lead);
    subject = fallbackDraft.subject;
    body = fallbackDraft.body;
  }

  await prisma.outreachDraft.create({
    data: {
      leadId,
      subject,
      body,
      aiModel: modelName,
      status: "PENDING_REVIEW",
    },
  });

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      status: lead.status === "NEW" ? "APPROVED" : lead.status,
    },
  });

  await logLeadActivity(leadId, "DRAFT_CREATED", `Outreach draft created with ${modelName}.`);

  revalidateCrmPaths(leadId);
  redirect(redirectPath);
}

export async function setDraftStatus(
  draftId: string,
  nextStatus: "APPROVED" | "SENT" | "REJECTED" | "ARCHIVED",
  redirectPath: string,
  formData?: FormData,
) {
  void formData;
  const currentUser = await requireCurrentUser();

  const draft = await prisma.outreachDraft.findUnique({
    where: { id: draftId },
    include: { lead: true },
  });

  if (!draft) {
    throw new Error("Draft not found.");
  }

  await prisma.outreachDraft.update({
    where: { id: draftId },
    data: { status: nextStatus },
  });

  if (nextStatus === "SENT") {
    await prisma.lead.update({
      where: { id: draft.leadId },
      data: {
        status: draft.lead.status === "INTERESTED" ? draft.lead.status : "CONTACTED",
      },
    });

    const existingThread = await prisma.inboxThread.findFirst({
      where: { leadId: draft.leadId, subject: draft.subject },
    });

    const thread = existingThread
      ? await prisma.inboxThread.update({
          where: { id: existingThread.id },
          data: {
            status: "OPEN",
            summary: draft.body.slice(0, 160),
            lastMessageAt: new Date(),
          },
        })
      : await prisma.inboxThread.create({
          data: {
            leadId: draft.leadId,
            agentId: draft.lead.assignedAgentId,
            subject: draft.subject,
            status: "OPEN",
            summary: draft.body.slice(0, 160),
          },
        });

    await prisma.inboxMessage.create({
      data: {
        threadId: thread.id,
        direction: "OUTBOUND",
        senderName: currentUser.name,
        senderEmail: currentUser.email,
        body: draft.body,
        status: "SENT",
      },
    });
  }

  if (nextStatus === "REJECTED" && draft.lead.status === "APPROVED") {
    await prisma.lead.update({
      where: { id: draft.leadId },
      data: { status: "REVIEW" },
    });
  }

  const activityMessage =
    nextStatus === "SENT"
      ? `Outreach draft sent to ${draft.lead.fullName}.`
      : nextStatus === "APPROVED"
        ? `Outreach draft approved for ${draft.lead.fullName}.`
        : nextStatus === "ARCHIVED"
          ? `Outreach draft archived for ${draft.lead.fullName}.`
          : `Outreach draft rejected for ${draft.lead.fullName}.`;

  if (nextStatus === "APPROVED" || nextStatus === "REJECTED") {
    await prisma.feedbackEntry.create({
      data: {
        leadId: draft.leadId,
        agentId: draft.lead.assignedAgentId,
        draftId: draft.id,
        createdById: currentUser.id,
        feedbackType: nextStatus,
        sentiment: nextStatus === "APPROVED" ? "POSITIVE" : "NEGATIVE",
        note: activityMessage,
      },
    });
  }

  if (draft.lead.assignedAgentId && (nextStatus === "APPROVED" || nextStatus === "REJECTED")) {
    await prisma.agentMemoryEntry.create({
      data: {
        agentId: draft.lead.assignedAgentId,
        memoryType: nextStatus === "APPROVED" ? "SUCCESS" : "FAILURE",
        title: `Draft ${nextStatus.toLowerCase()}`,
        content: activityMessage,
        impactScore: nextStatus === "APPROVED" ? 74 : 28,
      },
    });
  }

  await logLeadActivity(draft.leadId, `DRAFT_${nextStatus}`, activityMessage);

  revalidateCrmPaths(draft.leadId);
  revalidatePath("/inbox");
  revalidatePath("/swarm");
  redirect(redirectPath);
}