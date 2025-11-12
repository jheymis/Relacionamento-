import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd handle this more gracefully.
  // For this context, we assume the key is available.
  console.warn("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const getChatSuggestion = async (userName: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a fun, flirty, and slightly playful opening line to send to someone named ${userName} on a dating app. It should be unique and engaging. Max 20 words.`,
      config: {
        temperature: 0.9,
      }
    });
    return response.text.replace(/"/g, ''); // Clean up quotes
  } catch (error) {
    console.error("Error generating chat suggestion:", error);
    return "Hey! How's your week going?";
  }
};

export const moderateMessage = async (message: string): Promise<boolean> => {
  try {
     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following message for abusive language, scams, or suspicious content. Respond with only "SAFE" or "UNSAFE". Message: "${message}"`,
      config: {
        temperature: 0.1,
      }
    });
    const result = response.text.trim().toUpperCase();
    return result === 'SAFE';
  } catch (error) {
    console.error("Error moderating message:", error);
    // Fail safe: if moderation fails, assume the message is safe to not block users unnecessarily.
    return true; 
  }
};
