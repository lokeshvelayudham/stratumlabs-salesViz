"use server";

import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { searchPubMed } from "../scrapers/pubmed";

function getProvider() {
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    const google = createGoogleGenerativeAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
    return google("gemini-2.5-pro");
  } else if (process.env.OPENAI_API_KEY) {
    const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY });
    return openai("gpt-4o");
  } else {
    throw new Error("No LLM API Key found. Please set GOOGLE_GENERATIVE_AI_API_KEY or OPENAI_API_KEY in .env");
  }
}

export async function discoverUrlsWithAi(prompt: string): Promise<{ success: boolean; urls?: string[]; error?: string }> {
  try {
    const provider = getProvider();

    // 1. Generate optimal search terms based on user input
    const { text: queriesText } = await generateText({
      model: provider,
      system: "You are an expert at constructing PubMed search queries. The user will describe a product or target audience. You must convert their description into 3 different PubMed search queries, ordered from most specific to most broad. This ensures if the specific query fails, we have fallbacks. Separate each query with a newline character. Return ONLY the 3 queries, one per line, with no bullet points, no quotes around them, and no explanation.",
      prompt: `Product/Target Description: ${prompt} \n\nGenerate the 3 search queries:`
    });

    // Split by newline and clean up
    const queries = queriesText.split('\n')
      .map(q => q.replace(/['"]/g, '').replace(/^\d+\.\s*/, '').trim())
      .filter(q => q.length > 0)
      .slice(0, 3); // Take at most 3

    let pubmedResults: any[] = [];
    let successfulQuery = "";

    // 2. Try each query until we get results
    for (const query of queries) {
      pubmedResults = await searchPubMed(query, 20);
      if (pubmedResults.length > 0) {
        successfulQuery = query;
        break;
      }
    }

    if (pubmedResults.length === 0) {
      return { success: false, error: `Found no literature matching any of the AI-generated queries. Tried:\n${queries.join('\n')}` };
    }

    const discoveredUrls = pubmedResults.map(p => p.sourceUrl);

    return { success: true, urls: discoveredUrls };
  } catch (error: any) {
    console.error("AI URL Discovery failed:", error);
    return { success: false, error: error.message };
  }
}
