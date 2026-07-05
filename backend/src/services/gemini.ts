import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const apiKey = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey });

export async function askGemini(contents: string) {
  if (!apiKey) return "GEMINI_API_KEYが設定されていません。";
  try {
    const interaction = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents,
    });
    return interaction.text;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
