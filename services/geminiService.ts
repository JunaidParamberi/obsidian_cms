
import { GoogleGenAI, Type } from "@google/genai";

const SYSTEM_INSTRUCTION = `You are an elite creative strategist and portfolio copywriter for Junaid Paramberi. 
Junaid is a Creative Technologist with expertise in Branding, UI/UX, Motion, and Software Development.
Your tone is professional, high-end, technical, and impact-driven. 
Never use fluff. Focus on problem-solving and measurable results.`;

export const geminiService = {
  async generateText(prompt: string): Promise<string> {
    try {
      if (!process.env.API_KEY) throw new Error("API Key Missing");
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          temperature: 0.7,
        }
      });
      return response.text || "";
    } catch (e: any) {
      console.error("Gemini generateText error:", e);
      return `[AI Error: ${e.message || "Failed to generate content"}]`;
    }
  },

  async magicFillProject(title: string, category: string, context: string) {
    try {
      if (!process.env.API_KEY) throw new Error("API Key Missing");

      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Generate a concise case study for a project titled "${title}" in the category "${category}".
        User Context: "${context}"
        
        Requirements:
        - Description: Max 2 sentences.
        - Challenge: Short, punchy explanation of the problem.
        - Execution: Brief overview of the process/tools.
        - Outcome: Quick summary of the result.
        - Tags: 6 relevant technical tags.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              description: { type: Type.STRING, description: "Short project summary (max 2 sentences)" },
              challenge: { type: Type.STRING, description: "Concise challenge text" },
              execution: { type: Type.STRING, description: "Brief execution text" },
              result: { type: Type.STRING, description: "Short outcome text" },
              tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "6 technical tags" }
            },
            required: ["description", "challenge", "execution", "result", "tags"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (e) {
      console.error("Gemini magicFillProject error:", e);
      throw e;
    }
  }
};
