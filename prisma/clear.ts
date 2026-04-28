import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Clearing all user and pipeline data...')
  
  await prisma.activityLog.deleteMany({})
  await prisma.outreachDraft.deleteMany({})
  await prisma.leadScoreBreakdown.deleteMany({})
  await prisma.leadTag.deleteMany({})
  await prisma.scrapedRecord.deleteMany({})
  await prisma.lead.deleteMany({})
  await prisma.pipelineRunStep.deleteMany({})
  await prisma.pipelineRun.deleteMany({})
  
  // Notice we intentionally keep AppSetting and User intact 
  // so your login and scoring weights still exist.

  console.log('Data cleared successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
