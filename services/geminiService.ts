
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
        contents: `You are helping shape a polished portfolio case study.

Project title: "${title || "n/a"}"
Project type / role: "${category || "n/a"}"
Creator context / client brief:
"${context}"

Tasks:
- If the current project name is weak or generic, propose a sharper, portfolio-ready title (max 6 words).
- If the project type/role is unclear, propose a clear category label (e.g. "Product Design", "Creative Technology", "Brand System", "Motion System").
- Recommend the most appropriate grid system for this project, choosing one label from:
  "12-Col Responsive", "A4 Print", "Broadcast Safe 16:9", "Flexible Masonry", "Golden Ratio", "Dashboard 12-Col", "No-Grid", "Multi-format".
- Write:
  - Description: max 2 sentences, high-level project summary.
  - Challenge: short, punchy explanation of the core problem.
  - Execution: brief, tool- and process-focused description.
  - Result: concise outcome with impact.
- Suggest 6 sharp technical tags (no sentences, just keywords).

Return a single JSON object only.`,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "Refined project title (max 6 words)" },
              category: { type: Type.STRING, description: "Refined project category / role label" },
              gridSystem: { type: Type.STRING, description: "One of the predefined grid system labels" },
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
