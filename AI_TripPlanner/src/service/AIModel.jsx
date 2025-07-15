// src/utils/genaiClient.js
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GOOGLE_PLACE_AI_API_KEY,
});

export const generateTravelPlan = async (prompt) => {
  const contents = [
    {
      role: "user",
      parts: [{ text: prompt }],
    },
  ];

  const config = {
    thinkingConfig: {
      thinkingBudget: -1,
    },
    tools: [{ googleSearch: {} }],
    responseMimeType: "text/plain",
  };

  const model = "gemini-2.5-pro";

  const response = await ai.models.generateContentStream({
    model,
    config,
    contents,
  });

  let result = "";
  for await (const chunk of response) {
    result += chunk.text;
  }

  return result;
};
