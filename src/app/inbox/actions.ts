"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";
import { syncLeadIntelligence } from "@/lib/lead-intelligence-server";

const replySchema = z.object({
  body: z.string().trim().min(6).max(4000),
});

function revalidateInboxPaths(leadId?: string) {
  revalidatePath("/inbox");
  revalidatePath("/dashboard");
  revalidatePath("/activity");

  if (leadId) {
    revalidatePath(`/leads/${leadId}`);
    revalidatePath("/leads");
  }
}

export async function classifyInboxThread(threadId: string, nextClassification: string, redirectPath: string, formData?: FormData) {
  void formData;
  const currentUser = await requireCurrentUser();

  const thread = await prisma.inboxThread.findUnique({
    where: { id: threadId },
    include: { lead: true },
  });

  if (!thread) {
    throw new Error("Thread not found.");
  }

  const nextStatus = nextClassification === "SPAM" ? "CLOSED" : nextClassification === "INTERESTED" ? "RESPONDED" : "NEEDS_REVIEW";

  await prisma.inboxThread.update({
    where: { id: threadId },
    data: {
      classification: nextClassification,
      status: nextStatus,
    },
  });

  if (nextClassification === "INTERESTED") {
    await prisma.lead.update({ where: { id: thread.leadId }, data: { status: "INTERESTED" } });
    await prisma.leadSignal.create({
      data: {
        leadId: thread.leadId,
        signalType: "REPLY",
        label: "Positive reply received",
        source: "Inbox classification",
        score: 25,
        metadata: JSON.stringify({ classification: nextClassification }),
      },
    });
  }

  if (nextClassification === "OBJECTION" || nextClassification === "NOT_NOW") {
    await prisma.lead.update({ where: { id: thread.leadId }, data: { status: "REPLIED" } });
    await prisma.leadSignal.create({
      data: {
        leadId: thread.leadId,
        signalType: "REPLY",
        label: nextClassification === "OBJECTION" ? "Objection captured" : "Timing objection captured",
        source: "Inbox classification",
        score: nextClassification === "OBJECTION" ? 12 : 8,
        metadata: JSON.stringify({ classification: nextClassification }),
      },
    });
  }

  if (nextClassification === "SPAM") {
    await prisma.lead.update({ where: { id: thread.leadId }, data: { status: "REJECTED" } });
  }

  await prisma.feedbackEntry.create({
    data: {
      leadId: thread.leadId,
      agentId: thread.agentId,
      createdById: currentUser.id,
      feedbackType: "TRAINING",
      sentiment: nextClassification === "INTERESTED" ? "POSITIVE" : nextClassification === "SPAM" ? "NEGATIVE" : "NEUTRAL",
      note: `Inbox classified as ${nextClassification}.`,
    },
  });

  if (thread.agentId) {
    await prisma.agentMemoryEntry.create({
      data: {
        agentId: thread.agentId,
        memoryType: "CONTEXT",
        title: `Inbox classification: ${nextClassification}`,
        content: `Lead ${thread.lead.fullName} was classified as ${nextClassification.toLowerCase()}.`,
        impactScore: nextClassification === "INTERESTED" ? 78 : 42,
      },
    });
  }

  await prisma.activityLog.create({
    data: {
      leadId: thread.leadId,
      type: "INBOX_CLASSIFIED",
      message: `Thread classified as ${nextClassification} by ${currentUser.name}.`,
    },
  });

  await syncLeadIntelligence(thread.leadId);
  revalidateInboxPaths(thread.leadId);
  redirect(redirectPath);
}

export async function sendInboxReply(threadId: string, redirectPath: string, formData: FormData) {
  const currentUser = await requireCurrentUser();

  const parsed = replySchema.safeParse({
    body: formData.get("body"),
  });

  if (!parsed.success) {
    throw new Error("Invalid reply payload.");
  }

  const thread = await prisma.inboxThread.findUnique({ where: { id: threadId }, include: { lead: true } });

  if (!thread) {
    throw new Error("Thread not found.");
  }

  await prisma.inboxMessage.create({
    data: {
      threadId,
      direction: "OUTBOUND",
      senderName: currentUser.name,
      senderEmail: currentUser.email,
      body: parsed.data.body,
      status: "SENT",
    },
  });

  await prisma.inboxThread.update({
    where: { id: threadId },
    data: {
      status: "RESPONDED",
      lastMessageAt: new Date(),
      summary: parsed.data.body.slice(0, 160),
    },
  });

  await prisma.activityLog.create({
    data: {
      leadId: thread.leadId,
      type: "INBOX_REPLIED",
      message: `Reply sent to ${thread.lead.fullName}.`,
    },
  });

  if (thread.lead.status === "APPROVED" || thread.lead.status === "REVIEW" || thread.lead.status === "NEW") {
    await prisma.lead.update({ where: { id: thread.leadId }, data: { status: "CONTACTED" } });
  }

  revalidateInboxPaths(thread.leadId);
  redirect(redirectPath);
}