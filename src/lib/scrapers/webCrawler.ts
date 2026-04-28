import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

/**
 * Fetches a URL, strips boilerplate, and returns the core readable text.
 */
export async function scrapeWebPage(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
      }
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const html = await res.text();
    const doc = new JSDOM(html, { url });
    const reader = new Readability(doc.window.document);
    const article = reader.parse();

    if (!article || !article.textContent) {
      return ""; // Fallback if Readability fails
    }

    return article.textContent.trim();
  } catch (err) {
    console.error(`Failed to scrape ${url}:`, err);
    return "";
  }
}
