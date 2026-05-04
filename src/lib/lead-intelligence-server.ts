import { prisma } from "@/lib/db";
import { computeLeadIntelligence } from "@/lib/lead-intelligence";

export async function syncLeadIntelligence(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: {
      fitScore: true,
      signals: {
        select: {
          signalType: true,
          score: true,
        },
      },
    },
  });

  if (!lead) {
    return null;
  }

  const scores = computeLeadIntelligence(lead.fitScore, lead.signals);

  await prisma.lead.update({
    where: { id: leadId },
    data: {
      intentScore: scores.intentScore,
      icpScore: scores.icpScore,
      priorityScore: scores.priorityScore,
      scoreUpdatedAt: new Date(),
    },
  });

  return scores;
}