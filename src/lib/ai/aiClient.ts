import { generateObject, generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { z } from "zod";

function getProvider() {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
    return { provider: google("gemini-2.5-pro"), name: "Gemini 2.5 Pro" };
  } else if (process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return { provider: openai("gpt-4o"), name: "GPT-4o" };
  } else {
    throw new Error("No LLM API Key found. Please set GOOGLE_GENERATIVE_AI_API_KEY or OPENAI_API_KEY in .env");
  }
}

const leadSchema = z.object({
  firstName: z.string().describe("The researcher's first name"),
  lastName: z.string().describe("The researcher's last name"),
  role: z.string().describe("Their academic or professional title e.g. Principal Investigator, Postdoc"),
  institution: z.string().describe("Name of the university, lab, or company"),
  email: z.string().describe("Email address if found in the text, otherwise an empty string"),
  researchArea: z.string().describe("A short 3-5 word summary of what they research"),
  whyRelevant: z.string().describe("Why this person is a good lead for a high-end 3D whole-organ imaging / spatial biology platform. 1-2 sentences."),
  fitScore: z.number().min(1).max(100).describe("Score from 1-100 indicating relevance to spatial biology, whole-organ imaging, and preclinical mouse models."),
  tier: z.enum(["TIER1", "TIER2", "TIER3", "UNRANKED"]).describe("TIER1 = PI with high fit. TIER2 = Postdoc/Scientist with high fit. TIER3 = unknown/low fit.")
});

export async function extractLeadFromText(rawText: string) {
  const { provider, name } = getProvider();

  const { object } = await generateObject({
    model: provider,
    schema: leadSchema,
    system: "You are an expert sales intelligence agent. Read the following academic text excerpt. Extract the lead scientist or principal investigator's information. Be highly accurate. You are representing a high-end 3D whole-organ imaging and spatial biology platform.",
    prompt: `EXTRACT THIS TEXT:\n\n${rawText.slice(0, 15000)}` 
  });

  return { lead: object, modelName: name };
}

export async function generateOutreachEmail(leadContext: any) {
  const { provider, name } = getProvider();

  const { text } = await generateText({
    model: provider,
    system: "You are an autonomous agent writing a cold outreach email. Our platform automates 3D whole-organ imaging and spatial mapping, bypassing tedious histology slice-and-dice. Write a highly personalized, concise email to this researcher. Mention their exact research area. Sound like a helpful peer. No subject line included here, just the email body.",
    prompt: `Lead Context:\nName: ${leadContext.firstName} ${leadContext.lastName}\nRole: ${leadContext.role}\nResearch: ${leadContext.researchArea}\nWhy Relevant: ${leadContext.whyRelevant}\n\nDraft the email:`
  });

  return { email: text.trim(), modelName: name };
}
