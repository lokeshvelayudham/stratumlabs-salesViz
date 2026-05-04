import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

const STOP_WORDS = new Set([
  "and",
  "for",
  "from",
  "into",
  "that",
  "this",
  "with",
  "your",
  "their",
  "about",
  "have",
  "has",
  "using",
  "used",
  "team",
  "work",
  "lead",
  "labs",
  "lab",
]);

const MANAGED_RELATION_TYPES = [
  "ASSIGNED_AGENT",
  "LEAD_SIGNAL",
  "INBOX_THREAD",
  "ATTRIBUTION",
  "FEEDBACK",
  "RELATED_LEAD",
] as const;

type GraphEntityType = "LEAD" | "AGENT" | "LEAD_SIGNAL" | "INBOX_THREAD" | "ATTRIBUTION" | "FEEDBACK";

type LeadRelationGraphItem = {
  edgeId: string;
  relationType: string;
  rationale: string;
  strength: number;
  confidence: number;
  semanticScore: number | null;
  highlights: string[];
  target: {
    entityType: string;
    entityId: string;
    label: string;
    summary: string | null;
    healthScore: number | null;
  };
};

export type LeadRelationGraph = {
  totalRelations: number;
  countsByEntityType: Record<string, number>;
  items: LeadRelationGraphItem[];
};

function clampScore(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function normalizeWhitespace(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

function tokenize(...values: Array<string | null | undefined>) {
  const tokens = new Set<string>();

  for (const value of values) {
    const normalized = normalizeWhitespace(value).toLowerCase();

    if (!normalized) {
      continue;
    }

    normalized
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
      .forEach((token) => tokens.add(token));
  }

  return [...tokens];
}

function buildFingerprint(...values: Array<string | null | undefined>) {
  const tokens = tokenize(...values);

  return tokens.length > 0 ? JSON.stringify(tokens.slice(0, 24)) : null;
}

function serializeMetadata(metadata: unknown) {
  return JSON.stringify(metadata);
}

function parseHighlights(metadata: string | null) {
  if (!metadata) {
    return [] as string[];
  }

  try {
    const parsed = JSON.parse(metadata) as { highlights?: unknown };

    return Array.isArray(parsed.highlights)
      ? parsed.highlights.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

function buildLeadSummary(lead: {
  institution: string | null;
  role: string | null;
  researchArea: string | null;
}) {
  return [lead.institution, lead.role, lead.researchArea].filter(Boolean).join(" · ") || null;
}

function buildLeadSemanticText(lead: {
  fullName: string;
  institution: string | null;
  role: string | null;
  researchArea: string | null;
  whyRelevant: string | null;
  aiSummary: string | null;
}) {
  return [lead.fullName, lead.institution, lead.role, lead.researchArea, lead.whyRelevant, lead.aiSummary]
    .filter(Boolean)
    .join(". ");
}

async function upsertGraphNode(input: {
  entityType: GraphEntityType;
  entityId: string;
  label: string;
  summary?: string | null;
  semanticText?: string | null;
  keywordFingerprint?: string | null;
  metadata?: string | null;
  healthScore?: number | null;
}) {
  return prisma.relationGraphNode.upsert({
    where: {
      entityType_entityId: {
        entityType: input.entityType,
        entityId: input.entityId,
      },
    },
    update: {
      label: input.label,
      summary: input.summary ?? null,
      semanticText: input.semanticText ?? null,
      keywordFingerprint: input.keywordFingerprint ?? null,
      metadata: input.metadata ?? null,
      healthScore: input.healthScore ?? null,
    },
    create: {
      entityType: input.entityType,
      entityId: input.entityId,
      label: input.label,
      summary: input.summary ?? null,
      semanticText: input.semanticText ?? null,
      keywordFingerprint: input.keywordFingerprint ?? null,
      metadata: input.metadata ?? null,
      healthScore: input.healthScore ?? null,
    },
  });
}

async function createGraphEdge(input: {
  sourceNodeId: string;
  targetNodeId: string;
  relationType: (typeof MANAGED_RELATION_TYPES)[number];
  rationale: string;
  strength: number;
  confidence: number;
  semanticScore?: number | null;
  metadata?: string | null;
}) {
  return prisma.relationGraphEdge.create({
    data: {
      sourceNodeId: input.sourceNodeId,
      targetNodeId: input.targetNodeId,
      relationType: input.relationType,
      rationale: input.rationale,
      strength: clampScore(input.strength),
      confidence: clampScore(input.confidence),
      semanticScore: input.semanticScore ?? null,
      metadata: input.metadata ?? null,
    },
  });
}

function scoreRelatedLead(
  lead: {
    institution: string | null;
    sourceName: string | null;
    eventName: string | null;
    assignedAgentId: string | null;
    researchArea: string | null;
    whyRelevant: string | null;
    aiSummary: string | null;
    tags: Array<{ value: string }>;
  },
  candidate: {
    institution: string | null;
    sourceName: string | null;
    eventName: string | null;
    assignedAgentId: string | null;
    researchArea: string | null;
  },
) {
  let score = 0;
  const reasons: string[] = [];
  const leadTokens = tokenize(
    lead.researchArea,
    lead.whyRelevant,
    lead.aiSummary,
    ...lead.tags.map((tag) => tag.value),
  );
  const candidateTokens = new Set(tokenize(candidate.researchArea, candidate.institution));
  const overlap = leadTokens.filter((token) => candidateTokens.has(token)).slice(0, 4);

  if (lead.institution && candidate.institution && lead.institution.toLowerCase() === candidate.institution.toLowerCase()) {
    score += 34;
    reasons.push(`Same institution: ${candidate.institution}`);
  }

  if (lead.assignedAgentId && candidate.assignedAgentId && lead.assignedAgentId === candidate.assignedAgentId) {
    score += 24;
    reasons.push("Assigned to the same swarm agent");
  }

  if (lead.sourceName && candidate.sourceName && lead.sourceName === candidate.sourceName) {
    score += 8;
    reasons.push(`Same source stream: ${candidate.sourceName}`);
  }

  if (lead.eventName && candidate.eventName && lead.eventName === candidate.eventName) {
    score += 10;
    reasons.push(`Same campaign or event: ${candidate.eventName}`);
  }

  if (overlap.length > 0) {
    score += Math.min(12 + overlap.length * 8, 36);
    reasons.push(`Shared research themes: ${overlap.join(", ")}`);
  }

  if (score < 24 || reasons.length === 0) {
    return null;
  }

  return {
    strength: clampScore(score),
    confidence: clampScore(58 + reasons.length * 10 + overlap.length * 4),
    reasons,
    overlap,
  };
}

async function syncLeadRelationGraph(leadId: string) {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    include: {
      tags: true,
      assignedAgent: {
        include: {
          organization: true,
        },
      },
      signals: {
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      inboxThreads: {
        orderBy: { lastMessageAt: "desc" },
        take: 4,
        include: {
          agent: true,
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      },
      attributions: {
        orderBy: { closedAt: "desc" },
        take: 4,
        include: {
          agent: true,
        },
      },
      feedbackEntries: {
        orderBy: { createdAt: "desc" },
        take: 4,
        include: {
          agent: true,
          createdBy: true,
          draft: true,
        },
      },
    },
  });

  if (!lead) {
    return null;
  }

  const leadSummary = buildLeadSummary(lead);
  const leadSemanticText = buildLeadSemanticText(lead);
  const leadNode = await upsertGraphNode({
    entityType: "LEAD",
    entityId: lead.id,
    label: lead.fullName,
    summary: leadSummary,
    semanticText: leadSemanticText,
    keywordFingerprint: buildFingerprint(leadSemanticText, ...lead.tags.map((tag) => tag.value)),
    metadata: serializeMetadata({
      status: lead.status,
      tier: lead.tier,
      institution: lead.institution,
      role: lead.role,
    }),
    healthScore: lead.priorityScore || lead.fitScore || null,
  });

  await prisma.relationGraphEdge.deleteMany({
    where: {
      sourceNodeId: leadNode.id,
      relationType: {
        in: [...MANAGED_RELATION_TYPES],
      },
    },
  });

  if (lead.assignedAgent) {
    const agent = lead.assignedAgent;
    const roi = agent.spend > 0 ? ((agent.revenue - agent.spend) / agent.spend) * 100 : null;
    const agentNode = await upsertGraphNode({
      entityType: "AGENT",
      entityId: agent.id,
      label: agent.name,
      summary: [agent.state, agent.goal].filter(Boolean).join(" · "),
      semanticText: [agent.goal, agent.strategy, agent.memorySummary, agent.lastImprovementNote].filter(Boolean).join(". "),
      keywordFingerprint: buildFingerprint(agent.goal, agent.strategy, agent.memorySummary, agent.lastImprovementNote),
      metadata: serializeMetadata({
        organizationId: agent.organizationId,
        organizationName: agent.organization?.name ?? null,
        state: agent.state,
        strategy: agent.strategy,
        budget: agent.budget,
        spend: agent.spend,
        revenue: agent.revenue,
      }),
      healthScore: roi === null ? null : clampScore(roi),
    });

    await createGraphEdge({
      sourceNodeId: leadNode.id,
      targetNodeId: agentNode.id,
      relationType: "ASSIGNED_AGENT",
      rationale: `${agent.name} is the active swarm owner for this lead and carries the current execution strategy.`,
      strength: 86,
      confidence: 93,
      semanticScore: roi === null ? null : clampScore(roi),
      metadata: serializeMetadata({
        highlights: [agent.state, agent.strategy],
      }),
    });
  }

  for (const signal of lead.signals) {
    const signalNode = await upsertGraphNode({
      entityType: "LEAD_SIGNAL",
      entityId: signal.id,
      label: signal.label,
      summary: [signal.signalType, signal.source].filter(Boolean).join(" · "),
      semanticText: [signal.label, signal.source, signal.metadata].filter(Boolean).join(". "),
      keywordFingerprint: buildFingerprint(signal.label, signal.source, signal.metadata),
      metadata: signal.metadata,
      healthScore: signal.score,
    });

    await createGraphEdge({
      sourceNodeId: leadNode.id,
      targetNodeId: signalNode.id,
      relationType: "LEAD_SIGNAL",
      rationale: `${signal.label} contributes directly to the lead's live intent and ICP scoring.`,
      strength: signal.score,
      confidence: 82,
      semanticScore: signal.score,
      metadata: serializeMetadata({
        highlights: [signal.signalType, signal.source].filter(Boolean),
      }),
    });
  }

  for (const thread of lead.inboxThreads) {
    const latestMessage = thread.messages[0]?.body ?? null;
    const threadNode = await upsertGraphNode({
      entityType: "INBOX_THREAD",
      entityId: thread.id,
      label: thread.subject || `Inbox thread ${thread.id.slice(0, 6)}`,
      summary: [thread.channel, thread.classification, thread.status].filter(Boolean).join(" · "),
      semanticText: [thread.summary, latestMessage].filter(Boolean).join(". "),
      keywordFingerprint: buildFingerprint(thread.subject, thread.summary, latestMessage, thread.classification),
      metadata: serializeMetadata({
        channel: thread.channel,
        classification: thread.classification,
        status: thread.status,
        agentId: thread.agentId,
      }),
      healthScore:
        thread.classification === "INTERESTED"
          ? 88
          : thread.classification === "OBJECTION"
            ? 68
            : thread.classification === "SPAM"
              ? 12
              : 48,
    });

    await createGraphEdge({
      sourceNodeId: leadNode.id,
      targetNodeId: threadNode.id,
      relationType: "INBOX_THREAD",
      rationale: `Recent conversation state is ${thread.classification.toLowerCase()} and influences both reply handling and lead progression.`,
      strength:
        thread.classification === "INTERESTED"
          ? 88
          : thread.classification === "OBJECTION"
            ? 72
            : thread.classification === "SPAM"
              ? 10
              : 52,
      confidence: thread.classification === "UNCLASSIFIED" ? 58 : 84,
      metadata: serializeMetadata({
        highlights: [thread.classification, thread.status, thread.agent?.name].filter(Boolean),
      }),
    });
  }

  for (const attribution of lead.attributions) {
    const attributionNode = await upsertGraphNode({
      entityType: "ATTRIBUTION",
      entityId: attribution.id,
      label: `$${attribution.amount.toLocaleString()} attributed revenue`,
      summary: [attribution.campaignName, attribution.strategyLabel].filter(Boolean).join(" · ") || attribution.currency,
      semanticText: [attribution.note, attribution.campaignName, attribution.strategyLabel].filter(Boolean).join(". "),
      keywordFingerprint: buildFingerprint(attribution.campaignName, attribution.strategyLabel, attribution.note),
      metadata: serializeMetadata({
        amount: attribution.amount,
        currency: attribution.currency,
        agentId: attribution.agentId,
        closedAt: attribution.closedAt.toISOString(),
      }),
      healthScore: clampScore(50 + attribution.amount / 2500),
    });

    await createGraphEdge({
      sourceNodeId: leadNode.id,
      targetNodeId: attributionNode.id,
      relationType: "ATTRIBUTION",
      rationale: `This lead has already generated attributed revenue tied to a live campaign or closing strategy.`,
      strength: clampScore(58 + attribution.amount / 2500),
      confidence: 90,
      semanticScore: clampScore(48 + attribution.amount / 4000),
      metadata: serializeMetadata({
        highlights: [attribution.agent?.name, attribution.campaignName, attribution.strategyLabel].filter(Boolean),
      }),
    });
  }

  for (const feedbackEntry of lead.feedbackEntries) {
    const feedbackNode = await upsertGraphNode({
      entityType: "FEEDBACK",
      entityId: feedbackEntry.id,
      label: `${feedbackEntry.feedbackType} feedback`,
      summary: [feedbackEntry.sentiment, feedbackEntry.agent?.name, feedbackEntry.createdBy?.name].filter(Boolean).join(" · "),
      semanticText: [feedbackEntry.note, feedbackEntry.feedbackType, feedbackEntry.sentiment].filter(Boolean).join(". "),
      keywordFingerprint: buildFingerprint(feedbackEntry.note, feedbackEntry.feedbackType, feedbackEntry.sentiment),
      metadata: serializeMetadata({
        score: feedbackEntry.score,
        draftId: feedbackEntry.draftId,
      }),
      healthScore: feedbackEntry.score ?? null,
    });

    await createGraphEdge({
      sourceNodeId: leadNode.id,
      targetNodeId: feedbackNode.id,
      relationType: "FEEDBACK",
      rationale: `Operator feedback for this lead is already shaping agent memory, attribution quality, or draft direction.`,
      strength: feedbackEntry.score ?? (feedbackEntry.sentiment === "POSITIVE" ? 78 : feedbackEntry.sentiment === "NEGATIVE" ? 44 : 58),
      confidence: 85,
      metadata: serializeMetadata({
        highlights: [feedbackEntry.feedbackType, feedbackEntry.sentiment, feedbackEntry.agent?.name].filter(Boolean),
      }),
    });
  }

  const candidateFilters: Prisma.LeadWhereInput[] = [];

  if (lead.institution) {
    candidateFilters.push({ institution: lead.institution });
  }

  if (lead.assignedAgentId) {
    candidateFilters.push({ assignedAgentId: lead.assignedAgentId });
  }

  if (lead.sourceName) {
    candidateFilters.push({ sourceName: lead.sourceName });
  }

  if (lead.eventName) {
    candidateFilters.push({ eventName: lead.eventName });
  }

  if (lead.tier !== "UNRANKED") {
    candidateFilters.push({ tier: lead.tier });
  }

  const relatedLeadCandidates = candidateFilters.length > 0
    ? await prisma.lead.findMany({
        where: {
          id: { not: lead.id },
          OR: candidateFilters,
        },
        select: {
          id: true,
          fullName: true,
          institution: true,
          role: true,
          researchArea: true,
          sourceName: true,
          eventName: true,
          assignedAgentId: true,
          fitScore: true,
          priorityScore: true,
          status: true,
        },
        orderBy: [{ priorityScore: "desc" }, { fitScore: "desc" }, { updatedAt: "desc" }],
        take: 24,
      })
    : [];

  const scoredCandidates = relatedLeadCandidates
    .map((candidate) => ({
      candidate,
      match: scoreRelatedLead(lead, candidate),
    }))
    .filter((entry): entry is { candidate: (typeof relatedLeadCandidates)[number]; match: NonNullable<ReturnType<typeof scoreRelatedLead>> } => Boolean(entry.match))
    .sort((left, right) => right.match.strength - left.match.strength)
    .slice(0, 5);

  for (const entry of scoredCandidates) {
    const candidateNode = await upsertGraphNode({
      entityType: "LEAD",
      entityId: entry.candidate.id,
      label: entry.candidate.fullName,
      summary: buildLeadSummary(entry.candidate),
      semanticText: [entry.candidate.fullName, entry.candidate.researchArea, entry.candidate.institution, entry.candidate.role].filter(Boolean).join(". "),
      keywordFingerprint: buildFingerprint(entry.candidate.researchArea, entry.candidate.institution, entry.candidate.role),
      metadata: serializeMetadata({
        status: entry.candidate.status,
        institution: entry.candidate.institution,
      }),
      healthScore: entry.candidate.priorityScore || entry.candidate.fitScore || null,
    });

    await createGraphEdge({
      sourceNodeId: leadNode.id,
      targetNodeId: candidateNode.id,
      relationType: "RELATED_LEAD",
      rationale: entry.match.reasons.join(". "),
      strength: entry.match.strength,
      confidence: entry.match.confidence,
      semanticScore: entry.match.overlap.length > 0 ? clampScore(48 + entry.match.overlap.length * 12) : null,
      metadata: serializeMetadata({
        highlights: entry.match.reasons,
      }),
    });
  }

  return leadNode.id;
}

export async function getLeadRelationGraph(leadId: string): Promise<LeadRelationGraph | null> {
  const leadNodeId = await syncLeadRelationGraph(leadId);

  if (!leadNodeId) {
    return null;
  }

  const edges = await prisma.relationGraphEdge.findMany({
    where: {
      sourceNodeId: leadNodeId,
      relationType: {
        in: [...MANAGED_RELATION_TYPES],
      },
    },
    include: {
      targetNode: true,
    },
    orderBy: [{ strength: "desc" }, { updatedAt: "desc" }],
    take: 18,
  });

  const items = edges.map((edge) => ({
    edgeId: edge.id,
    relationType: edge.relationType,
    rationale: edge.rationale,
    strength: edge.strength,
    confidence: edge.confidence,
    semanticScore: edge.semanticScore,
    highlights: parseHighlights(edge.metadata),
    target: {
      entityType: edge.targetNode.entityType,
      entityId: edge.targetNode.entityId,
      label: edge.targetNode.label,
      summary: edge.targetNode.summary,
      healthScore: edge.targetNode.healthScore,
    },
  }));

  const countsByEntityType = items.reduce<Record<string, number>>((counts, item) => {
    counts[item.target.entityType] = (counts[item.target.entityType] ?? 0) + 1;
    return counts;
  }, {});

  return {
    totalRelations: items.length,
    countsByEntityType,
    items,
  };
}