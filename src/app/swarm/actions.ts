"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireCurrentUser } from "@/lib/auth/current-user";
import { prisma } from "@/lib/db";

const createAgentSchema = z.object({
  name: z.string().trim().min(2).max(80),
  goal: z.string().trim().min(8).max(180),
  strategy: z.string().trim().min(4).max(140),
  budget: z.coerce.number().int().min(0).max(1_000_000),
});

const memorySchema = z.object({
  memoryType: z.string().trim().min(3).max(24),
  title: z.string().trim().min(3).max(80),
  content: z.string().trim().min(8).max(4000),
  campaignKey: z.string().trim().max(80).optional().or(z.literal("")),
  impactScore: z.coerce.number().int().min(0).max(100),
});

const spendSchema = z.object({
  amount: z.coerce.number().int().min(1).max(1_000_000),
  note: z.string().trim().min(4).max(400).optional().or(z.literal("")),
});

function revalidateSwarmPaths() {
  revalidatePath("/swarm");
  revalidatePath("/dashboard");
  revalidatePath("/pipeline");
}

export async function createSwarmAgent(formData: FormData) {
  const currentUser = await requireCurrentUser();

  const parsed = createAgentSchema.safeParse({
    name: formData.get("name"),
    goal: formData.get("goal"),
    strategy: formData.get("strategy"),
    budget: formData.get("budget"),
  });

  if (!parsed.success) {
    throw new Error("Invalid swarm configuration.");
  }

  const agent = await prisma.swarmAgent.create({
    data: {
      name: parsed.data.name,
      goal: parsed.data.goal,
      strategy: parsed.data.strategy,
      budget: parsed.data.budget,
      ownerId: currentUser.id,
      organizationId: currentUser.organizationId,
      memorySummary: `Launch strategy: ${parsed.data.strategy}`,
    },
  });

  await prisma.agentMemoryEntry.create({
    data: {
      agentId: agent.id,
      memoryType: "PLAYBOOK",
      title: "Launch directive",
      content: parsed.data.goal,
      impactScore: 72,
    },
  });

  revalidateSwarmPaths();
  redirect("/swarm");
}

export async function addAgentMemoryEntry(agentId: string, redirectPath: string, formData: FormData) {
  await requireCurrentUser();

  const parsed = memorySchema.safeParse({
    memoryType: formData.get("memoryType"),
    title: formData.get("title"),
    content: formData.get("content"),
    campaignKey: formData.get("campaignKey"),
    impactScore: formData.get("impactScore"),
  });

  if (!parsed.success) {
    throw new Error("Invalid agent memory payload.");
  }

  await prisma.agentMemoryEntry.create({
    data: {
      agentId,
      memoryType: parsed.data.memoryType,
      title: parsed.data.title,
      content: parsed.data.content,
      campaignKey: parsed.data.campaignKey || null,
      impactScore: parsed.data.impactScore,
    },
  });

  await prisma.swarmAgent.update({
    where: { id: agentId },
    data: {
      memorySummary: parsed.data.content.slice(0, 180),
      lastImprovementNote: parsed.data.title,
    },
  });

  revalidateSwarmPaths();
  redirect(redirectPath);
}

export async function setAgentState(agentId: string, nextState: string, redirectPath: string, formData?: FormData) {
  void formData;
  await requireCurrentUser();

  await prisma.swarmAgent.update({
    where: { id: agentId },
    data: { state: nextState },
  });

  revalidateSwarmPaths();
  redirect(redirectPath);
}

export async function recordAgentSpend(agentId: string, redirectPath: string, formData: FormData) {
  await requireCurrentUser();

  const parsed = spendSchema.safeParse({
    amount: formData.get("amount"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    throw new Error("Invalid spend event.");
  }

  const agent = await prisma.swarmAgent.findUnique({ where: { id: agentId } });

  if (!agent) {
    throw new Error("Agent not found.");
  }

  await prisma.swarmAgent.update({
    where: { id: agentId },
    data: {
      spend: agent.spend + parsed.data.amount,
      lastImprovementNote: parsed.data.note || agent.lastImprovementNote,
    },
  });

  await prisma.agentMemoryEntry.create({
    data: {
      agentId,
      memoryType: "CONTEXT",
      title: "Capital allocated",
      content: parsed.data.note || `Spend event recorded: $${parsed.data.amount}.`,
      impactScore: 48,
    },
  });

  revalidateSwarmPaths();
  redirect(redirectPath);
}