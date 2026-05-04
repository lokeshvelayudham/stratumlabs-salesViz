"use server";

import { prisma } from "@/lib/db";
import { syncLeadIntelligence } from "@/lib/lead-intelligence-server";
import { revalidatePath } from "next/cache";
import { scrapeWithPlaywright } from "../scrapers/playwrightScraper";
import { extractLeadFromText, generateOutreachEmail } from "../ai/aiClient";

export async function runDiscoveryPipeline(customUrls?: string[], heading?: string) {
  const run = await prisma.pipelineRun.create({
    data: {
      type: "PLAYWRIGHT_DISCOVERY",
      status: "RUNNING",
    }
  });

  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.OPENAI_API_KEY) {
      throw new Error("No LLM key configured. Set GOOGLE_GENERATIVE_AI_API_KEY or OPENAI_API_KEY.");
    }

    // ---------------------------------------------------------
    // STAGE 1: WEB SCRAPING VIA PLAYWRIGHT
    // ---------------------------------------------------------
    await prisma.pipelineRunStep.create({
      data: { pipelineRunId: run.id, stepName: "SCRAPING_PLAYWRIGHT", status: "RUNNING" }
    });

    if (!customUrls || customUrls.length === 0) {
      throw new Error("No URLs provided. Please paste at least one URL to scrape.");
    }

    const playwrightResults = await scrapeWithPlaywright(customUrls);

    // Save ALL raw DOM dumps unconditionally to the ScrapedRecord table first (Queueing them)
    for (const article of playwrightResults) {
      await prisma.scrapedRecord.create({
        data: {
          pipelineRunId: run.id,
          sourceName: "Playwright Crawler",
          sourceUrl: article.sourceUrl,
          title: article.title,
          abstractText: article.abstractText,
          processingStatus: "PENDING"
        }
      });
    }

    await prisma.pipelineRunStep.updateMany({
      where: { pipelineRunId: run.id, stepName: "SCRAPING_PLAYWRIGHT" },
      data: { status: "COMPLETED" }
    });

    // ---------------------------------------------------------
    // STAGE 2: AI GRADING & FILTERING WORKER
    // ---------------------------------------------------------
    await prisma.pipelineRunStep.create({
      data: { pipelineRunId: run.id, stepName: "AI_BACKGROUND_GRADER", status: "RUNNING" }
    });

    // Fetch the pending queue
    const pendingRecords = await prisma.scrapedRecord.findMany({
      where: { processingStatus: "PENDING" }
    });

    let createdCount = 0;
    let deletedCount = 0;

    for (const record of pendingRecords) {
      try {
        const { lead, modelName } = await extractLeadFromText(record.abstractText!);
        
        // 🚨 CRITICAL FILTERING LOGIC 🚨
        if (lead.fitScore < 60) {
          // If the AI scores this paper below our threshold, delete it natively!
          console.log(`[AI GRADER] Deleting irrelevant paper: ${record.title} (Score: ${lead.fitScore})`);
          await prisma.scrapedRecord.delete({ where: { id: record.id } });
          deletedCount++;
          continue; // Skip CRM insertion completely
        }
        
        // If the AI likes it, we promote it to the CRM Lead!
        const l = await prisma.lead.create({
          data: {
            firstName: lead.firstName,
            lastName: lead.lastName,
            fullName: `${lead.firstName} ${lead.lastName}`,
            institution: lead.institution,
            role: lead.role,
            email: lead.email,
            researchArea: lead.researchArea,
            sourceName: "Playwright + AI Grader",
            sourceType: "AUTO",
            sourceUrl: record.sourceUrl,
            eventName: heading || null,
            tier: lead.tier,
            status: "NEW",
            fitScore: lead.fitScore,
            whyRelevant: lead.whyRelevant,
            aiSummary: `Extracted automatically. Research involves: ${lead.researchArea}. Relevance string: ${lead.whyRelevant}`,
            rawSourceText: record.abstractText
          }
        });
        createdCount++;

        await syncLeadIntelligence(l.id);
        
        await prisma.activityLog.create({
          data: {
            leadId: l.id,
            type: "LEAD_EXTRACTED",
            message: `Lead scored ${lead.fitScore}/100 and passed filter. Extracted with ${modelName}.`
          }
        });

        // Generate auto-outreach for High Fits
        if (lead.tier === "TIER1" || lead.tier === "TIER2") {
          const emailContent = await generateOutreachEmail(lead);
          await prisma.outreachDraft.create({
            data: {
              leadId: l.id,
              subject: `Discussing your research on ${lead.researchArea.split(',')[0]}`,
              body: emailContent.email,
              aiModel: emailContent.modelName,
            }
          });
        }

        // Mark the raw record as processed 
        await prisma.scrapedRecord.update({
          where: { id: record.id },
          data: { processingStatus: "PROCESSED" }
        });

      } catch (extractErr) {
        console.error(`AI Extraction failed for record ${record.id}`, extractErr);
        await prisma.scrapedRecord.update({
          where: { id: record.id },
          data: { processingStatus: "REJECTED" } // Fallback for crashed LLM runs
        });
      }
    }

    await prisma.pipelineRunStep.updateMany({
      where: { pipelineRunId: run.id, stepName: "AI_BACKGROUND_GRADER" },
      data: { status: "COMPLETED" }
    });

    // Finish
    await prisma.pipelineRun.update({
      where: { id: run.id },
      data: {
        status: "COMPLETED",
        finishedAt: new Date(),
        metadata: JSON.stringify({ 
          sourceCount: customUrls.length, 
          newLeadsCount: createdCount,
          deletedNoiseCount: deletedCount
        })
      }
    });

    revalidatePath("/pipeline");
    revalidatePath("/leads");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown pipeline error";

    await prisma.pipelineRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorText: errorMessage
      }
    });
    return { success: false, error: errorMessage };
  }
}
