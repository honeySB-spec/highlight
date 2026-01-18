import { CreateMLCEngine, MLCEngine, type InitProgressCallback } from "@mlc-ai/web-llm";

// Using a smaller, faster model optimized for web
const SELECTED_MODEL = "Llama-3.2-3B-Instruct-q4f32_1-MLC";

export interface AnalysisResult {
    phrase: string;
    details: string;
}

export class AIAnalyzer {
    private engine: MLCEngine | null = null;

    async initialize(onProgress: InitProgressCallback) {
        if (this.engine) return;

        try {
            this.engine = await CreateMLCEngine(
                SELECTED_MODEL,
                { initProgressCallback: onProgress }
            );
        } catch (error) {
            console.error("Failed to initialize WebLLM:", error);
            throw error;
        }
    }

    async analyzeText(text: string): Promise<AnalysisResult[]> {
        if (!this.engine) {
            throw new Error("Engine not initialized");
        }

        const prompt = `Please read through this text carefully. Identify and extract the most important key points, main ideas, and crucial facts that are essential for understanding the content. Summarize these points concisely and highlight them directly within the context.
        
        You must output ONLY a valid JSON list of objects. Do not add any markdown formatting or explanation.
        Format: [{"phrase": "exact text from source", "details": "reason for importance"}]
        
        Rules:
        1. "phrase" MUST match the text in the source EXACTLY. copy-paste style.
        2. "details" should range from a few words to a sentence.
        
        Text:
        ${text}
        `;

        try {
            const response = await this.engine.chat.completions.create({
                messages: [{ role: "user", content: prompt }],
                temperature: 0.1, // Low temperature for factual extraction
                response_format: { type: "json_object" }
            });

            const content = response.choices[0]?.message?.content || "[]";

            // Cleanup and parse
            const cleaned = content.replace(/```json/g, '').replace(/```/g, '').trim();
            try {
                const parsed = JSON.parse(cleaned);
                if (Array.isArray(parsed)) return parsed;
                if (parsed.highlights && Array.isArray(parsed.highlights)) return parsed.highlights;
                return [];
            } catch (e) {
                console.warn("JSON parse failed, trying partial recovery", e);
                return [];
            }

        } catch (error) {
            console.error("Analysis failed:", error);
            return [];
        }
    }
}

export const aiAnalyzer = new AIAnalyzer();
