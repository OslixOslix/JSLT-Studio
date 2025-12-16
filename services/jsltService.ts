import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export class JSLTService {
  /**
   * Transforms input JSON using JSLT schema via Gemini 2.5 Flash for speed and code capability.
   * Since there isn't a perfect Schibsted JSLT JS engine, we use the LLM to strictly emulate it.
   */
  static async transform(inputJson: string, jsltSchema: string): Promise<string> {
    const modelId = "gemini-2.5-flash";
    
    // Construct a specialized prompt to ensure strict JSLT syntax adherence
    const prompt = `
You are a strict execution engine for the Schibsted JSLT language (https://github.com/schibsted/jslt).
Your task is to transform the provided INPUT JSON using the provided JSLT SCHEMA and return ONLY the resulting JSON.

Rules:
1. Strict Adherence: Follow Schibsted JSLT syntax exactly (e.g., use of keys, loops, 'for', 'if', standard functions).
2. Output Only: Do not explain. Do not wrap in markdown code blocks. Return raw JSON text only.
3. Error Handling: If the Schema is syntactically invalid or the Input cannot be processed, return a JSON object with an "error" key explaining the issue specifically.

---
INPUT JSON:
${inputJson}

---
JSLT SCHEMA:
${jsltSchema}
    `;

    try {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          temperature: 0, // Deterministic output
          // We limit tokens to prevent hallucinations, but enough for large JSON
          maxOutputTokens: 8192, 
        }
      });

      let text = response.text || "";
      
      // Cleanup if the model accidentally wrapped it in markdown
      text = text.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');

      return text;
    } catch (e: any) {
      console.error("Transformation Error", e);
      return JSON.stringify({ 
        error: "Failed to connect to transformation service.", 
        details: e.message 
      }, null, 2);
    }
  }

  static validateJson(jsonStr: string): boolean {
    try {
      JSON.parse(jsonStr);
      return true;
    } catch (e) {
      return false;
    }
  }
}