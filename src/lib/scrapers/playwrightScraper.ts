import { chromium } from "playwright";

export interface PlaywrightScrapeResult {
  sourceUrl: string;
  title: string;
  abstractText: string;
}

export async function scrapeWithPlaywright(urls: string[]): Promise<PlaywrightScrapeResult[]> {
  // Launch Playwright headlessly
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  });
  
  const results: PlaywrightScrapeResult[] = [];
  
  for (const url of urls) {
    try {
      const page = await context.newPage();
      // Wait for network idle to ensure dynamic JS frameworks load the content
      await page.goto(url, { waitUntil: 'load', timeout: 30000 });
      
      // Wait for body to be attached properly
      await page.waitForSelector('body');

      // Use Playwright's extremely powerful innerText which calculates visual visibility
      const textContent = await page.evaluate(() => document.body.innerText);
      const title = await page.title();
      
      results.push({
        sourceUrl: url,
        title,
        abstractText: textContent.slice(0, 20000), // Cap to prevent blowing up the LLM context limits with 100-page papers
      });
      await page.close();
    } catch (e) {
      console.error(`Failed to scrape ${url} with Playwright:`, e);
    }
  }
  
  await browser.close();
  return results;
}
