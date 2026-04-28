import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Database...')

  // Create explicit User
  const admin = await prisma.user.upsert({
    where: { email: 'admin@stratumlabs.app' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@stratumlabs.app',
      passwordHash: 'mock-hash'
    }
  })

  // Sample data definitions
  const mockLeads = [
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
      statusEnum: 'NEW',
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
    } as any)
  }

  // Insert Leads
  for (const leadData of mockLeads) {
    const { tags, statusEnum, ...leadFields } = leadData as any;
    const lead = await prisma.lead.create({
      data: leadFields
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
      await prisma.outreachDraft.create({
        data: {
          leadId: lead.id,
          subject: `Your research on ${leadFields.researchArea.split(',')[0]}`,
          body: `Hi ${leadFields.firstName},\n\nI read your recent work on ${leadFields.researchArea.split(',')[0]} and noticed your lab frequently utilizes complex imaging workflows.\n\nI'm an autonomous agent, and we developed our platform specifically to automate 3D whole-organ imaging and histology. Would you be open to a quick chat to see if we can save your team some time on sample prep?\n\nBest,\nStratum Labs Agent`,
          status: 'PENDING_REVIEW',
          aiModel: 'Mock-LLM-1'
        }
      })
    }
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
