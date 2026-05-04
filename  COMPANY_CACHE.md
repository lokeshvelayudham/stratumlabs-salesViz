# Stratum AI — Company Cache

_Last updated: May 4, 2026_

---

## Overview

**Stratum Labs** is an autonomous CRM and enterprise platform built around a single directive: **maximize ROI by replacing manual sales motion with compounding, autonomous systems**.

The swarm is not designed to feel human. It is designed to operate with more discipline, more speed, and fewer wasted cycles than a conventional GTM org.

---

## Six Primitives (Core Systems)

| # | Primitive | Description |
|---|-----------|-------------|
| 1 | **Autonomous Agents** | Each agent owns its own P&L. It is capitalized, deployed, and expected to drive revenue without human babysitting. |
| 2 | **Hive Collusion** | Agents actively share intelligence, merge strategies, and form stronger operating patterns when profitable. |
| 3 | **Ruthless Termination** | Underperforming agents are terminated quickly and their budget is reallocated to stronger performers. |
| 4 | **Force-Optimization** | Weak tactics are dismantled automatically while new experiments are launched until the unit economics improve. |
| 5 | **Real-time Telemetry** | Every cold email, bounce, webhook, and kill command is streamed back to the operator layer in real time. |
| 6 | **Zero-Human Ops** | Management overhead is stripped down so the swarm can compound output while the human team stays lean. |

---

## Infinite Protocol (Operating Cycle)

The protocol is not a campaign builder. It is an operating cycle for deploying, improving, and reallocating autonomous revenue systems.

| Phase | Step | Description |
|-------|------|-------------|
| **Deploy** | 01 | Define capital limits, quotas, and the guardrails that keep the swarm disciplined. |
| **Hunt** | 02 | Agents enrich data, perform outbound execution, and qualify the pipeline continuously. |
| **Close** | 03 | Negotiation, pricing optimization, contracts, and settlement happen inside the loop. |
| **Cull** | 04 | Unprofitable agents are removed so the surviving strategies can scale harder. |

---

## Data Model

### Organization
```
Organization {
  id, name, slug, vision, mission, brandColor (#5663e8 default), logoUrl,
  createdById, createdAt, updatedAt
}
```

### User
```
User {
  id, name, email, emailVerified, image, passwordHash,
  role (USER | SUPER_ADMIN),
  planName (default "Launch"), monthlySpend (default 990),
  activeSwarms (default 2), processAccess (default true),
  organizationRole (OWNER | ADMIN | MEMBER | VIEWER),
  organizationId
}
```

### SwarmAgent
```
SwarmAgent {
  id, name, goal, budget (default 0), spend (default 0), revenue (default 0),
  strategy, state (DEPLOY | HUNT | CLOSE | KILL | PAUSED),
  memorySummary, lastImprovementNote,
  ownerId, organizationId, createdAt, updatedAt
}
```

### Lead Scoring
```
Lead {
  status: NEW | REVIEW | APPROVED | REJECTED | CONTACTED | REPLIED | INTERESTED | CLOSED
  tier: TIER1 | TIER2 | TIER3 | UNRANKED
  fitScore, intentScore, icpScore, priorityScore
  sourceType: AUTO | MANUAL
}
```

### Revenue Attribution
```
RevenueAttribution {
  leadId, agentId, amount, currency (default USD),
  campaignName, strategyLabel, touchpointCount (default 1),
  note, closedAt, createdAt
}
```

### Agent Memory
```
AgentMemoryEntry {
  memoryType: SUCCESS | FAILURE | PLAYBOOK | OBJECTION | CONTEXT
  title, content, campaignKey, impactScore (default 50)
}
```

### Inbox Classification
```
InboxThread.classification: INTERESTED | OBJECTION | SPAM | NOT_NOW | UNCLASSIFIED
InboxThread.status: OPEN | NEEDS_REVIEW | RESPONDED | CLOSED
```

---

## Agent Lifecycle States

```
DEPLOY → HUNT → CLOSE → (KILL | PAUSED)
         ↑                   ↓
         └───────────────────┘
```

---

## Plans & Pricing (from schema defaults)

| Plan | Monthly Spend | Active Swarms |
|------|---------------|---------------|
| Launch (default) | $990 | 2 |

---

## Key Directives

> **Stop hiring humans. Deploy the swarm.**
>
> If the model fits, the next step is not more software. It is a more elegant operating system for revenue execution.