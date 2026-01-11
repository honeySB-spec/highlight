import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Sends text to Gemini to identify key sentences for highlighting.
 * We ask for exact string matches to ensure we can locate them in the PDF.
 */
export const identifyImportantQuotes = async (pageText: string): Promise<string[]> => {
  if (!pageText || pageText.trim().length < 50) return [];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Analyze the following text from a page of study notes. 
        Identify the 3-5 most critical sentences, definitions, or key takeaways that should be highlighted for a student reviewing this material.
        
        CRITICAL INSTRUCTION: Return the EXCERPTS EXACTLY as they appear in the text. Do not paraphrase. Do not change punctuation. 
        If the text is messy, just pick the clean parts that are important.
        
        Text to analyze:
        """
        ${pageText.substring(0, 10000)}
        """
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING
          }
        }
      }
    });

    if (response.text) {
      let cleanText = response.text.trim();
      // Remove markdown code blocks if present (common with LLM JSON output)
      if (cleanText.startsWith('```')) {
        cleanText = cleanText.replace(/^```(json)?\n?/, '').replace(/\n?```$/, '');
      }
      
      try {
        const quotes = JSON.parse(cleanText) as string[];
        // Filter out very short quotes that might match too many things (like "The")
        return quotes.filter(q => q && q.length > 10);
      } catch (e) {
        console.warn("Failed to parse JSON from Gemini:", cleanText);
        return [];
      }
    }
    return [];
  } catch (error) {
    console.error("Gemini analysis failed:", error);
    return [];
  }
};