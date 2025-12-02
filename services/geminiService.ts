import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SEOResult } from "../types";

// Initialize the client with the environment variable
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: {
      type: Type.STRING,
      description: "A catchy, concise English title for the sticker product (max 60 chars).",
    },
    description: {
      type: Type.STRING,
      description: "A compelling, SEO-rich English description for Redbubble.",
    },
    tags: {
      type: Type.STRING,
      description: "A list of 15-25 comma-separated high-ranking English keywords/tags.",
    },
  },
  required: ["title", "description", "tags"],
};

export const generateSEO = async (
  base64Image: string, 
  mimeType: string,
  descriptionLength: 'short' | 'long' = 'long'
): Promise<SEOResult> => {
  try {
    const modelId = "gemini-2.5-flash"; // Best for multimodal speed and accuracy

    const descriptionPrompt = descriptionLength === 'short'
      ? "2. Description: Write a concise, SEO-rich English description for Redbubble (1-2 sentences)."
      : "2. Description: Write a detailed, engaging English description for Redbubble (3-5 sentences) that tells a story and naturally weaves in keywords.";

    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `You are a top-tier SEO Expert for Redbubble and Print-on-Demand platforms for the year 2025. 
            Analyze the uploaded sticker design. 
            Generate optimized metadata strictly in ENGLISH.
            
            1. Title: Create a descriptive, catchy title that includes the main subject.
            ${descriptionPrompt}
            3. Tags: Generate 15 to 25 highly relevant tags. You MUST include:
               - Specific nouns and visual elements.
               - Color variations (e.g., "pastel pink", "neon blue", "monochrome").
               - Artistic styles (e.g., "watercolor", "minimalist", "retro", "vintage", "cartoon").
               - Moods and Emotions (e.g., "happy", "calm", "energetic", "peaceful").
               - Seasons and Holidays if applicable (e.g., "summer", "winter", "christmas", "halloween").
               - Potential use cases (e.g., "sticker pack", "laptop decal", "t-shirt design", "planner sticker").
               Format them as a single comma-separated string (e.g., "tag1, tag2, tag3").
            
            Return the result as a valid JSON object.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.4, // Lower temperature for more precise/factual tagging
      },
    });

    const jsonText = response.text;
    if (!jsonText) {
      throw new Error("No data returned from AI");
    }

    const data = JSON.parse(jsonText) as SEOResult;
    return data;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};