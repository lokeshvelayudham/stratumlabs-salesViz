export interface PubMedArticle {
  id: string;
  title: string;
  sourceUrl: string;
  abstractText: string;
}

/**
 * Searches PubMed for the given keywords and returns up to `maxResults` abstracts.
 */
export async function searchPubMed(keyword: string, maxResults: number = 3): Promise<PubMedArticle[]> {
  try {
    // 1. Search for IDs
    const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(keyword)}&retmode=json&retmax=${maxResults}&sort=pub+date`;
    const searchRes = await fetch(searchUrl);
    
    if (!searchRes.ok) throw new Error("Failed to search PubMed");
    
    const searchData = await searchRes.json();
    const ids: string[] = searchData.esearchresult?.idlist || [];
    
    if (ids.length === 0) return [];

    // 2. Fetch the text abstracts for those IDs
    const results: PubMedArticle[] = [];
    
    for (const id of ids) {
      // Efetch with rettype=abstract & retmode=text gives a readable string containing title, authors, affiliation, and abstract.
      const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${id}&retmode=text&rettype=abstract`;
      const txtRes = await fetch(fetchUrl);
      
      if (!txtRes.ok) continue;
      
      const abstractText = await txtRes.text();
      
      results.push({
        id,
        title: `PubMed Article ${id}`, // Efetch text has the real title inside, we let the LLM extract it
        sourceUrl: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        abstractText: abstractText.trim()
      });
      
      // Be nice to the NCBI API (max 3 req/sec without API key)
      await new Promise(resolve => setTimeout(resolve, 350));
    }

    return results;
  } catch (error) {
    console.error("PubMed Scraper Error:", error);
    return [];
  }
}
