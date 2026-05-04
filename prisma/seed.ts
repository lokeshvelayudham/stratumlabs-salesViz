import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { computeLeadIntelligence } from '../src/lib/lead-intelligence'

const prisma = new PrismaClient()

type MockLead = {
  firstName: string
  lastName: string
  fullName: string
  email: string
  institution: string
  role: string
  department?: string
  labName?: string
  sourceType: 'AUTO' | 'MANUAL'
  sourceName?: string
  sourceUrl?: string
  eventName?: string
  status: 'NEW' | 'REVIEW' | 'INTERESTED' | 'CONTACTED' | 'APPROVED'
  tier: 'TIER1' | 'TIER2' | 'TIER3' | 'UNRANKED'
  fitScore: number
  researchArea?: string
  notes?: string | null
  whyRelevant?: string
  aiSummary?: string
  tags: string[]
}

async function main() {
  console.log('Seeding Database...')

  const adminPasswordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'ChangeMe123!', 10)

  // Create explicit User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@stratumlabs.app' },
    update: {
      role: 'SUPER_ADMIN',
      planName: 'Sovereign',
      monthlySpend: 6900,
      activeSwarms: 30,
      processAccess: true,
      organizationRole: 'OWNER',
      passwordHash: adminPasswordHash,
    },
    create: {
      name: 'Admin User',
      email: 'admin@stratumlabs.app',
      passwordHash: adminPasswordHash,
      role: 'SUPER_ADMIN',
      planName: 'Sovereign',
      monthlySpend: 6900,
      activeSwarms: 30,
      processAccess: true,
      organizationRole: 'OWNER',
    }
  })

  const adminOrg = await prisma.organization.upsert({
    where: { slug: 'stratum-admin-workspace' },
    update: {
      name: 'Stratum Admin Workspace',
      mission: 'Oversee customers, usage, and revenue operations across every organization.',
      vision: 'Run the swarm with maximum clarity and zero hidden telemetry.',
      brandColor: '#5663e8',
      createdById: admin.id,
    },
    create: {
      name: 'Stratum Admin Workspace',
      slug: 'stratum-admin-workspace',
      mission: 'Oversee customers, usage, and revenue operations across every organization.',
      vision: 'Run the swarm with maximum clarity and zero hidden telemetry.',
      brandColor: '#5663e8',
      createdById: admin.id,
    },
  })

  await prisma.user.update({
    where: { id: admin.id },
    data: {
      organizationId: adminOrg.id,
    },
  })

  const hunterAgent = await prisma.swarmAgent.create({
    data: {
      name: 'Atlas Hunter',
      goal: 'Discover and prioritize spatial biology accounts with active buying signals.',
      strategy: 'Signal ingestion + outbound qualification',
      budget: 2500,
      spend: 950,
      revenue: 5400,
      state: 'HUNT',
      ownerId: admin.id,
      organizationId: adminOrg.id,
      memorySummary: 'Funding announcements and job changes correlate strongly with positive reply rates.',
      lastImprovementNote: 'Prioritize leads with fresh funding signals.',
    },
  })

  const closerAgent = await prisma.swarmAgent.create({
    data: {
      name: 'Reply Closer',
      goal: 'Handle objections, move replies to demos, and attribute closed revenue.',
      strategy: 'Inbox triage + objection handling + attribution tracking',
      budget: 1800,
      spend: 620,
      revenue: 12800,
      state: 'CLOSE',
      ownerId: admin.id,
      organizationId: adminOrg.id,
      memorySummary: 'Interested replies convert faster when technical objections are acknowledged first.',
      lastImprovementNote: 'Use proof-driven replies for pharma buyers.',
    },
  })

  const analystAgent = await prisma.swarmAgent.create({
    data: {
      name: 'Signal Analyst',
      goal: 'Continuously refresh lead priority based on ICP and intent signals.',
      strategy: 'Lead scoring + ICP matching + queue ranking',
      budget: 1200,
      spend: 410,
      revenue: 0,
      state: 'DEPLOY',
      ownerId: admin.id,
      organizationId: adminOrg.id,
      memorySummary: 'ICP-matching signals make the lead queue materially more efficient before outreach begins.',
      lastImprovementNote: 'Keep timing and intent signals distinct for better queue ranking.',
    },
  })

  await prisma.agentMemoryEntry.createMany({
    data: [
      {
        agentId: hunterAgent.id,
        memoryType: 'SUCCESS',
        title: 'Funding signal wins',
        content: 'New funding and team expansion are strong intent signals for outbound qualification.',
        impactScore: 82,
      },
      {
        agentId: closerAgent.id,
        memoryType: 'OBJECTION',
        title: 'Technical objection pattern',
        content: 'Pharma replies improve when compliance and validation are addressed in the first response.',
        impactScore: 74,
      },
      {
        agentId: analystAgent.id,
        memoryType: 'PLAYBOOK',
        title: 'Priority queue baseline',
        content: 'Blend fit, intent, and ICP rather than ranking only on fit score.',
        impactScore: 77,
      },
    ],
  })

  // Sample data definitions
  const mockLeads: MockLead[] = [
    {
      firstName: 'Sarah',
      lastName: 'Chen',
      fullName: 'Sarah Chen',
      email: 'schen@stanford.edu',
      institution: 'Stanford University',
      role: 'Principal Investigator',
      department: 'Department of Pathology',
      labName: 'Chen Lab for Spatial Biology',
      sourceType: 'AUTO',
      sourceName: 'PubMed',
      sourceUrl: 'https://pubmed.ncbi.nlm.nih.gov/example1/',
      status: 'REVIEW',
      tier: 'TIER1',
      fitScore: 92,
      researchArea: 'Spatial Biology, Tumor Microenvironment',
      notes: 'High fit due to recent R01 grant focusing on whole-organ imaging.',
      whyRelevant: 'The Chen Lab heavily utilizes whole-organ imaging techniques and has published 3 papers last year on spatial mapping of tumor microenvironments in mice. Our platform would accelerate their tissue sectioning and 3D reconstruction.',
      aiSummary: 'Sarah Chen is a leading PI in spatial biology. Her recent work focuses on mapping the tumor microenvironment in preclinical mouse models. She frequently uses confocal microscopy but notes bottlenecks in sample preparation.',
      tags: ['PI', 'Spatial Biology', 'Mouse Models', 'High-Fit']
    },
    {
      firstName: 'David',
      lastName: 'Miller',
      fullName: 'David Miller',
      email: 'dmiller@mit.edu',
      institution: 'MIT',
      role: 'Postdoctoral Fellow',
      department: 'Biological Engineering',
      labName: 'Gheorghe Lab',
      sourceType: 'AUTO',
      sourceName: 'bioRxiv',
      sourceUrl: 'https://biorxiv.org/example2',
      status: 'NEW',
      tier: 'TIER2',
      fitScore: 78,
      researchArea: 'Fluorescence Imaging',
      whyRelevant: 'Working on novel fluorescence probes for in vivo imaging. Could potentially use our platform for validation.',
      tags: ['Postdoc', 'Fluorescence']
    },
    {
      firstName: 'Elena',
      lastName: 'Rostova',
      fullName: 'Elena Rostova',
      email: 'erostova@pfizer.com',
      institution: 'Pfizer',
      role: 'Senior Scientist',
      department: 'Preclinical Imaging',
      sourceType: 'MANUAL',
      eventName: 'WMIC 2025',
      status: 'INTERESTED',
      tier: 'TIER1',
      fitScore: 95,
      researchArea: 'Biodistribution, Pharma R&D',
      notes: 'Met at WMIC. Very interested in automating their whole body biodistribution assays.',
      whyRelevant: 'Pfizer preclinical imaging group running high throughput biodistribution studies. Our platform provides the exact automation they requested at the conference.',
      tags: ['Pharma', 'Biodistribution', 'Industry']
    },
    {
      firstName: 'James',
      lastName: 'Wilson',
      fullName: 'James Wilson',
      email: 'jwilson@jhmi.edu',
      institution: 'Johns Hopkins University',
      role: 'Imaging Core Director',
      department: 'Core Facilities',
      sourceType: 'AUTO',
      sourceName: 'University Department Page',
      status: 'CONTACTED',
      tier: 'TIER2',
      fitScore: 85,
      researchArea: 'Histology, Core Facility',
      tags: ['Core Director', 'Histology']
    }
  ]

  // Add more leads up to 12 as requested
  for (let i = 0; i < 8; i++) {
    mockLeads.push({
      firstName: `Sample${i}`,
      lastName: `User${i}`,
      fullName: `Sample User${i}`,
      email: `sample${i}@example.edu`,
      institution: 'Example University',
      role: 'Researcher',
      department: 'Anatomy',
      sourceType: 'AUTO',
      sourceName: 'Conference Program',
      status: i % 2 === 0 ? 'NEW' : 'APPROVED',
      tier: i % 3 === 0 ? 'TIER1' : 'TIER3',
      fitScore: 60 + i * 4,
      researchArea: 'Transgenic Mouse Research',
      notes: null,
      whyRelevant: 'Placeholder relevant text for transgenic mouse imaging.',
      tags: []
    })
  }

  const createdLeads: Array<{ id: string; fullName: string; fitScore: number | null; tier: string; status: string }> = []
  const leadDraftIds = new Map<string, string>()

  // Insert Leads
  for (const leadData of mockLeads) {
    const { tags, ...leadFields } = leadData;
    const lead = await prisma.lead.create({
      data: leadFields
    })

    createdLeads.push({
      id: lead.id,
      fullName: lead.fullName,
      fitScore: lead.fitScore,
      tier: lead.tier,
      status: lead.status,
    })

    if (tags && tags.length > 0) {
      await Promise.all(
        tags.map((tag: string) => 
          prisma.leadTag.create({
            data: { leadId: lead.id, value: tag }
          })
        )
      )
    }

    // Include a draft for TIER1
    if (leadFields.tier === 'TIER1') {
      const researchTopic = leadFields.researchArea?.split(',')[0] ?? 'your current research priorities'

      const draft = await prisma.outreachDraft.create({
        data: {
          leadId: lead.id,
          subject: `Your research on ${researchTopic}`,
          body: `Hi ${leadFields.firstName},\n\nI read your recent work on ${researchTopic} and noticed your lab frequently utilizes complex imaging workflows.\n\nI'm an autonomous agent, and we developed our platform specifically to automate 3D whole-organ imaging and histology. Would you be open to a quick chat to see if we can save your team some time on sample prep?\n\nBest,\nStratum Labs Agent`,
          status: 'PENDING_REVIEW',
          aiModel: 'Mock-LLM-1'
        }
      })
      leadDraftIds.set(lead.id, draft.id)
    }
  }

  const seededSignals = [
    {
      leadIndex: 0,
      agentId: hunterAgent.id,
      signals: [
        { signalType: 'ICP', label: 'High-fit spatial biology ICP', source: 'Research profile', score: 22 },
        { signalType: 'INTENT', label: 'Recent grant expansion', source: 'Funding signal', score: 18 },
      ],
    },
    {
      leadIndex: 1,
      agentId: analystAgent.id,
      signals: [
        { signalType: 'FIT', label: 'Emerging fluorescence workflow', source: 'Paper abstract', score: 14 },
        { signalType: 'TIMING', label: 'Active instrumentation upgrade cycle', source: 'Department update', score: 9 },
      ],
    },
    {
      leadIndex: 2,
      agentId: closerAgent.id,
      signals: [
        { signalType: 'REPLY', label: 'Requested follow-up on WMIC conversation', source: 'Conference note', score: 26 },
        { signalType: 'ICP', label: 'Pharma preclinical imaging fit', source: 'Manual research', score: 20 },
      ],
    },
    {
      leadIndex: 3,
      agentId: hunterAgent.id,
      signals: [
        { signalType: 'INTENT', label: 'Core facility modernization initiative', source: 'Department page', score: 15 },
      ],
    },
  ]

  for (const seededLead of seededSignals) {
    const targetLead = createdLeads[seededLead.leadIndex]
    if (!targetLead) continue

    await prisma.lead.update({
      where: { id: targetLead.id },
      data: {
        assignedAgentId: seededLead.agentId,
      },
    })

    await prisma.leadSignal.createMany({
      data: seededLead.signals.map((signal) => ({
        leadId: targetLead.id,
        signalType: signal.signalType,
        label: signal.label,
        source: signal.source,
        score: signal.score,
        metadata: JSON.stringify({ source: signal.source }),
      })),
    })

    const scores = computeLeadIntelligence(targetLead.fitScore, seededLead.signals)

    await prisma.lead.update({
      where: { id: targetLead.id },
      data: {
        intentScore: scores.intentScore,
        icpScore: scores.icpScore,
        priorityScore: scores.priorityScore,
        scoreUpdatedAt: new Date(),
      },
    })
  }

  const interestedLead = createdLeads[2]
  const reviewLead = createdLeads[0]

  if (interestedLead) {
    const interestedThread = await prisma.inboxThread.create({
      data: {
        leadId: interestedLead.id,
        agentId: closerAgent.id,
        subject: 'Follow-up on automation for biodistribution studies',
        status: 'RESPONDED',
        classification: 'INTERESTED',
        summary: 'The Pfizer team wants pricing details and validation steps before a demo.',
      },
    })

    await prisma.inboxMessage.createMany({
      data: [
        {
          threadId: interestedThread.id,
          direction: 'OUTBOUND',
          senderName: 'Reply Closer',
          senderEmail: 'agents@stratumlabs.app',
          body: 'Thanks again for the conversation at WMIC. Happy to walk through how Stratum automates biodistribution workflows.',
          status: 'SENT',
        },
        {
          threadId: interestedThread.id,
          direction: 'INBOUND',
          senderName: 'Elena Rostova',
          senderEmail: 'erostova@pfizer.com',
          body: 'This looks promising. Can you send pricing and validation details before we schedule?',
          aiSuggestedReply: 'Absolutely. I can send operator and sovereign pricing tiers along with validation examples for preclinical imaging teams.',
          status: 'RECEIVED',
        },
      ],
    })

    await prisma.revenueAttribution.create({
      data: {
        leadId: interestedLead.id,
        agentId: closerAgent.id,
        amount: 12800,
        campaignName: 'WMIC 2025 follow-up',
        strategyLabel: 'Proof-first reply handling',
        note: 'Closed after conference follow-up and inbox objection handling.',
      },
    })
  }

  if (reviewLead) {
    const reviewThread = await prisma.inboxThread.create({
      data: {
        leadId: reviewLead.id,
        agentId: hunterAgent.id,
        subject: 'Whole-organ imaging workflow discussion',
        status: 'NEEDS_REVIEW',
        classification: 'OBJECTION',
        summary: 'Lead asked whether compliance and tissue validation are already documented.',
      },
    })

    await prisma.inboxMessage.createMany({
      data: [
        {
          threadId: reviewThread.id,
          direction: 'OUTBOUND',
          senderName: 'Atlas Hunter',
          senderEmail: 'agents@stratumlabs.app',
          body: 'We noticed your recent tumor microenvironment work and thought our automation stack could accelerate sample prep.',
          status: 'SENT',
        },
        {
          threadId: reviewThread.id,
          direction: 'INBOUND',
          senderName: 'Sarah Chen',
          senderEmail: 'schen@stanford.edu',
          body: 'Interesting. Before we move further, do you have validation and compliance material for our core lab? ',
          aiSuggestedReply: 'Yes. We can share validation packets, compliance workflows, and examples from similar spatial biology programs.',
          status: 'RECEIVED',
        },
      ],
    })

    await prisma.revenueAttribution.create({
      data: {
        leadId: reviewLead.id,
        agentId: hunterAgent.id,
        amount: 5400,
        campaignName: 'Spatial biology qualification sprint',
        strategyLabel: 'Funding-triggered outbound',
        note: 'Revenue attributed to outbound triggered by funding and ICP signals.',
      },
    })
  }

  const feedbackEntries = [] as Array<{
    leadId?: string
    agentId?: string
    draftId?: string
    createdById: string
    feedbackType: string
    sentiment: string
    score?: number
    note: string
  }>

  if (interestedLead) {
    feedbackEntries.push({
      leadId: interestedLead.id,
      agentId: closerAgent.id,
      draftId: leadDraftIds.get(interestedLead.id),
      createdById: admin.id,
      feedbackType: 'APPROVED',
      sentiment: 'POSITIVE',
      score: 88,
      note: 'The pricing-first follow-up worked well. Keep using concrete proof points before asking for the demo.',
    })
  }

  if (reviewLead) {
    feedbackEntries.push({
      leadId: reviewLead.id,
      agentId: hunterAgent.id,
      draftId: leadDraftIds.get(reviewLead.id),
      createdById: admin.id,
      feedbackType: 'TRAINING',
      sentiment: 'NEUTRAL',
      score: 61,
      note: 'Good qualification, but future replies should address compliance objections earlier in the thread.',
    })
  }

  if (feedbackEntries.length > 0) {
    await prisma.feedbackEntry.createMany({ data: feedbackEntries })
  }

  // Sample App Settings
  await prisma.appSetting.upsert({
    where: { key: 'scoring_weights' },
    update: {},
    create: {
      key: 'scoring_weights',
      value: JSON.stringify({
        'preclinical mouse model': 20,
        'whole-organ': 25,
        'spatial biology': 15
      })
    }
  })

  console.log('Seed completed.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
